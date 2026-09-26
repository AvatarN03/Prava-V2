import {
  callOpenAiCompatible,
  type GatewayMessage,
  type GatewayOptions,
  type GatewayResult,
} from "./gateway";

import { GROQ_MODELS } from "./models";
export { GROQ_MODELS };

export type GroqMessage = GatewayMessage;
export type GroqOptions = GatewayOptions;
export type GroqResult = GatewayResult;

export function hasGroqKey(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

/**
 * Execute chat completion via Groq with sequential fallback across active models.
 */
export async function callGroqChat(
  options: GroqOptions
): Promise<GroqResult | null> {
  return callOpenAiCompatible(
    {
      name: "Groq",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: process.env.GROQ_API_KEY,
      defaultModels: GROQ_MODELS,
      defaultTemperature: 0.2,
    },
    options
  );
}
