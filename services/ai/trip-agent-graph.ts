import { getGeminiClient, GEMINI_MODEL } from "@/lib/ai/gemini-client";
import {
  callOpenRouterFree,
  hasOpenRouterKey,
  OpenRouterMessage,
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
}

export interface AgentGraphOutput {
  responseText: string;
  modelUsed: string;
  toolBadge?: string | null;
  proposalPayload?: AiProposalPayload | null;
}

/**
 * Extracts and parses json:proposal codeblock from LLM response.
 */
function extractProposalBlock(text: string): {
  cleanedText: string;
  payload: AiProposalPayload | null;
} {
  const proposalRegex = /```(?:json:proposal|proposal|json)\s*([\s\S]*?)\s*```/i;
  const match = text.match(proposalRegex);

  let payload: AiProposalPayload | null = null;
  let cleaned = text;

  if (match) {
    try {
      const rawJson = JSON.parse(match[1]);
      const parsed = aiProposalPayloadSchema.safeParse(rawJson);
      if (parsed.success) {
        payload = parsed.data;
        cleaned = text.replace(proposalRegex, "").trim();
        cleaned = cleaned || parsed.data.summary;
      }
    } catch {
      // Not a valid proposal schema
    }
  }

  // Remove any remaining raw JSON code blocks or developer citations (e.g. {"from": ...})
  cleaned = cleaned
    .replace(/(?:\*{0,2}Live Data Citation:?\*{0,2}\s*)?```(?:json)?\s*\{[\s\S]*?\}\s*```/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { cleanedText: cleaned, payload };
}

/**
 * Executes the Trip Agent Graph:
 * 1. Evaluates live Travel Essentials tools (Weather & Currency)
 * 2. Routes conversation to OpenRouter Free Reasoning Cascade (Nemotron 3.5 / openrouter/free / Gemma 4)
 * 3. Falls back or delegates proposal generation to Gemini 2.0 Flash Lite (500–1,500 RPD)
 */
export async function runTripAgentGraph(
  input: AgentGraphInput
): Promise<AgentGraphOutput> {
  const { tripId, userId, prompt, history, userCurrency = "INR" } = input;

  // 1. Build live trip context from PostgreSQL
  const context = await buildTripContext(tripId, userId);
  const destination = context?.destination || null;

  // 2. Node: Travel Essentials Tool Execution
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

  // 3. Node: Detect if proposal modification is requested
  const actionKeywords = [
    "add to itinerary",
    "add to plan",
    "create activity",
    "schedule",
    "add hotel",
    "add lodging",
    "delete",
    "remove item",
    "change time",
    "move day",
  ];
  const isActionRequest = actionKeywords.some((kw) =>
    prompt.toLowerCase().includes(kw)
  );

  // Augment system prompt with tool execution result if available
  let dynamicSystemInstruction = context?.systemInstruction || "You are Prava AI travel assistant.";
  if (toolResult) {
    dynamicSystemInstruction += `\n\n[LIVE ACCURATE DATA - REAL-TIME REFERENCE]:\n${toolResult.summary}\n\nCRITICAL CONVERSATIONAL RULES:
- Use the above live data to answer the traveler's question directly.
- NEVER display raw JSON code blocks, developer schemas, or "Live Data Citation" sections to the user.
- State amounts, conversion rates, and temperatures in clean, friendly natural language.`;
  }

  // 4. Node: Free Reasoning Tier (OpenRouter)
  // If it's a general travel question, tips, packing advice, or requirement gathering:
  if (!isActionRequest && hasOpenRouterKey()) {
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
      systemInstruction: dynamicSystemInstruction,
      temperature: 0.6,
      maxTokens: 1200,
    });

    if (openRouterRes && openRouterRes.success && openRouterRes.text) {
      const { cleanedText, payload } = extractProposalBlock(openRouterRes.text);

      return {
        responseText: cleanedText,
        modelUsed: openRouterRes.modelUsed,
        toolBadge: toolResult ? toolResult.summary : null,
        proposalPayload: payload,
      };
    }
  }

  // 5. Node: Fallback & Proposal Generator (Gemini 2.0 Flash Lite)
  const gemini = getGeminiClient();
  if (!gemini) {
    return {
      responseText:
        "⚠️ **AI Client Key Required**\nPlease configure `GEMINI_API_KEY` or `OPENROUTER_API_KEY` in your `.env` to enable the AI assistant.",
      modelUsed: "none",
      toolBadge: toolResult ? toolResult.summary : null,
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

  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: geminiContents,
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.5,
        maxOutputTokens: 2000,
      },
    });

    const rawText =
      response.text ||
      "I was unable to generate a response. Please check your query or try again.";

    const { cleanedText, payload } = extractProposalBlock(rawText);

    return {
      responseText: cleanedText,
      modelUsed: GEMINI_MODEL,
      toolBadge: toolResult ? toolResult.summary : null,
      proposalPayload: payload,
    };
  } catch (error) {
    console.error("Gemini 2.0 Flash Lite generation error:", error);
    return {
      responseText:
        "The AI assistant encountered a temporary connection issue. Please try again in a few moments.",
      modelUsed: GEMINI_MODEL,
      toolBadge: toolResult ? toolResult.summary : null,
      proposalPayload: null,
    };
  }
}
