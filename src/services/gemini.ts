import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ExamConfigData, Question } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Simple check to ensure key exists
if (!API_KEY) {
  console.error("Missing Gemini API Key");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateExam = async (textContext: string, config: ExamConfigData): Promise<Question[]> => {
  // UPDATED: 'gemini-1.5-flash' is retired. Using the current 'gemini-2.5-flash'.
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
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
    ${textContext.substring(0, 50000)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini Raw Response:", text);

    return JSON.parse(text) as Question[];
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // If 2.5 fails, it might be a region issue, but 1.5 is definitely dead.
    throw new Error(error.message || "Unknown Gemini API Error");
  }
};