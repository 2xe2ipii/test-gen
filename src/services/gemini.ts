import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ExamConfigData, Question } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Missing Gemini API Key");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateExam = async (textContext: string, config: ExamConfigData): Promise<Question[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert exam creator. Create a structured exam based strictly on the provided text.
    
    Configuration:
    - Total Questions: ${config.totalItems}
    - Multiple Choice: ${config.distribution.multipleChoice}
    - Identification: ${config.distribution.identification}
    - Fill in the Blanks: ${config.distribution.fillInTheBlanks}
    
    Output Format:
    Return ONLY a raw JSON array. Do not use Markdown formatting (no \`\`\`json). 
    The array should contain objects with this structure:
    {
      "id": number (sequence starting from 1),
      "type": "multiple-choice" | "identification" | "fill-in-the-blanks",
      "question": "string",
      "options": ["string", "string", "string", "string"] (ONLY for multiple-choice, include 4 options),
      "correctAnswer": "string" (Must match one of the options exactly if multiple-choice)
    }

    Text Content to base questions on:
    ${textContext.substring(0, 50000)} 
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the text just in case the AI adds markdown blocks
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedText) as Question[];
  } catch (error) {
    console.error("Error generating exam:", error);
    throw error;
  }
};