import { ThinkingLevel } from "@google/genai";
import {
  getGeminiClient,
  GEMINI_TRIPS_MODELS,
  GEMINI_CONVERSATIONAL_MODELS,
} from "@/lib/ai/gemini-client";
import {
  callOpenRouterFree,
  hasOpenRouterKey,
  OpenRouterMessage,
  stripReasoning,
} from "@/lib/ai/openrouter-client";
import {
  detectTravelToolIntent,
  executeCurrencyTool,
  executeWeatherTool,
  ToolExecutionResult,
} from "./travel-tools-dispatcher";
import { buildTripContext } from "./context-builder";
import {
  aiProposalPayloadSchema,
  AiProposalPayload,
} from "@/features/trip-workspace/ai/schema";

export interface AgentGraphInput {
  tripId: string;
  userId: string;
  prompt: string;
  history: Array<{ role: "user" | "model" | "system"; content: string }>;
  userCurrency?: string;
  preloadedContext?: Awaited<ReturnType<typeof buildTripContext>>;
  forceFreeFallback?: boolean;
  aiAutoPropose?: boolean;
}

export interface AgentGraphOutput {
  responseText: string;
  modelUsed: string;
  toolBadge?: string | null;
  proposalPayload?: AiProposalPayload | null;
}

/**
 * Classifies if a user prompt is asking to plan, generate, or mutate an itinerary or stay.
 * Robust against typos (e.g. 'ititnerary', 'itinary') and conversational follow-ups ('add them', 'try again').
 */
export function isItineraryPlanningIntent(
  prompt: string,
  history?: Array<{ role: string; content: string }>
): boolean {
  const p = prompt.toLowerCase().trim();

  const patterns = [
    // Typo-tolerant planning and creation patterns
    /\b(create|plan|generate|build|make|suggest|draft|design|organize|schedule|prepare|populate)\b.*\b(itinerar|ititnerar|itinera|itin|schedule|plan|activities|trip|route|days?)\b/i,
    /\b(itinerar|ititnerar|itinera|schedule|trip plan)\s+(for|of|to|in)\b/i,
    /\b(plan|schedule|populate)\s+(my|this|our|the)\s+trip\b/i,
    /\b(day\s*\d+|day-\d+)\b/i,
    // Conversational follow-ups: "add them", "go ahead add them", "add it", "add to itinerary", "add the places"
    /\b(?:go\s*ahead\s*(?:and\s*)?)?(?:add|put|insert|include|schedule)\s+(?:them|it|these|those|places|activities|spots|items)\b/i,
    /\b(add|insert|include|schedule|put|book)\b.*\b(to|into|on|in)\s+(?:my\s+)?(itinerar|ititnerar|itinera|plan|trip|schedule|day|workspace)\b/i,
    /\badd\s+the\s+(places|spots|activities|itinerary|plan)\b/i,
    /\b(add|book|reserve|change|move|delete|remove|cancel|replace)\s+(activity|activities|event|hotel|stay|lodging|restaurant|visit|stop|tour|flight)\b/i,
    /\b(add|schedule)\s+.*(at|on|for)\s+\d{1,2}(:\d{2})?\s*(am|pm)?\b/i,
    /\bwhat\s+should\s+i\s+do\s+on\s+day\b/i,
  ];

  if (patterns.some((rx) => rx.test(p))) {
    return true;
  }

  // Handle follow-ups/retries ("try again", "retry", "redo", "generate again", "do it")
  const isRetry =
    /\b(try\s+again|retry|redo|regenerate|do\s+it\s+again|repeat|yes\s+please|generate\s+it|yes\s+do\s+it|please\s+continue|continue)\b/i.test(
      p
    ) || p === "try" || p === "again";

  if (isRetry && history && history.length > 0) {
    const recent = history.slice(-3);
    const hadPlanningIntent = recent.some(
      (m) =>
        patterns.some((rx) => rx.test(m.content)) ||
        m.content.toLowerCase().includes("itinerary proposal") ||
        m.content.toLowerCase().includes("starter itinerary") ||
        m.content.toLowerCase().includes("proposal") ||
        m.content.toLowerCase().includes("itinerary")
    );
    if (hadPlanningIntent) {
      return true;
    }
  }

  return false;
}

/**
 * Attempts to parse or repair potentially truncated JSON from LLMs
 */
