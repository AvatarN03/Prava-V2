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

// Configurable model name with fallback to high-quota Flash Lite tier (500–1,500 RPD)
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
