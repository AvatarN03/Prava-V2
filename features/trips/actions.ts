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

  // Ensure profile row exists in Postgres (mirrors Supabase auth.users)
  const profile = await db.profile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
    update: {
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
  });

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
    const isPro = authData.user.user_metadata?.tier === "pro" || authData.user.user_metadata?.is_pro === true;
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

    const { id, title, destination, description, startDate, endDate, status } =
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
 * Server query: Get all trips for the authenticated user
 */
export async function getTrips(): Promise<Trip[]> {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return [];
    }

    return await db.trip.findMany({
      where: {
        profileId: authData.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
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
