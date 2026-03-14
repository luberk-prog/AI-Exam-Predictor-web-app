import { GoogleGenAI, Type } from "@google/genai";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { StudyMaterial, Flashcard, QuizQuestion, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateStudyMaterial(
  courseId: string, 
  topic: string, 
  context: string,
  count: number = 15,
  difficulty: string = 'Medium'
): Promise<StudyMaterial> {
  try {
    const prompt = `
      You are an expert academic tutor. Based on the following topic and context from past exam papers, generate a comprehensive study package.
      
      Topic: ${topic}
      Context: ${context}
      Difficulty Level: ${difficulty}
      Target Number of Flashcards: ${count}
      Target Number of Quiz Questions: ${count}
      
      The package must include:
      1. Short, concise study notes (Markdown format).
      2. Exactly ${count} Flashcards (Front/Back) tailored to ${difficulty} difficulty.
      3. Exactly ${count} multiple choice quiz questions with explanations tailored to ${difficulty} difficulty.
      4. A specific, high-quality YouTube video recommendation (Title and URL) that is best for learning this topic.
      
      Return the data in the specified JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            notes: { type: Type.STRING },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING }
                },
                required: ["front", "back"]
              }
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            },
            youtubeVideo: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["title", "url"]
            }
          },
          required: ["notes", "flashcards", "quiz", "youtubeVideo"]
        }
      }
    });

    const data = JSON.parse(response.text);
    
    const material: Omit<StudyMaterial, 'id'> = {
      courseId,
      topic,
      notes: data.notes,
      flashcards: data.flashcards.map((f: any, i: number) => ({ ...f, id: `fc-${i}-${Date.now()}` })),
      quiz: data.quiz.map((q: any, i: number) => ({ ...q, id: `q-${i}-${Date.now()}` })),
      youtubeUrl: data.youtubeVideo.url,
      youtubeVideoTitle: data.youtubeVideo.title,
      difficulty,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'courses', courseId, 'studyMaterials'), material);
    return { id: docRef.id, ...material };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `courses/${courseId}/studyMaterials`);
    throw error;
  }
}

export async function sendChatMessage(courseId: string, text: string, history: ChatMessage[]): Promise<ChatMessage> {
  try {
    // Save user message
    const userMsg: Omit<ChatMessage, 'id'> = {
      courseId,
      role: 'user',
      text,
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'courses', courseId, 'chat'), userMsg);

    // Generate AI response
    const chat = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction: "You are a helpful academic assistant for GCTU students. Answer questions based on the course materials and exam predictions provided. Be concise and accurate."
      }
    });

    // We could pass history here if needed, but for simplicity we'll just send the current message
    // or a limited history.
    const response = await chat.sendMessage({ message: text });
    
    const aiMsg: Omit<ChatMessage, 'id'> = {
      courseId,
      role: 'model',
      text: response.text,
      createdAt: new Date().toISOString()
    };
    
    const aiDocRef = await addDoc(collection(db, 'courses', courseId, 'chat'), aiMsg);
    return { id: aiDocRef.id, ...aiMsg };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `courses/${courseId}/chat`);
    throw error;
  }
}
