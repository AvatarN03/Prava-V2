import { stripReasoning } from "./openrouter-client";

/**
 * Ultra-fast Groq models (in priority order).
 * Provides generous free tier and <1s latency.
 */
export const GROQ_MODELS = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
] as const;

export interface GroqMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GroqOptions {
  messages: GroqMessage[];
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
  models?: readonly string[] | string[];
}

export interface GroqResult {
  success: boolean;
  text: string;
  modelUsed: string;
  error?: string;
}

export function hasGroqKey(): boolean {
  const key = process.env.GROQ_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

/**
 * Execute chat completion via Groq with sequential fallback across active models.
 */
export async function callGroqChat(
  options: GroqOptions
): Promise<GroqResult | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const payloadMessages: GroqMessage[] = [];

  if (options.systemInstruction) {
    payloadMessages.push({
      role: "system",
      content: options.systemInstruction,
    });
  }

  payloadMessages.push(...options.messages);

  let lastError = "";
  const modelsToTry =
    options.models && options.models.length > 0 ? options.models : GROQ_MODELS;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: payloadMessages,
            temperature: options.temperature ?? 0.2,
            max_tokens: options.maxTokens ?? 1500,
            response_format: options.responseFormat,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(
          `Groq model [${model}] returned status ${response.status}:`,
          errorText
        );
        lastError = `Groq ${model} error (${response.status})`;
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
      console.warn(`Groq request failed for model [${model}]:`, err);
      lastError = err instanceof Error ? err.message : "Network error";
    }
  }

  return {
    success: false,
    text: "",
    modelUsed: "none",
    error: lastError || "All Groq models were busy or unavailable.",
  };
}
