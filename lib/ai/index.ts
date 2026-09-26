// Centralized Model Catalog
export * from "./models";

// Google Gemini Client
export { getGeminiClient } from "./gemini-client";

// Shared Gateway Types & Utilities
export {
  stripReasoning,
  callOpenAiCompatible,
  type GatewayMessage,
  type GatewayOptions,
  type GatewayResult,
  type GatewayProviderConfig,
} from "./gateway";

// OpenRouter Provider
export {
  callOpenRouterFree,
  hasOpenRouterKey,
  type OpenRouterMessage,
  type OpenRouterOptions,
  type OpenRouterResult,
} from "./openrouter-client";

// Groq Provider
export {
  callGroqChat,
  hasGroqKey,
  type GroqMessage,
  type GroqOptions,
  type GroqResult,
} from "./groq-client";

// OpenCode Zen Provider
export {
  callOpenCodeZenFree,
  hasOpenCodeKey,
  type OpenCodeMessage,
  type OpenCodeOptions,
  type OpenCodeResult,
} from "./opencode-client";
