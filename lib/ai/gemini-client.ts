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

// 1. Primary model for trip planning, mutations, and structured itinerary proposals
export const GEMINI_TRIPS_MODELS = [
  process.env.GEMINI_TRIPS_MODEL || "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
] as const;

// 2. High-speed Flash Lite model for common chat, responses, and travel essentials
export const GEMINI_CONVERSATIONAL_MODELS = [
  process.env.GEMINI_CONVERSATIONAL_MODEL || "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
] as const;

export const GEMINI_TRIPS_MODEL = GEMINI_TRIPS_MODELS[0];
export const GEMINI_CONVERSATIONAL_MODEL = GEMINI_CONVERSATIONAL_MODELS[0];
export const GEMINI_MODEL = GEMINI_TRIPS_MODEL;
