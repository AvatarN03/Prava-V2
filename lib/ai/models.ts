/**
 * Centralized AI Model Catalog & Free Cascades
 *
 * Single source of truth for all LLM model identifiers across Google Gemini,
 * OpenRouter, Groq, and OpenCode Zen.
 * Update model strings here whenever provider free tiers or model versions change.
 */

// ─── 1. Google Gemini (Official @google/genai SDK) ───────────────────────────

export const GEMINI_TRIPS_MODELS = [
  process.env.GEMINI_TRIPS_MODEL || "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
] as const;

export const GEMINI_CONVERSATIONAL_MODELS = [
  process.env.GEMINI_CONVERSATIONAL_MODEL || "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
] as const;

export const GEMINI_TRIPS_MODEL = GEMINI_TRIPS_MODELS[0];
export const GEMINI_CONVERSATIONAL_MODEL = GEMINI_CONVERSATIONAL_MODELS[0];
export const GEMINI_MODEL = GEMINI_TRIPS_MODEL;

// ─── 2. OpenRouter Free Tier Cascade ─────────────────────────────────────────

export const OPENROUTER_FREE_MODELS = [
  "nvidia/nemotron-3.5-lightning:free", // NVIDIA reasoning (1M context)
  "nex-agi/nex-n2.5-pro:free",          // High-accuracy reasoning
  "openrouter/free",                     // OpenRouter dynamic router
] as const;

// ─── 3. Groq High-Speed LPU Models ───────────────────────────────────────────

export const GROQ_MODELS = [
  "qwen/qwen3.8-27b",   // Fast general reasoning
  "openai/gpt-oss-120b", // High-capacity open weights
  "openai/gpt-oss-20b",  // Ultra-fast lightweight
] as const;

// ─── 4. OpenCode Zen Free Models Cascade ─────────────────────────────────────

export const OPENCODE_ZEN_FREE_MODELS = [
  "minimax-m2.5-free",          // SOTA coding & structured reasoning
  "minimax-m3-free",            // Next-gen high capability
  "mimo-v2.6-flash-free",       // Ultra-fast lightweight model
  "mimo-v2.5-free",             // Stable fast conversational
  "qwen3.6-plus-free",          // Multilingual & instruction following
  "deepseek-v4-flash-free",     // Low-latency DeepSeek reasoning
  "nemotron-3.5-lightning-free",// NVIDIA high-context model
  "nemotron-3-super-free",      // NVIDIA reasoning model
  "big-pickle",                 // Resilient fallback
] as const;
