import { GoogleGenerativeAI } from "@google/generative-ai";

// We will set this in Step 6
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateExam = async (textContext: string, config: any) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Based on the following text content, generate an exam with ${config.totalItems} items.
    Distribution: 
    - ${config.distribution.multipleChoice} Multiple Choice
    - ${config.distribution.identification} Identification
    - ${config.distribution.fillInTheBlanks} Fill in the Blanks
    
    Return the response strictly as a JSON array of objects with keys: id, type, question, options (if MC), and correctAnswer.
    
    Text Content:
    ${textContext.substring(0, 30000)} // Limiting tokens for safety for now
  `;

  // Note: Real implementation needs JSON cleaning logic or strictly structured output mode
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text; // You will parse this JSON in the component
};