function tryParseOrRepairProposal(raw: string): unknown | null {
  try {
    return JSON.parse(raw);
  } catch {
    // Attempt auto-repair for truncated JSON arrays
    const lastObjectIdx = raw.lastIndexOf("}");
    if (lastObjectIdx !== -1) {
      const candidate = raw.substring(0, lastObjectIdx + 1);
      for (const suffix of ["]}", "}", "\n]}", "\n}"]) {
        try {
          return JSON.parse(candidate + suffix);
        } catch {
          // continue search
        }
      }
    }
  }
  return null;
}

/**
 * Extracts and parses json:proposal codeblock from LLM response.
 * Completely excises the JSON codeblock from user-visible text (even if cut off).
 */
function extractProposalBlock(text: string): {
  cleanedText: string;
  payload: AiProposalPayload | null;
} {
  // Strip any reasoning tokens, <think> tags, or chain-of-thought scratchpads first
  let cleaned = stripReasoning(text);

  // Match complete or unclosed json:proposal code block
  const proposalRegex = /```(?:json:proposal|proposal|json)\s*([\s\S]*?)(?:```|$)/i;
  const match = cleaned.match(proposalRegex);

  let payload: AiProposalPayload | null = null;

  if (match) {
    const rawJson = match[1].trim();
    const parsedData = tryParseOrRepairProposal(rawJson);
    if (parsedData) {
      const parsed = aiProposalPayloadSchema.safeParse(parsedData);
      if (parsed.success && parsed.data.changes.length > 0) {
        payload = parsed.data;
      }
    }
    // Always strip the entire proposal codeblock from the human-visible text
    cleaned = cleaned.replace(proposalRegex, "").trim();
  }

  // Remove any remaining raw JSON code blocks or developer citations (even if unclosed)
  cleaned = cleaned
    .replace(/(?:\*{0,2}Live Data Citation:?\*{0,2}\s*)?```(?:json)?\s*\{[\s\S]*?(?:```|$)/gi, "")
    .replace(/```(?:json:proposal|proposal|json)[\s\S]*?(?:```|$)/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Ensure no residual reasoning lines remain
  cleaned = stripReasoning(cleaned);

  if (!cleaned && payload) {
    cleaned = payload.summary;
  }

  return {
    cleanedText: cleaned || "I have prepared an itinerary proposal for your review below.",
    payload,
  };
}

/**
 * Executes the Trip Agent Graph:
 * - Itinerary Planning & Entity Mutations: Handled directly by Gemini 2.0 Flash Lite (generates proposals)
 * - Conversational Chat & Travel Essentials: Handled by OpenRouter Free Cascade (Nemotron 3.5 / openrouter/free)
 */
