/**
 * Shared OpenAI-compatible API gateway and reasoning-token stripper.
 * Powers OpenRouter, Groq, and OpenCode Zen with sequential fallback.
 */

export interface GatewayMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GatewayOptions {
  messages: GatewayMessage[];
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
  models?: readonly string[] | string[];
}

export interface GatewayResult {
  success: boolean;
  text: string;
  modelUsed: string;
  error?: string;
}

export interface GatewayProviderConfig {
  name: string;
  endpoint: string;
  apiKey: string | undefined;
  defaultModels: readonly string[];
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  extraHeaders?: Record<string, string>;
  extraBody?: Record<string, unknown>;
  transformError?: (status: number, errorText: string, model: string) => string | null;
}

/**
 * Strips reasoning tokens, <think> blocks, or "Here's a thinking process:" dumps
 * that reasoning models (like Nemotron, DeepSeek, Gemma, MiniMax) might emit.
 */
export function stripReasoning(text: string): string {
  if (!text) return "";
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
    .replace(
      /(?:^|\n)(?:Here's a thinking process:?|Thinking Process:?|Thinking:?)\s*[\s\S]*?(?=(?:\n\s*\n(?:[A-Z#*]|Hey|Hello|Hi|Current|The))|$)/gi,
      ""
    )
    .replace(
      /(?:^|\n)\d+\.\s+(?:Analyze User Input|Check Available Data|Identify Constraints|Gap Identification):[\s\S]*?(?=(?:\n\s*\n(?:[A-Z#*]|Hey|Hello|Hi|Current|The))|$)/gi,
      ""
    )
    .trim();

  return cleaned || text.trim();
}

/**
 * Shared dispatcher for any OpenAI-compatible completions endpoint.
 */
export async function callOpenAiCompatible(
  config: GatewayProviderConfig,
  options: GatewayOptions
): Promise<GatewayResult | null> {
  const apiKey = config.apiKey?.trim();
  if (!apiKey) return null;

  const payloadMessages: GatewayMessage[] = [];
  if (options.systemInstruction) {
    payloadMessages.push({ role: "system", content: options.systemInstruction });
  }
  payloadMessages.push(...options.messages);

  let lastError = "";
  const modelsToTry =
    options.models && options.models.length > 0 ? options.models : config.defaultModels;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...config.extraHeaders,
        },
        body: JSON.stringify({
          model,
          messages: payloadMessages,
          temperature: options.temperature ?? config.defaultTemperature ?? 0.4,
          max_tokens: options.maxTokens ?? config.defaultMaxTokens ?? 1500,
          response_format: options.responseFormat,
          ...config.extraBody,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(
          `[${config.name}] model [${model}] returned status ${response.status}:`,
          errorText
        );
        const customErr = config.transformError
          ? config.transformError(response.status, errorText, model)
          : null;
        lastError = customErr || `${config.name} (${model}): ${response.status}`;
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
      console.warn(`[${config.name}] request failed for model [${model}]:`, err);
      lastError = err instanceof Error ? err.message : "Network error";
    }
  }

  return {
    success: false,
    text: "",
    modelUsed: "none",
    error: lastError || `All ${config.name} models in cascade were unavailable.`,
  };
}
