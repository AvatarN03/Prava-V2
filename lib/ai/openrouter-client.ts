/**
 * OpenRouter client with automated 3-tier cascade across active free models:
 * 1. google/gemma-4-31b-it:free (Google's latest reasoning model, 262k context)
 * 2. nvidia/nemotron-3.5-lightning:free (NVIDIA reasoning model, 1,000,000 context)
 * 3. openrouter/free (OpenRouter dynamic auto-router across all available free models)
 */

export const OPENROUTER_FREE_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "openrouter/free",
  "google/gemma-4-31b-it:free",
] as const;

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenRouterOptions {
  messages: OpenRouterMessage[];
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
}

export interface OpenRouterResult {
  success: boolean;
  text: string;
  modelUsed: string;
  error?: string;
}

export function hasOpenRouterKey(): boolean {
  const key = process.env.OPENROUTER_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

/**
 * Execute chat completion via OpenRouter with sequential fallback across active free models.
 */
export async function callOpenRouterFree(
  options: OpenRouterOptions
): Promise<OpenRouterResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const payloadMessages: OpenRouterMessage[] = [];

  if (options.systemInstruction) {
    payloadMessages.push({
      role: "system",
      content: options.systemInstruction,
    });
  }

  payloadMessages.push(...options.messages);

  let lastError = "";

  // Iterate sequentially through the free models cascade
  for (const model of OPENROUTER_FREE_MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
          temperature: options.temperature ?? 0.6,
          max_tokens: options.maxTokens ?? 1500,
          response_format: options.responseFormat,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`OpenRouter free model [${model}] returned status ${response.status}:`, errorText);
        lastError = `Model ${model} error (${response.status})`;
        // If rate-limited (429) or overloaded (503/504), cascade to next free model
        continue;
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;

      if (content && typeof content === "string" && content.trim().length > 0) {
        return {
          success: true,
          text: content.trim(),
          modelUsed: model,
        };
      }
    } catch (err) {
      console.warn(`OpenRouter request failed for model [${model}]:`, err);
      lastError = err instanceof Error ? err.message : "Network error";
    }
  }

  return {
    success: false,
    text: "",
    modelUsed: "none",
    error: lastError || "All free models in cascade were busy or unavailable.",
  };
}
