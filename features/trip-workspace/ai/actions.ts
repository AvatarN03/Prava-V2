"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/ai/gemini-client";
import { buildTripContext } from "@/services/ai/context-builder";
import {
  aiProposalPayloadSchema,
  AiProposalPayload,
  AiProposalDTO,
} from "./schema";

export interface MessageDTO {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  createdAt: string;
  proposal?: AiProposalDTO | null;
}

/**
 * Helper to extract and parse json:proposal from model response text.
 */
function extractProposal(text: string): { cleanedText: string; payload: AiProposalPayload | null } {
  const proposalRegex = /```(?:json:proposal|proposal|json)\s*([\s\S]*?)\s*```/i;
  const match = text.match(proposalRegex);

  if (!match) {
    return { cleanedText: text, payload: null };
  }

  try {
    const rawJson = JSON.parse(match[1]);
    const parsed = aiProposalPayloadSchema.safeParse(rawJson);

    if (parsed.success) {
      // Remove the proposal code block from user-visible text so it is cleanly rendered in UI proposal card
      const cleanedText = text.replace(proposalRegex, "").trim();
      return { cleanedText: cleanedText || parsed.data.summary, payload: parsed.data };
    }
  } catch {
    // Malformed JSON proposal, ignore and treat as plain text
  }

  return { cleanedText: text, payload: null };
}

export interface ConversationThreadDTO {
  id: string;
  tripId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  hasProposals: boolean;
}

/**
 * Get all conversation threads for a specific trip (history drawer).
 */
