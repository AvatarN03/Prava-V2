import {
  callOpenAiCompatible,
  type GatewayMessage,
  type GatewayOptions,
  type GatewayResult,
} from "./gateway";

import { OPENCODE_ZEN_FREE_MODELS } from "./models";
export { OPENCODE_ZEN_FREE_MODELS };

export type OpenCodeMessage = GatewayMessage;
export type OpenCodeOptions = GatewayOptions;
export type OpenCodeResult = GatewayResult;

export function hasOpenCodeKey(): boolean {
  return Boolean(process.env.OPENCODE_API_KEY?.trim());
}

/**
 * Execute chat completion via OpenCode Zen with sequential fallback across active free models.
 */
export async function callOpenCodeZenFree(
  options: OpenCodeOptions
): Promise<OpenCodeResult | null> {
  return callOpenAiCompatible(
    {
      name: "OpenCode Zen",
      endpoint: "https://opencode.ai/zen/v1/chat/completions",
      apiKey: process.env.OPENCODE_API_KEY,
      defaultModels: OPENCODE_ZEN_FREE_MODELS,
      defaultTemperature: 0.3,
      extraHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://prava.app",
        "X-Title": "Prava AI Travel Workspace",
      },
      transformError: (status, errorText) => {
        if (status === 403 && errorText.includes("FreeTierError")) {
          return "OpenCode Zen free tier is restricted to official OpenCode client";
        }
        return null;
      },
    },
    options
  );
}
