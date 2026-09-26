"use server";

import { revalidatePath } from "next/cache";

import { syncUserProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

import {
  AttachVaultLinkToTripInput,
  attachVaultLinkToTripSchema,
  CreateVaultLinkInput,
  createVaultLinkSchema,
  UpdateVaultLinkInput,
  updateVaultLinkSchema,
} from "./schema";

/**
 * Get all global saved travel links for the authenticated user
 */
export async function getVaultLinks() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized", data: [] };
    }

    const profile = await syncUserProfile(user);

    const links = await db.link.findMany({
      where: {
        profileId: profile.id,
        tripId: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: links };
  } catch (error) {
    console.error("Error fetching vault links:", error);
    return { success: false, error: "Failed to load saved links", data: [] };
  }
}

/**
 * Get active & planning trips belonging to the user (for "Attach to Trip" selector)
 */
export async function getUserTripOptions() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized", data: [] };
    }

    const profile = await syncUserProfile(user);

    const trips = await db.trip.findMany({
      where: {
        profileId: profile.id,
        status: { in: ["PLANNING", "ACTIVE"] },
      },
      select: {
        id: true,
        title: true,
        destination: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: trips };
  } catch (error) {
    console.error("Error fetching user trips:", error);
    return { success: false, error: "Failed to load trips", data: [] };
  }
}

/**
 * Create a new link directly in the user's global Travel Resource Vault
 */
export async function createVaultLink(input: CreateVaultLinkInput) {
  try {
    const validated = createVaultLinkSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const profile = await syncUserProfile(user);

    const { title, url, category, description } = validated.data;

    const link = await db.link.create({
      data: {
        profileId: profile.id,
        tripId: null, // Scoped globally to Vault
        title,
        url,
        category: category || "Resource",
        description: description || null,
      },
    });

    revalidatePath("/travel-essentials");
    return { success: true, data: link };
  } catch (error) {
    console.error("Error creating vault link:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save link",
    };
  }
}

/**
 * Update an existing link in the user's Travel Resource Vault
 */
export async function updateVaultLink(input: UpdateVaultLinkInput) {
  try {
    const validated = updateVaultLinkSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const profile = await syncUserProfile(user);

    const { id, title, url, category, description } = validated.data;

    const existing = await db.link.findFirst({
      where: { id, profileId: profile.id },
    });

    if (!existing) {
      return { success: false, error: "Link not found or unauthorized" };
    }

    const updated = await db.link.update({
      where: { id },
      data: {
        title,
        url,
        category: category || "Resource",
        description: description || null,
      },
    });

    revalidatePath("/travel-essentials");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating vault link:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update link",
    };
  }
}

/**
 * Delete a link from the user's Travel Resource Vault
 */
export async function deleteVaultLink(linkId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const profile = await syncUserProfile(user);

    const existing = await db.link.findFirst({
      where: { id: linkId, profileId: profile.id },
    });

    if (!existing) {
      return { success: false, error: "Link not found or unauthorized" };
    }

    await db.link.delete({
      where: { id: linkId },
    });

    revalidatePath("/travel-essentials");
    return { success: true };
  } catch (error) {
    console.error("Error deleting vault link:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove link",
    };
  }
}

/**
 * Attach / Copy a Vault link into a specific Trip Workspace
 */
export async function attachVaultLinkToTrip(input: AttachVaultLinkToTripInput) {
  try {
    const validated = attachVaultLinkToTripSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Invalid parameters" };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const profile = await syncUserProfile(user);

    const { linkId, tripId } = validated.data;

    // Verify trip ownership
    const trip = await db.trip.findFirst({
      where: { id: tripId, profileId: profile.id },
    });

    if (!trip) {
      return { success: false, error: "Trip not found or unauthorized" };
    }

    // Fetch the vault link
    const vaultLink = await db.link.findFirst({
      where: { id: linkId, profileId: profile.id },
    });

    if (!vaultLink) {
      return { success: false, error: "Vault link not found" };
    }

    // Check if already in this trip to avoid duplicate copies
    const existingInTrip = await db.link.findFirst({
      where: {
        tripId,
        url: vaultLink.url,
      },
    });

    if (existingInTrip) {
      return {
        success: false,
        error: `This link is already attached to "${trip.title}".`,
      };
    }

    // Create a copy inside the trip workspace
    const tripLink = await db.link.create({
      data: {
        profileId: profile.id,
        tripId,
        title: vaultLink.title,
        url: vaultLink.url,
        category: vaultLink.category,
        description: vaultLink.description,
      },
    });

    revalidatePath(`/trips/${tripId}/links`);
    revalidatePath(`/trips/${tripId}/overview`);

    return {
      success: true,
      data: tripLink,
      tripTitle: trip.title,
    };
  } catch (error) {
    console.error("Error attaching vault link to trip:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to attach link to trip",
    };
  }
}