export async function getTripConversationThreads(tripId: string): Promise<{ success: boolean; threads: ConversationThreadDTO[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized", threads: [] };
    }

    const conversations = await db.aiConversation.findMany({
      where: { tripId, profileId: user.id },
      include: {
        _count: {
          select: {
            messages: true,
            proposals: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const threads: ConversationThreadDTO[] = conversations.map((c) => ({
      id: c.id,
      tripId: c.tripId,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      messageCount: c._count.messages,
      hasProposals: c._count.proposals > 0,
    }));

    return { success: true, threads };
  } catch (error) {
    console.error("Error loading conversation threads:", error);
    return { success: false, error: "Failed to load chat history", threads: [] };
  }
}

/**
 * Create a new conversation thread for a trip.
 */
export async function createTripConversationThread(tripId: string, title?: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const trip = await db.trip.findFirst({
      where: { id: tripId, profileId: user.id },
    });

    if (!trip) {
      return { success: false, error: "Trip not found" };
    }

    const newThread = await db.aiConversation.create({
      data: {
        tripId,
        profileId: user.id,
        title: title || `${trip.title} Chat (${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })})`,
      },
    });

    return { success: true, conversationId: newThread.id, thread: newThread };
  } catch (error) {
    console.error("Error creating conversation thread:", error);
    return { success: false, error: "Failed to create new chat" };
  }
}

/**
 * Delete a conversation thread.
 */
export async function deleteTripConversationThread(conversationId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    await db.aiConversation.deleteMany({
      where: { id: conversationId, profileId: user.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting conversation thread:", error);
    return { success: false, error: "Failed to delete chat" };
  }
}

/**
 * Get or initialize the AI conversation thread for a specific trip, including proposals.
 */
export async function getTripConversation(tripId: string, conversationId?: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized", messages: [] };
    }

    // Verify trip ownership
    const trip = await db.trip.findFirst({
      where: { id: tripId, profileId: user.id },
    });

    if (!trip) {
      return { success: false, error: "Trip not found", messages: [] };
    }

    let conversation = null;

    if (conversationId) {
      conversation = await db.aiConversation.findFirst({
        where: { id: conversationId, tripId, profileId: user.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
          proposals: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    if (!conversation) {
      conversation = await db.aiConversation.findFirst({
        where: { tripId, profileId: user.id },
        orderBy: { updatedAt: "desc" },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
          proposals: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    if (!conversation) {
      conversation = await db.aiConversation.create({
        data: {
          tripId,
          profileId: user.id,
          title: `${trip.title} Assistant`,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
          proposals: true,
        },
      });
    }

    const proposalMap = new Map<string, (typeof conversation.proposals)[0]>();
    for (const p of conversation.proposals) {
      if (p.messageId) {
        proposalMap.set(p.messageId, p);
      }
    }

    const messages: MessageDTO[] = conversation.messages.map((m) => {
      const activeProposal = proposalMap.get(m.id);
      return {
        id: m.id,
        role: m.role as "user" | "model" | "system",
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        proposal: activeProposal
          ? {
              id: activeProposal.id,
              tripId: activeProposal.tripId,
              conversationId: activeProposal.conversationId,
              messageId: activeProposal.messageId,
              status: activeProposal.status as "PENDING" | "ACCEPTED" | "REJECTED" | "PARTIAL",
              summary: activeProposal.summary,
              payload: activeProposal.payload as unknown as AiProposalPayload,
              createdAt: activeProposal.createdAt.toISOString(),
              resolvedAt: activeProposal.resolvedAt?.toISOString() || null,
            }
          : null,
      };
    });

    return {
      success: true,
      conversationId: conversation.id,
      conversationTitle: conversation.title,
      messages,
      totalMessages: messages.length,
    };
  } catch (error) {
    console.error("Error loading conversation:", error);
    return { success: false, error: "Failed to load conversation", messages: [] };
  }
}

/**
 * Send a message to the Gemini AI Travel Assistant with full trip context & proposal extraction.
 */
export async function sendTripMessage(tripId: string, prompt: string, conversationId?: string) {
  try {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return { success: false, error: "Prompt cannot be empty" };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    // Build trip-scoped context
    const contextResult = await buildTripContext(tripId, user.id);
    if (!contextResult) {
      return { success: false, error: "Trip not found or unauthorized." };
    }

    // Get or create target conversation
    let conversation = null;

    if (conversationId) {
      conversation = await db.aiConversation.findFirst({
        where: { id: conversationId, tripId, profileId: user.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    if (!conversation) {
      conversation = await db.aiConversation.findFirst({
        where: { tripId, profileId: user.id },
        orderBy: { updatedAt: "desc" },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    if (!conversation) {
      conversation = await db.aiConversation.create({
        data: {
          tripId,
          profileId: user.id,
          title: `${contextResult.tripTitle} Assistant`,
        },
        include: { messages: true },
      });
    }

    // Free Tier AI Rate Limit Check (30 messages per thread)
    if (conversation.messages.length >= 30) {
      return {
        success: false,
        error: "Free Explorer limit reached (30 messages in this chat). Please click '+ New Chat' to start a fresh thread or upgrade to Pro for unlimited continuous interactions.",
        limitReached: true,
      };
    }

    // Persist user's message
    const userMsg = await db.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: trimmedPrompt,
      },
    });

    // Check Gemini API key
    const gemini = getGeminiClient();
    if (!gemini) {
      const fallbackMsg = await db.aiMessage.create({
        data: {
          conversationId: conversation.id,
          role: "model",
          content:
            "⚠️ **Gemini API Key Required**\n\nPlease add `GEMINI_API_KEY` to your environment variables (`.env`) to enable real-time AI itinerary suggestions, structured proposal actions, and local recommendations.",
        },
      });

      return {
        success: true,
        userMessage: {
          id: userMsg.id,
          role: "user" as const,
          content: userMsg.content,
          createdAt: userMsg.createdAt.toISOString(),
        },
        assistantMessage: {
          id: fallbackMsg.id,
          role: "model" as const,
          content: fallbackMsg.content,
          createdAt: fallbackMsg.createdAt.toISOString(),
          proposal: null,
        },
      };
    }

    // Build chat contents
    const contents = [
      ...conversation.messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
      {
        role: "user",
        parts: [{ text: trimmedPrompt }],
      },
    ];

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: contextResult.systemInstruction,
        temperature: 0.5,
        maxOutputTokens: 2000,
      },
    });

    const rawResponseText =
      response.text ||
      "I was unable to generate a response. Please check your query or try again.";

    // Extract proposal if present
    const { cleanedText, payload } = extractProposal(rawResponseText);

    // Persist assistant message
    const assistantMsg = await db.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "model",
        content: cleanedText,
      },
    });

    let savedProposalDTO: AiProposalDTO | null = null;

    if (payload && payload.changes.length > 0) {
      const savedProposal = await db.aiProposal.create({
        data: {
          tripId,
          conversationId: conversation.id,
          messageId: assistantMsg.id,
          status: "PENDING",
          summary: payload.summary,
          payload: payload as any,
        },
      });

      savedProposalDTO = {
        id: savedProposal.id,
        tripId: savedProposal.tripId,
        conversationId: savedProposal.conversationId,
        messageId: savedProposal.messageId,
        status: "PENDING",
        summary: savedProposal.summary,
        payload: payload,
        createdAt: savedProposal.createdAt.toISOString(),
        resolvedAt: null,
      };
    }

    revalidatePath(`/trips/${tripId}`);

    return {
      success: true,
      userMessage: {
        id: userMsg.id,
        role: "user" as const,
        content: userMsg.content,
        createdAt: userMsg.createdAt.toISOString(),
      },
      assistantMessage: {
        id: assistantMsg.id,
        role: "model" as const,
        content: assistantMsg.content,
        createdAt: assistantMsg.createdAt.toISOString(),
        proposal: savedProposalDTO,
      },
    };
  } catch (error) {
    console.error("Gemini AI generation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "AI generation failed. Please try again later.",
    };
  }
}

/**
 * Accept an AI proposal (all changes or selected change IDs).
 * Executes mutations inside a Prisma transaction and updates proposal state.
 */
export async function acceptAiProposal(
  tripId: string,
  proposalId: string,
  selectedChangeIds?: string[]
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify trip ownership
    const trip = await db.trip.findFirst({
      where: { id: tripId, profileId: user.id },
    });

    if (!trip) {
      return { success: false, error: "Trip not found or unauthorized" };
    }

    // Find proposal
    const proposal = await db.aiProposal.findFirst({
      where: { id: proposalId, tripId },
    });

    if (!proposal) {
      return { success: false, error: "Proposal not found" };
    }

    if (proposal.status !== "PENDING") {
      return { success: false, error: `Proposal is already ${proposal.status.toLowerCase()}` };
    }

    const payload = proposal.payload as unknown as AiProposalPayload;
    if (!payload || !Array.isArray(payload.changes) || payload.changes.length === 0) {
      return { success: false, error: "Invalid proposal payload" };
    }

    // Filter changes to apply
    const changesToApply = selectedChangeIds && selectedChangeIds.length > 0
      ? payload.changes.filter((c) => selectedChangeIds.includes(c.id))
      : payload.changes;

    if (changesToApply.length === 0) {
      return { success: false, error: "No changes selected to apply" };
    }

    // Execute changes transactionally
    await db.$transaction(async (tx) => {
      for (const change of changesToApply) {
        if (change.domain === "itinerary") {
          if (change.action === "create") {
            await tx.itineraryItem.create({
              data: {
                tripId,
                title: change.data.title || "Untitled Activity",
                dayNumber: change.data.dayNumber ?? null,
                time: change.data.time || null,
                location: change.data.location || null,
                category: change.data.category || "Activity",
                cost: change.data.cost ?? null,
                description: change.data.description || null,
              },
            });
          } else if (change.action === "update" && change.targetId) {
            await tx.itineraryItem.updateMany({
              where: { id: change.targetId, tripId },
              data: {
                ...(change.data.title !== undefined && { title: change.data.title }),
                ...(change.data.dayNumber !== undefined && { dayNumber: change.data.dayNumber }),
                ...(change.data.time !== undefined && { time: change.data.time }),
                ...(change.data.location !== undefined && { location: change.data.location }),
                ...(change.data.category !== undefined && { category: change.data.category }),
                ...(change.data.cost !== undefined && { cost: change.data.cost }),
                ...(change.data.description !== undefined && { description: change.data.description }),
              },
            });
          } else if (change.action === "delete" && change.targetId) {
            await tx.itineraryItem.deleteMany({
              where: { id: change.targetId, tripId },
            });
          }
        } else if (change.domain === "accommodation") {
          if (change.action === "create") {
            await tx.accommodation.create({
              data: {
                tripId,
                name: change.data.name || "Untitled Lodging",
                type: change.data.type || "Hotel",
                address: change.data.address || null,
                checkIn: change.data.checkIn ? new Date(change.data.checkIn) : null,
                checkOut: change.data.checkOut ? new Date(change.data.checkOut) : null,
                cost: change.data.cost ?? null,
                currency: change.data.currency || "USD",
                notes: change.data.notes || null,
              },
            });
          } else if (change.action === "update" && change.targetId) {
            await tx.accommodation.updateMany({
              where: { id: change.targetId, tripId },
              data: {
                ...(change.data.name !== undefined && { name: change.data.name }),
                ...(change.data.type !== undefined && { type: change.data.type }),
                ...(change.data.address !== undefined && { address: change.data.address }),
                ...(change.data.checkIn !== undefined && {
                  checkIn: change.data.checkIn ? new Date(change.data.checkIn) : null,
                }),
                ...(change.data.checkOut !== undefined && {
                  checkOut: change.data.checkOut ? new Date(change.data.checkOut) : null,
                }),
                ...(change.data.cost !== undefined && { cost: change.data.cost }),
                ...(change.data.currency ? { currency: change.data.currency } : {}),
                ...(change.data.notes !== undefined && { notes: change.data.notes }),
              },
            });
          } else if (change.action === "delete" && change.targetId) {
            await tx.accommodation.deleteMany({
              where: { id: change.targetId, tripId },
            });
          }
        }
      }

      // Update proposal status
      const isPartial = changesToApply.length < payload.changes.length;
      await tx.aiProposal.update({
        where: { id: proposalId },
        data: {
          status: isPartial ? "PARTIAL" : "ACCEPTED",
          resolvedAt: new Date(),
        },
      });
    });

    revalidatePath(`/trips/${tripId}/itinerary`);
    revalidatePath(`/trips/${tripId}/accommodations`);
    revalidatePath(`/trips/${tripId}/overview`);
    revalidatePath(`/trips/${tripId}`);

    return {
      success: true,
      status: (changesToApply.length < payload.changes.length ? "PARTIAL" : "ACCEPTED") as
        | "ACCEPTED"
        | "PARTIAL",
    };
  } catch (error) {
    console.error("Error accepting proposal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept proposal",
    };
  }
}

/**
 * Reject an AI proposal.
 */
export async function rejectAiProposal(tripId: string, proposalId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const trip = await db.trip.findFirst({
      where: { id: tripId, profileId: user.id },
    });

    if (!trip) {
      return { success: false, error: "Trip not found or unauthorized" };
    }

    const proposal = await db.aiProposal.findFirst({
      where: { id: proposalId, tripId },
    });

    if (!proposal) {
      return { success: false, error: "Proposal not found" };
    }

    await db.aiProposal.update({
      where: { id: proposalId },
      data: {
        status: "REJECTED",
        resolvedAt: new Date(),
      },
    });

    revalidatePath(`/trips/${tripId}`);

    return { success: true };
  } catch (error) {
    console.error("Error rejecting proposal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject proposal",
    };
  }
}

/**
 * Clear conversation history & associated proposals for this trip.
 */
export async function clearTripConversation(tripId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const conversation = await db.aiConversation.findFirst({
      where: { tripId, profileId: user.id },
    });

    if (conversation) {
      await db.aiProposal.deleteMany({
        where: { conversationId: conversation.id },
      });
      await db.aiMessage.deleteMany({
        where: { conversationId: conversation.id },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error clearing conversation:", error);
    return { success: false, error: "Failed to clear history" };
  }
}
