"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "../common/auth-check";
import {
  createLinkSchema,
  updateLinkSchema,
  deleteLinkSchema,
  CreateLinkInput,
  UpdateLinkInput,
  DeleteLinkInput,
} from "./schema";

export async function createLink(input: CreateLinkInput) {
  try {
    const validated = createLinkSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { tripId, title, url, category, description } = validated.data;
    const { authorized, user } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const link = await db.link.create({
      data: {
        profileId: user?.id || null,
        tripId,
        title,
        url,
        category: category || "Resource",
        description: description || null,
      },
    });

    revalidatePath(`/trips/${tripId}/links`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: link };
  } catch (error) {
    console.error("Error creating bookmark link:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to add link" };
  }
}

export async function updateLink(input: UpdateLinkInput) {
  try {
    const validated = updateLinkSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { id, tripId, title, url, category, description } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
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

    revalidatePath(`/trips/${tripId}/links`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating link:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update link" };
  }
}

export async function deleteLink(input: DeleteLinkInput) {
  try {
    const validated = deleteLinkSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Invalid input" };
    }

    const { id, tripId } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    await db.link.delete({
      where: { id },
    });

    revalidatePath(`/trips/${tripId}/links`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error deleting link:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete link" };
  }
}