export async function runTripAgentGraph(
  input: AgentGraphInput
): Promise<AgentGraphOutput> {
  const {
    tripId,
    userId,
    prompt,
    history,
    userCurrency = "INR",
    preloadedContext,
    forceFreeFallback = false,
    aiAutoPropose = true,
  } = input;

  // 1. Resolve trip context (avoid duplicate PostgreSQL roundtrips)
  const context = preloadedContext || (await buildTripContext(tripId, userId));
  const destination = context?.destination || null;

  // 2. Classify intent: Planning/Mutation vs Conversational (with history awareness)
  const isPlanning = isItineraryPlanningIntent(prompt, history);

  // =========================================================================
  // PATH A: Itinerary Planning / Generation / Workspace Mutations (GEMINI)
  // =========================================================================
  if (isPlanning) {
    const gemini = getGeminiClient();
    if (!gemini) {
      return {
        responseText:
          "⚠️ **Gemini API Key Required**\nPlease configure `GEMINI_API_KEY` in your `.env` to enable AI itinerary proposals and workspace mutations.",
        modelUsed: "none",
        proposalPayload: null,
      };
    }

    const geminiContents = [
      ...history.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    let lastError: unknown = null;
    for (const model of GEMINI_TRIPS_MODELS) {
      try {
        const response = await gemini.models.generateContent({
          model,
          contents: geminiContents,
          config: {
            systemInstruction: aiAutoPropose
              ? (context?.proposalPrompt || "You are Prava AI travel assistant.")
              : (context?.conversationalPrompt || "You are Prava AI travel assistant."),
            temperature: 0.5,
            maxOutputTokens: 8192,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });

        const rawText = response.text || "";
        const { cleanedText, payload } = extractProposalBlock(rawText);

        return {
          responseText: cleanedText,
          modelUsed: model,
          proposalPayload: aiAutoPropose ? payload : null,
        };
      } catch (error) {
        console.warn(`Gemini trips model [${model}] failed, trying fallback:`, error);
        lastError = error;
      }
    }

    console.error("All Gemini itinerary proposal models failed:", lastError);
    return {
      responseText:
        "I encountered an issue generating your itinerary proposal. Please try again or rephrase your request.",
      modelUsed: GEMINI_TRIPS_MODELS[0],
      proposalPayload: null,
    };
  }

  // =========================================================================
  // PATH B: Conversational Q&A, Travel Essentials & Advice
  // Order: 1. Gemini 3.1 Flash Lite -> 2. NVIDIA Nemotron -> 3. OpenRouter Free
  // =========================================================================

  // Evaluate live Travel Essentials tools (Weather & Currency)
  let toolResult: ToolExecutionResult | null = null;
  const toolIntent = detectTravelToolIntent(prompt, destination, userCurrency);

  if (toolIntent.type === "weather" && toolIntent.params.city) {
    toolResult = await executeWeatherTool(String(toolIntent.params.city));
  } else if (toolIntent.type === "currency") {
    toolResult = await executeCurrencyTool(
      Number(toolIntent.params.amount) || 100,
      String(toolIntent.params.from) || "USD",
      String(toolIntent.params.to) || userCurrency
    );
  }

  // Build lightweight conversational instruction
  let conversationalInstruction =
    context?.conversationalPrompt ||
    "You are Prava AI, a friendly travel assistant. Speak in warm, conversational markdown. Never output raw JSON.";

  if (toolResult) {
    conversationalInstruction += `\n\n[CURRENT LIVE DATA]:\n${toolResult.summary}\n\nINSTRUCTIONS: Answer the traveler's question directly using this live information in friendly, warm markdown prose. State the numbers and conditions naturally. Do NOT output internal reasoning, chain-of-thought steps, or raw JSON.`;
  }

  // 1. Primary: Gemini 3.1 Flash Lite (High quota, 500–1,500 RPD) - Skipped if credits depleted
  const gemini = getGeminiClient();
  if (gemini && !forceFreeFallback) {
    const geminiContents = [
      ...history.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    for (const model of GEMINI_CONVERSATIONAL_MODELS) {
      try {
        const response = await gemini.models.generateContent({
          model,
          contents: geminiContents,
          config: {
            systemInstruction: conversationalInstruction,
            temperature: 0.6,
            maxOutputTokens: 1500,
          },
        });

        const rawText = response.text || "";
        const { cleanedText } = extractProposalBlock(rawText);

        return {
          responseText: cleanedText,
          modelUsed: model,
          toolBadge: toolResult ? toolResult.summary : null,
          proposalPayload: null,
        };
      } catch (err) {
        console.warn(`Gemini conversational model [${model}] failed, cascading:`, err);
      }
    }
  }

  // 2. Secondary & Tertiary: OpenRouter Free (NVIDIA Nemotron 3.5 -> OpenRouter Free)
  if (hasOpenRouterKey()) {
    const openRouterMessages: OpenRouterMessage[] = history.map((h) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: h.content,
    }));

    openRouterMessages.push({
      role: "user",
      content: prompt,
    });

    const openRouterRes = await callOpenRouterFree({
      messages: openRouterMessages,
      systemInstruction: conversationalInstruction,
      temperature: 0.6,
      maxTokens: 1000,
    });

    if (openRouterRes && openRouterRes.success && openRouterRes.text) {
      const { cleanedText } = extractProposalBlock(openRouterRes.text);
      const freeBadge = forceFreeFallback ? "⚡ Free Fallback (Credits Depleted)" : null;
      const combinedBadge = toolResult
        ? freeBadge
          ? `${toolResult.summary} • ${freeBadge}`
          : toolResult.summary
        : freeBadge;

      return {
        responseText: cleanedText,
        modelUsed: openRouterRes.modelUsed,
        toolBadge: combinedBadge,
        proposalPayload: null,
      };
    }
  }

  // 3. Fallback if no models responded
  return {
    responseText:
      "⚠️ **AI Service Unavailable**\nPlease configure a valid `GEMINI_API_KEY` or `OPENROUTER_API_KEY` in your `.env`, or try again shortly.",
    modelUsed: "none",
    toolBadge: toolResult ? toolResult.summary : null,
    proposalPayload: null,
  };
}
