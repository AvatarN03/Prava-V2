"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import {
  createTripSchema,
  updateTripSchema,
  deleteTripSchema,
  CreateTripInput,
  UpdateTripInput,
  DeleteTripInput,
} from "./schema";
import { ActionResult, Trip } from "./types";

import { syncUserProfile } from "@/lib/auth/sync-profile";
import { hasActiveProSubscription } from "@/services/subscription/subscription-service";

/**
 * Helper to get the authenticated user and ensure profile exists in database.
 */
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Ensure profile row exists in Postgres safely without email unique constraint collisions
  const profile = await syncUserProfile(user);

  return { user, profile };
}

/**
 * Server Action: Create a new Trip
 */
export async function createTrip(
  input: CreateTripInput
): Promise<ActionResult<Trip>> {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const validated = createTripSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const { title, destination, description, startDate, endDate, status, coverImageUrl } =
      validated.data;

    // Enforce Tier Trip Limits (10 for Free, 25 for Pro)
    const isPro = await hasActiveProSubscription(authData.user.id);
    const maxTrips = isPro ? 25 : 10;

    const userTripCount = await db.trip.count({
      where: { profileId: authData.user.id },
    });

    if (userTripCount >= maxTrips) {
      return {
        success: false,
        error: isPro
          ? `Pro Wanderer workspace limit reached (${userTripCount}/${maxTrips} trips). Please archive older trips to create more.`
          : `Free Explorer limit reached (${userTripCount}/${maxTrips} trips). Please upgrade to Pro Wanderer for up to 25 trips.`,
      };
    }

    const trip = await db.trip.create({
      data: {
        profileId: authData.user.id,
        title,
        destination: destination || null,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
        coverImageUrl: coverImageUrl || null,
      },
    });

    revalidatePath("/trips");
    revalidatePath("/dashboard");

    return { success: true, data: trip };
  } catch (error) {
    console.error("Error creating trip:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create trip",
    };
  }
}

/**
 * Server Action: Update an existing Trip
 */
export async function updateTrip(
  input: UpdateTripInput
): Promise<ActionResult<Trip>> {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const validated = updateTripSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const { id, title, destination, description, startDate, endDate, status, coverImageUrl } =
      validated.data;

    // Check ownership
    const existing = await db.trip.findFirst({
      where: {
        id,
        profileId: authData.user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Trip not found or unauthorized." };
    }

    const updated = await db.trip.update({
      where: { id },
      data: {
        title,
        destination: destination || null,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
        ...(coverImageUrl !== undefined ? { coverImageUrl: coverImageUrl || null } : {}),
      },
    });

    revalidatePath("/trips");
    revalidatePath(`/trips/${id}`);
    revalidatePath("/dashboard");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating trip:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update trip",
    };
  }
}

/**
 * Server Action: Delete a Trip
 */
export async function deleteTrip(
  input: DeleteTripInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const validated = deleteTripSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Invalid trip ID" };
    }

    const { id } = validated.data;

    // Check ownership before deleting
    const existing = await db.trip.findFirst({
      where: {
        id,
        profileId: authData.user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Trip not found or unauthorized." };
    }

    await db.trip.delete({
      where: { id },
    });

    revalidatePath("/trips");
    revalidatePath("/dashboard");

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error deleting trip:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete trip",
    };
  }
}

/**
 * Server Action: Duplicate an existing Trip
 */
export async function duplicateTrip(tripId: string): Promise<ActionResult<Trip>> {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    // Verify ownership and load existing entities to clone
    const existing = await db.trip.findFirst({
      where: {
        id: tripId,
        profileId: authData.user.id,
      },
      include: {
        itinerary: true,
        accommodations: true,
        checklistItems: true,
        notes: true,
      },
    });

    if (!existing) {
      return { success: false, error: "Original trip not found or unauthorized." };
    }

    // Check tier limits
    const isPro = await hasActiveProSubscription(authData.user.id);
    const maxTrips = isPro ? 25 : 10;
    const userTripCount = await db.trip.count({
      where: { profileId: authData.user.id },
    });

    if (userTripCount >= maxTrips) {
      return {
        success: false,
        error: isPro
          ? `Pro Wanderer workspace limit reached (${userTripCount}/${maxTrips} trips). Please archive older trips to duplicate.`
          : `Free Explorer limit reached (${userTripCount}/${maxTrips} trips). Please upgrade to Pro Wanderer to duplicate trips.`,
      };
    }

    const newTitle = `Copy of ${existing.title}`.slice(0, 100);

    // Atomic transaction cloning trip and nested entities
    const clonedTrip = await db.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          profileId: authData.user.id,
          title: newTitle,
          destination: existing.destination,
          description: existing.description,
          startDate: existing.startDate,
          endDate: existing.endDate,
          status: "PLANNING",
          coverImageUrl: existing.coverImageUrl,
          isPublic: false,
          isTemplate: false,
        },
      });

      // Clone itinerary items
      if (existing.itinerary.length > 0) {
        await tx.itineraryItem.createMany({
          data: existing.itinerary.map((item) => ({
            tripId: newTrip.id,
            dayNumber: item.dayNumber,
            date: item.date,
            time: item.time,
            title: item.title,
            description: item.description,
            location: item.location,
            category: item.category,
            cost: item.cost,
            order: item.order,
          })),
        });
      }

      // Clone accommodations
      if (existing.accommodations.length > 0) {
        await tx.accommodation.createMany({
          data: existing.accommodations.map((acc) => ({
            tripId: newTrip.id,
            name: acc.name,
            type: acc.type,
            address: acc.address,
            checkIn: acc.checkIn,
            checkOut: acc.checkOut,
            confirmationCode: acc.confirmationCode,
            contactPhone: acc.contactPhone,
            cost: acc.cost,
            currency: acc.currency,
            notes: acc.notes,
          })),
        });
      }

      // Clone checklist items
      if (existing.checklistItems.length > 0) {
        await tx.checklistItem.createMany({
          data: existing.checklistItems.map((item) => ({
            tripId: newTrip.id,
            title: item.title,
            category: item.category,
            isCompleted: false, // reset tasks
            dueDate: item.dueDate,
            order: item.order,
          })),
        });
      }

      // Clone notes
      if (existing.notes.length > 0) {
        await tx.note.createMany({
          data: existing.notes.map((note) => ({
            tripId: newTrip.id,
            title: note.title,
            content: note.content,
            category: note.category,
            isPinned: note.isPinned,
          })),
        });
      }

      return newTrip;
    });

    revalidatePath("/trips");
    revalidatePath("/dashboard");

    return { success: true, data: clonedTrip };
  } catch (error) {
    console.error("Error duplicating trip:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to duplicate trip",
    };
  }
}

