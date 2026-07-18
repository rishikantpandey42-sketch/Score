import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure Gemini API key exists
const apiKey = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload limits high enough for file upload contents
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      hasApiKey: !!apiKey 
    });
  });

  // AI Route: Parse questions from messy text
  app.post("/api/parse-questions", async (req, res) => {
    const { text, categoryId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No text content provided to parse" });
    }

    if (!apiKey) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured in environment variables. Please check the Secrets panel in AI Studio settings." 
      });
    }

    try {
      const prompt = `
You are a highly professional Quiz Question Parser for TMPS International School & College.
The user has uploaded/pasted text from their question file (which could be a messy Word document copy-paste, text file, list of questions, or tabular format).

Your task is to parse this raw text and extract all questions. Organize them into a clean structured JSON array of quiz questions.

For each question:
1. Identify the question text.
2. Identify the correct answer.
3. Identify the round it belongs to. Look for headings, labels or content. It MUST map to one of these standard rounds if possible, or use the heading in the text:
   - "Science"
   - "Social Science"
   - "Current Affairs"
   - "Sports"
   - "Rapid Fire"
   If the round is not obvious or matches none of these, map it to the most appropriate category or round name found in the document.
4. Extract any multiple choice options if present (as an array of 2-4 strings). If there are no options, do not include the "options" field.
5. Set the category to "${categoryId}" (either "category_1" or "category_2").

Output ONLY a JSON array of questions conforming to this TypeScript schema:
{
  id: string (a unique short string, e.g. "q-1", "q-2"),
  category: "category_1" | "category_2",
  round: string,
  questionText: string,
  correctAnswer: string,
  options?: string[]
}

Here is the raw input text to parse:
---
${text}
---

Return ONLY the parsed JSON array. Do not enclose it in markdown codeblocks except standard json ones.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING },
                round: { type: Type.STRING },
                questionText: { type: Type.STRING },
                correctAnswer: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["id", "category", "round", "questionText", "correctAnswer"]
            }
          }
        }
      });

      const parsedResponseText = response.text || "[]";
      const questions = JSON.parse(parsedResponseText.trim());

      res.json({ questions });
    } catch (error: any) {
      console.error("Gemini Parsing Error:", error);
      res.status(500).json({ 
        error: "Failed to parse questions using AI. " + (error.message || "Unknown error") 
      });
    }
  });

  // Handle Vite middleware or static server
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode with static file serving...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
