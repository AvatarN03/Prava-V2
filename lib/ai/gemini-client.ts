import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;

/**
 * Server-only wrapper to obtain the Gemini GenAI client singleton.
 * Returns null if GEMINI_API_KEY is not configured in the environment.
 */
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }

  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }

  return genAIClient;
}

export {
  GEMINI_TRIPS_MODELS,
  GEMINI_CONVERSATIONAL_MODELS,
  GEMINI_TRIPS_MODEL,
  GEMINI_CONVERSATIONAL_MODEL,
  GEMINI_MODEL,
} from "./models";