/**
 * Server Action: Toggle public/community visibility of a trip
 */
export async function toggleTripPublicStatus(
  tripId: string
): Promise<ActionResult<{ isPublic: boolean }>> {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const existing = await db.trip.findFirst({
      where: {
        id: tripId,
        profileId: authData.user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Trip not found or unauthorized." };
    }

    const updated = await db.trip.update({
      where: { id: tripId },
      data: { isPublic: !existing.isPublic },
      select: { isPublic: true },
    });

    revalidatePath("/trips");
    revalidatePath(`/trips/${tripId}`);
    revalidatePath("/community");
    revalidatePath("/templates");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling trip public status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update sharing settings",
    };
  }
}

/**
 * Server Action / Query: Get trip usage quota for the active user
 */
export async function getTripUsageQuota(): Promise<{
  count: number;
  maxTrips: number;
  isPro: boolean;
}> {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return { count: 0, maxTrips: 10, isPro: false };
    }

    const isPro = await hasActiveProSubscription(authData.user.id);
    const maxTrips = isPro ? 25 : 10;
    const count = await db.trip.count({
      where: { profileId: authData.user.id },
    });

    return { count, maxTrips, isPro };
  } catch (error) {
    console.error("Error getting trip usage quota:", error);
    return { count: 0, maxTrips: 10, isPro: false };
  }
}

/**
 * Server query: Get all trips for the authenticated user with aggregated counts
 */
export async function getTrips(): Promise<Trip[]> {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return [];
    }

    const rawTrips = await db.trip.findMany({
      where: {
        profileId: authData.user.id,
      },
      include: {
        _count: {
          select: {
            itinerary: true,
            accommodations: true,
            checklistItems: true,
            notes: true,
            expenses: true,
            linkedBlogPosts: true,
          },
        },
        expenses: {
          select: {
            amount: true,
          },
        },
        checklistItems: {
          select: {
            isCompleted: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return rawTrips.map((t) => {
      const totalSpend = t.expenses.reduce((sum, e) => sum + e.amount, 0);
      const completedTasksCount = t.checklistItems.filter((c) => c.isCompleted).length;

      // Omit bulky arrays from returned object to keep payload lightweight
      const { expenses, checklistItems, ...tripRest } = t;

      return {
        ...tripRest,
        totalSpend,
        completedTasksCount,
      } as Trip;
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return [];
  }
}

import { searchTourCoverImages, UnsplashImage } from "@/services/unsplash";

/**
 * Server Action: Retrieve 6 tour-vibe / destination cover images
 */
export async function getDestinationCoverImages(
  destination?: string | null,
  page: number = 1
): Promise<{ success: boolean; images: UnsplashImage[]; source: "unsplash" | "fallback" }> {
  return await searchTourCoverImages(destination, page);
}

/**
 * Server Action: Retrieve user's AI preferences (e.g. aiAutoPropose, defaultCurrency)
 */
export async function getUserAiPreferences(): Promise<{ aiAutoPropose: boolean; defaultCurrency: string }> {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) return { aiAutoPropose: true, defaultCurrency: "USD" };
    const profile = await db.profile.findUnique({
      where: { id: authData.user.id },
      select: { aiAutoPropose: true, defaultCurrency: true },
    });
    return {
      aiAutoPropose: profile?.aiAutoPropose ?? true,
      defaultCurrency: profile?.defaultCurrency || "USD",
    };
  } catch {
    return { aiAutoPropose: true, defaultCurrency: "USD" };
  }
}
