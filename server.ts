import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON request body parser
  app.use(express.json({ limit: "15mb" }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Secure server-side Gemini Analyze Course Materials proxy
  app.post("/api/analyze-materials", async (req: express.Request, res: express.Response) => {
    try {
      const { courseName, materialsText } = req.body;
      if (!courseName || !materialsText) {
        return res.status(400).json({ error: "Missing courseName or materialsText" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

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
      res.json(result);
    } catch (error: any) {
      console.error("Error in /api/analyze-materials:", error);
      res.status(500).json({ error: error.message || "Failed to analyze materials" });
    }
  });

  // Secure server-side Gemini Generate Study Material proxy
  app.post("/api/generate-study-material", async (req: express.Request, res: express.Response) => {
    try {
      const { topic, context, difficulty, count } = req.body;
      if (!topic || !context) {
        return res.status(400).json({ error: "Missing topic or context" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const parsedCount = Number(count) || 15;
      const parsedDifficulty = difficulty || "Medium";

      const prompt = `
        You are an expert academic tutor. Based on the following topic and context from past exam papers, generate a comprehensive study package.
        
        Topic: ${topic}
        Context: ${context}
        Difficulty Level: ${parsedDifficulty}
        Target Number of Flashcards: ${parsedCount}
        Target Number of Quiz Questions: ${parsedCount}
        
        The package must include:
        1. Short, concise study notes (Markdown format).
        2. Exactly ${parsedCount} Flashcards (Front/Back) tailored to ${parsedDifficulty} difficulty.
        3. Exactly ${parsedCount} multiple choice quiz questions with explanations tailored to ${parsedDifficulty} difficulty.
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

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/generate-study-material:", error);
      res.status(500).json({ error: error.message || "Failed to generate study materials" });
    }
  });

  // Secure server-side Gemini Chat proxy
  app.post("/api/chat", async (req: express.Request, res: express.Response) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Missing message text" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const chat = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction: "You are a helpful academic assistant for GCTU students. Answer questions based on the course materials and exam predictions provided. Be concise and accurate."
        }
      });

      const response = await chat.sendMessage({ message: text });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({ error: error.message || "Failed to execute chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

