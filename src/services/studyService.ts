import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { StudyMaterial, ChatMessage } from "../types";

export async function generateStudyMaterial(
  courseId: string, 
  topic: string, 
  context: string,
  count: number = 15,
  difficulty: string = 'Medium'
): Promise<StudyMaterial> {
  try {
    const apiResponse = await fetch("/api/generate-study-material", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ topic, context, difficulty, count })
    });

    if (!apiResponse.ok) {
      const errData = await apiResponse.json().catch(() => ({}));
      throw new Error(errData.error || `Server error: ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    
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

    // Generate AI response via proxy
    const apiResponse = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    if (!apiResponse.ok) {
      const errData = await apiResponse.json().catch(() => ({}));
      throw new Error(errData.error || `Server error: ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    
    const aiMsg: Omit<ChatMessage, 'id'> = {
      courseId,
      role: 'model',
      text: data.text,
      createdAt: new Date().toISOString()
    };
    
    const aiDocRef = await addDoc(collection(db, 'courses', courseId, 'chat'), aiMsg);
    return { id: aiDocRef.id, ...aiMsg };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `courses/${courseId}/chat`);
    throw error;
  }
}

