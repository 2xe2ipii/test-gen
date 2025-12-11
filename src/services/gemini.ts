import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ExamConfigData, Question } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Missing Gemini API Key");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// PRIORITY LIST BASED ON YOUR LOGS
// We strip "models/" because the SDK often prefers the raw ID.
const MODEL_PRIORITY = [
  "gemini-2.5-flash-lite", // 1. Try the newest lightweight model
  "gemini-2.5-flash",      // 2. Try the newest standard model
  "gemini-2.0-flash-lite", // 3. Fallback to 2.0 (Very stable)
  "gemini-2.0-flash"       // 4. Last resort
];

export const generateExam = async (textContext: string, config: ExamConfigData): Promise<Question[]> => {
  let lastError: any = null;

  // Loop through our prioritized list of models
  for (const modelName of MODEL_PRIORITY) {
    try {
      console.log(`🤖 Attempting to generate exam using: ${modelName}...`);
      
      const model = genAI.getGenerativeModel({ 
        model: modelName, 
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const prompt = `
        Create an exam based strictly on the provided text.
        
        Configuration:
        - Total Items: ${config.totalItems}
        - Multiple Choice Questions: ${config.distribution.multipleChoice}
        - Identification Questions: ${config.distribution.identification}
        - Fill in the Blanks Questions: ${config.distribution.fillInTheBlanks}
        
        Structure:
        Return a JSON Array of objects with these keys:
        - id (number)
        - type (string: "multiple-choice", "identification", or "fill-in-the-blanks")
        - question (string)
        - options (array of strings, ONLY for multiple-choice)
        - correctAnswer (string)

        Text Content:
        ${textContext.substring(0, 45000)}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ Success with ${modelName}!`);
      
      // Parse and return
      return JSON.parse(text) as Question[];

    } catch (error: any) {
      console.warn(`⚠️ Failed with ${modelName}:`, error.message);
      lastError = error;
      
      // Critical Check: If the API Key is invalid, stop immediately. Don't retry.
      if (error.message.includes("API key not valid") || error.message.includes("403")) {
        throw new Error("Invalid API Key. Please check your .env file.");
      }

      // If it's a 503 (Overloaded) or 404 (Not Found), we just continue the loop to the next model.
      continue;
    }
  }

  // If we get here, every single model failed.
  console.error("❌ All models failed.");
  throw new Error(`Failed to generate exam. Servers are likely very busy. Last error: ${lastError?.message}`);
};