import { GoogleGenAI, Type } from "@google/genai";
import { ExamAnalysis, PredictedQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeCourseMaterials(
  courseName: string,
  materialsText: string
): Promise<{ analysis: Omit<ExamAnalysis, 'courseId' | 'updatedAt'>, questions: Omit<PredictedQuestion, 'id' | 'courseId' | 'createdAt'>[] }> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    You are an expert academic examiner. Analyze the following course materials for the course "${courseName}".
    The materials are categorized into "LECTURE MATERIALS & NOTES" and "PAST PAPERS, ASSIGNMENTS & MIDSEMS".
    
    Use the "PAST PAPERS, ASSIGNMENTS & MIDSEMS" section primarily to identify recurring question patterns and frequency of topics.
    Use the "LECTURE MATERIALS & NOTES" section to understand the depth and scope of topics as taught by the lecturer.
    
    Identify the most likely exam topics, their probability of appearing, repeated questions (if any patterns exist), and a ranked study priority list.
    
    CRITICAL INSTRUCTION FOR PROBABILITIES:
    - The probabilities should be highly polarized based on the evidence in the materials.
    - The most likely topic(s) should have a probability close to 100% (e.g., 85-98%) if there is strong evidence (repeated mentions, past paper frequency).
    - Do not be overly conservative; if a topic is clearly central, give it a high score.
    - Ensure the percentages reflect a clear hierarchy of importance.
    
    Also, generate 5 realistic predicted exam questions with brief explanations.
    
    Materials Content:
    ${materialsText}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: {
            type: Type.OBJECT,
            properties: {
              topics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    probability: { type: Type.NUMBER },
                    priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                    reasoning: { type: Type.STRING }
                  },
                  required: ["name", "probability", "priority", "reasoning"]
                }
              },
              repeatedQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    frequency: { type: Type.NUMBER }
                  },
                  required: ["question", "frequency"]
                }
              },
              studyPriority: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["topics", "repeatedQuestions", "studyPriority"]
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["question", "explanation"]
            }
          }
        },
        required: ["analysis", "questions"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  return result;
}
