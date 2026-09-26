import {
  callOpenAiCompatible,
  stripReasoning,
  type GatewayMessage,
  type GatewayOptions,
  type GatewayResult,
} from "./gateway";

import { OPENROUTER_FREE_MODELS } from "./models";
export { OPENROUTER_FREE_MODELS };

export type OpenRouterMessage = GatewayMessage;
export type OpenRouterOptions = GatewayOptions;
export type OpenRouterResult = GatewayResult;

export { stripReasoning };

export function hasOpenRouterKey(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

/**
 * Execute chat completion via OpenRouter with sequential fallback across active free models.
 */
export async function callOpenRouterFree(
  options: OpenRouterOptions
): Promise<OpenRouterResult | null> {
  return callOpenAiCompatible(
    {
      name: "OpenRouter",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultModels: OPENROUTER_FREE_MODELS,
      defaultTemperature: 0.6,
      extraHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://prava.app",
        "X-Title": "Prava AI Travel Workspace",
      },
      extraBody: { include_reasoning: false },
    },
    options
  );
}
