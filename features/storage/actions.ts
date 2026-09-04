"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import {
  uploadImageToStorage,
  deleteImageFromStorage,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/storage/supabase-storage";

/**
 * Server action to upload an image to Supabase Storage.
 */
export async function uploadImageAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as "trips" | "avatars" | "posts") || "trips";

    if (!file || typeof file === "string") {
      return { success: false, error: "No image file provided." };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a JPG, PNG, WebP, GIF, or AVIF image.",
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: "Image exceeds 5MB size limit. Please upload a smaller image.",
      };
    }

    const result = await uploadImageToStorage(file, folder, user.id);
    return result;
  } catch (error) {
    console.error("Storage action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Image upload failed",
    };
  }
}

/**
 * Server action to update or clear a Trip's cover image.
 */
export async function updateTripCoverImage(tripId: string, coverImageUrl: string | null) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const trip = await db.trip.findFirst({
      where: { id: tripId, profileId: user.id },
    });

    if (!trip) {
      return { success: false, error: "Trip not found or unauthorized" };
    }

    await db.trip.update({
      where: { id: tripId },
      data: { coverImageUrl },
    });

    revalidatePath(`/trips/${tripId}`);
    revalidatePath(`/trips/${tripId}/overview`);
    revalidatePath(`/trips`);
    revalidatePath(`/dashboard`);
    revalidatePath(`/community`);

    return { success: true, coverImageUrl };
  } catch (error) {
    console.error("Error updating trip cover image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update cover image",
    };
  }
}

/**
 * Server action to update or clear the authenticated user's profile avatar.
 */
export async function updateProfileAvatar(avatarUrl: string | null) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    await db.profile.update({
      where: { id: user.id },
      data: { avatarUrl },
    });

    revalidatePath(`/profile`);
    revalidatePath(`/dashboard`);
    revalidatePath(`/community`);

    return { success: true, avatarUrl };
  } catch (error) {
    console.error("Error updating profile avatar:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update avatar",
    };
  }
}
