"use server";

import { revalidatePath } from "next/cache";

import { syncUserProfile } from "@/lib/auth/sync-profile";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

import { TemplateTripItem } from "./types";

const OPENROUTER_FREE_MODELS = [
  "inclusionai/ling-3.0-flash-sante:free",
  "nex-agi/nex-n2.5-mini:free",
  "liquid/lfm-2.5-2.6b:free",
  "nvidia/nemotron-3.5-lightning:free",
];

/**
 * Fetch all authentic public trips and templates from PostgreSQL.
 * Computes live expense totals, durations, inclusions, and linked travel stories.
 */
export async function getPublicTripTemplates(): Promise<TemplateTripItem[]> {
  try {
    const publicDbTrips = await db.trip.findMany({
      where: {
        OR: [{ isPublic: true }, { isTemplate: true }],
      },
      include: {
        profile: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
            bio: true,
            isPublic: true,
            defaultCurrency: true,
          },
        },
        itinerary: { orderBy: [{ dayNumber: "asc" }, { order: "asc" }] },
        accommodations: true,
        expenses: true,
        checklistItems: true,
        notes: true,
        linkedBlogPosts: {
          where: { status: "PUBLISHED" },
          select: { slug: true, title: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedTemplates: TemplateTripItem[] = publicDbTrips.map((t) => {
      // Calculate authentic duration in days
      const days =
        t.startDate && t.endDate
          ? Math.max(
              1,
              Math.ceil(
                (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              ) + 1
            )
          : Math.max(
              1,
              t.itinerary.length > 0
                ? Math.max(...t.itinerary.map((i) => i.dayNumber || 1))
                : 3
            );

      // Compute total expenses from expenses and accommodations
      const expenseListTotal = t.expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const accommodationsTotal = t.accommodations.reduce((acc, curr) => acc + (curr.cost || 0), 0);
      const totalExpense = Math.round(expenseListTotal + accommodationsTotal);

      // Detect predominant currency
      const currencies = [
        ...t.expenses.map((e) => e.currency),
        ...t.accommodations.map((a) => a.currency),
      ].filter(Boolean);
      const currency = currencies[0] || t.profile?.defaultCurrency || "USD";

      return {
        id: t.id,
        title: t.title,
        destination: t.destination,
        description: t.description,
        coverImageUrl: t.coverImageUrl,
        durationDays: days,
        isTemplate: t.isTemplate,
        isPublic: t.isPublic,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        author: {
          id: t.profile.id,
          fullName: t.profile.fullName,
          username: t.profile.username,
          avatarUrl: t.profile.avatarUrl,
          bio: t.profile.bio,
          isPublic: t.profile.isPublic,
        },
        metrics: {
          activityCount: t.itinerary.length,
          accommodationCount: t.accommodations.length,
          checklistCount: t.checklistItems.length,
          notesCount: t.notes.length,
          expenseTotal: totalExpense,
          currency,
        },
        inclusions: {
          hasStays: t.accommodations.length > 0,
          hasExpenses: totalExpense > 0,
          hasChecklist: t.checklistItems.length > 0,
          hasNotes: t.notes.length > 0,
          hasStory: t.linkedBlogPosts.length > 0,
        },
        itinerary: t.itinerary.map((i) => ({
          day: i.dayNumber || 1,
          title: i.title,
          category: i.category || "Activity",
          description: i.description || undefined,
          location: i.location || undefined,
          cost: i.cost || undefined,
        })),
        accommodations: t.accommodations.map((a) => ({
          name: a.name,
          type: a.type || "Hotel",
          address: a.address || undefined,
          cost: a.cost || undefined,
          currency: a.currency || "USD",
        })),
        checklistHighlights: t.checklistItems.slice(0, 5).map((c) => c.title),
        tips: t.notes.slice(0, 4).map((n) => n.title),
        linkedStory: t.linkedBlogPosts[0]
          ? {
              slug: t.linkedBlogPosts[0].slug,
              title: t.linkedBlogPosts[0].title,
            }
          : null,
      };
    });

    return mappedTemplates;
  } catch (error) {
    console.error("Error fetching public trip templates:", error);
    return [];
  }
}

/**
 * Optional OpenRouter Free Tier AI customizer to adapt itinerary items during cloning.
 */
async function customizeItineraryWithAi(
  sourceTitle: string,
  destination: string | null,
  rawItinerary: Array<{ dayNumber: number | null; title: string; description: string | null; category: string | null }>,
  prompt: string
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !prompt.trim()) {
    return rawItinerary;
  }

  const systemMessage = `You are a professional travel planner assistant for Prava AI.
The user wants to customize an existing travel itinerary for "${sourceTitle}" (${destination || "Destination"}).
User customization request: "${prompt}".

Review the original activities and return a customized JSON array of activities tailored to the user's instructions.
Keep the structure identical:
[
  { "dayNumber": 1, "title": "Short Activity Name", "category": "Food|Sightseeing|Transit|Activity", "description": "Crisp helpful description" }
]
Output strictly valid JSON only. No markdown formatting, no codeblocks.`;

  for (const model of OPENROUTER_FREE_MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://prava.ai",
          "X-Title": "Prava AI Templates",
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_tokens: 1500,
          messages: [
            { role: "system", content: systemMessage },
            {
              role: "user",
              content: JSON.stringify(
                rawItinerary.map((i) => ({
                  dayNumber: i.dayNumber || 1,
                  title: i.title,
                  category: i.category,
                  description: i.description,
                }))
              ),
            },
          ],
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) continue;

      const cleanJson = content.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Failover to next free model
      continue;
    }
  }

  // Graceful fallback to original activities
  return rawItinerary;
}

/**
 * Clone a public trip template directly into the authenticated user's workspace.
 * Optionally tailors the itinerary with OpenRouter free AI if a prompt is provided.
 */
export async function cloneTripTemplate(
  templateId: string,
  aiCustomizationPrompt?: string
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please sign in to clone this itinerary." };
    }

    // Ensure user profile exists in Postgres safely
    await syncUserProfile(user);

    // Fetch source trip with all real assets
    const sourceTrip = await db.trip.findFirst({
      where: {
        id: templateId,
        OR: [{ isPublic: true }, { isTemplate: true }],
      },
      include: {
        itinerary: { orderBy: [{ dayNumber: "asc" }, { order: "asc" }] },
        accommodations: true,
        expenses: true,
        checklistItems: true,
        notes: true,
      },
    });

    if (!sourceTrip) {
      return { success: false, error: "Template not found or not publicly available." };
    }

    // Optional AI customization on activities
    let activitiesToCreate = sourceTrip.itinerary.map((i) => ({
      dayNumber: i.dayNumber || 1,
      time: i.time,
      title: i.title,
      description: i.description,
      location: i.location,
      category: i.category || "Activity",
      cost: i.cost,
      order: i.order,
    }));

    if (aiCustomizationPrompt && aiCustomizationPrompt.trim().length > 0) {
      try {
        const tailored = await customizeItineraryWithAi(
          sourceTrip.title,
          sourceTrip.destination,
          sourceTrip.itinerary,
          aiCustomizationPrompt.trim()
        );

        if (Array.isArray(tailored) && tailored.length > 0) {
          activitiesToCreate = tailored.map((item, idx) => ({
            dayNumber: item.dayNumber || 1,
            time: null,
            title: item.title,
            description: item.description || null,
            location: null,
            category: item.category || "Activity",
            cost: null,
            order: idx,
          }));
        }
      } catch (err) {
        console.warn("AI Customization skipped due to error, cloning original:", err);
      }
    }

    // Execute atomic cloning transaction
    const newTrip = await db.$transaction(async (tx) => {
      const createdTrip = await tx.trip.create({
        data: {
          profileId: user.id,
          title: `${sourceTrip.title} (Plan)`,
          destination: sourceTrip.destination,
          description: sourceTrip.description,
          coverImageUrl: sourceTrip.coverImageUrl,
          startDate: sourceTrip.startDate,
          endDate: sourceTrip.endDate,
          status: "PLANNING",
          isPublic: false,
          isTemplate: false,
        },
      });

      // Clone Itinerary Activities
      if (activitiesToCreate.length > 0) {
        await tx.itineraryItem.createMany({
          data: activitiesToCreate.map((i) => ({
            tripId: createdTrip.id,
            dayNumber: i.dayNumber,
            time: i.time,
            title: i.title,
            description: i.description,
            location: i.location,
            category: i.category,
            cost: i.cost,
            order: i.order,
          })),
        });
      }

      // Clone Accommodations
      if (sourceTrip.accommodations.length > 0) {
        await tx.accommodation.createMany({
          data: sourceTrip.accommodations.map((a) => ({
            tripId: createdTrip.id,
            name: a.name,
            type: a.type,
            address: a.address,
            contactPhone: a.contactPhone,
            cost: a.cost,
            currency: a.currency,
            notes: a.notes,
          })),
        });
      }

      // Clone Expenses
      if (sourceTrip.expenses.length > 0) {
        await tx.expense.createMany({
          data: sourceTrip.expenses.map((e) => ({
            tripId: createdTrip.id,
            title: e.title,
            amount: e.amount,
            currency: e.currency,
            category: e.category,
            date: new Date(),
            notes: e.notes,
          })),
        });
      }

      // Clone Checklist Items
      if (sourceTrip.checklistItems.length > 0) {
        await tx.checklistItem.createMany({
          data: sourceTrip.checklistItems.map((c) => ({
            tripId: createdTrip.id,
            title: c.title,
            category: c.category,
            isCompleted: false, // reset for fresh trip
            order: c.order,
          })),
        });
      }

      // Clone Notes
      if (sourceTrip.notes.length > 0) {
        await tx.note.createMany({
          data: sourceTrip.notes.map((n) => ({
            tripId: createdTrip.id,
            title: n.title,
            content: n.content,
            category: n.category,
            isPinned: n.isPinned,
          })),
        });
      }

      return createdTrip;
    });

    revalidatePath("/trips");
    revalidatePath("/dashboard");
    revalidatePath("/templates");

    return {
      success: true,
      newTripId: newTrip.id,
      tripId: newTrip.id,
    };
  } catch (error) {
    console.error("Error cloning trip template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clone itinerary.",
    };
  }
}
