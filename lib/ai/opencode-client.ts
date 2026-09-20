import { stripReasoning } from "./openrouter-client";

/**
 * OpenCode Zen free chat models (in priority order).
 * OpenCode Zen provides an OpenAI-compatible API endpoint at https://opencode.ai/zen/v1
 */
export const OPENCODE_ZEN_FREE_MODELS = [
  "nemotron-3.5-lightning-free",
  "nemotron-3-ultra-free",
  "mimo-v2.5-free",
  "ling-3.0-flash-fin-free",
  "deepseek-v4-flash-free",
] as const;

export interface OpenCodeMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenCodeOptions {
  messages: OpenCodeMessage[];
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
  models?: readonly string[] | string[];
}

export interface OpenCodeResult {
  success: boolean;
  text: string;
  modelUsed: string;
  error?: string;
}

export function hasOpenCodeKey(): boolean {
  const key = process.env.OPENCODE_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

/**
 * Execute chat completion via OpenCode Zen with sequential fallback across active free models.
 */
export async function callOpenCodeZenFree(
  options: OpenCodeOptions
): Promise<OpenCodeResult | null> {
  const apiKey = process.env.OPENCODE_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const payloadMessages: OpenCodeMessage[] = [];

  if (options.systemInstruction) {
    payloadMessages.push({
      role: "system",
      content: options.systemInstruction,
    });
  }

  payloadMessages.push(...options.messages);

  let lastError = "";
  const modelsToTry =
    options.models && options.models.length > 0
      ? options.models
      : OPENCODE_ZEN_FREE_MODELS;

  for (const model of modelsToTry) {
    try {
      const response = await fetch("https://opencode.ai/zen/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://prava.app",
          "X-Title": "Prava AI Travel Workspace",
        },
        body: JSON.stringify({
          model,
          messages: payloadMessages,
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 1500,
          response_format: options.responseFormat,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(
          `OpenCode Zen free model [${model}] returned status ${response.status}:`,
          errorText
        );
        if (response.status === 403 && errorText.includes("FreeTierError")) {
          lastError = "OpenCode Zen free tier is restricted to official OpenCode client";
        } else {
          lastError = `OpenCode Zen (${model}): ${response.status}`;
        }
        continue;
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;

      if (content && typeof content === "string" && content.trim().length > 0) {
        return {
          success: true,
          text: stripReasoning(content.trim()),
          modelUsed: model,
        };
      }
    } catch (err) {
      console.warn(`OpenCode Zen request failed for model [${model}]:`, err);
      lastError = err instanceof Error ? err.message : "Network error";
    }
  }

  return {
    success: false,
    text: "",
    modelUsed: "none",
    error: lastError || "All OpenCode Zen free models were busy or unavailable.",
  };
}
