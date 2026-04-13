import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Export the initialized Gemini instance
export default genAI;