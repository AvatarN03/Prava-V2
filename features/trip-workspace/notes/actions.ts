"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "../common/auth-check";
import {
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
  togglePinNoteSchema,
  CreateNoteInput,
  UpdateNoteInput,
  DeleteNoteInput,
  TogglePinNoteInput,
} from "./schema";

export async function createNote(input: CreateNoteInput) {
  try {
    const validated = createNoteSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { tripId, title, content, category, isPinned } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const note = await db.note.create({
      data: {
        tripId,
        title,
        content,
        category: category || "General",
        isPinned: isPinned ?? false,
      },
    });

    revalidatePath(`/trips/${tripId}/notes`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: note };
  } catch (error) {
    console.error("Error creating note:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create note" };
  }
}

export async function updateNote(input: UpdateNoteInput) {
  try {
    const validated = updateNoteSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { id, tripId, title, content, category, isPinned } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await db.note.update({
      where: { id },
      data: {
        title,
        content,
        category: category || "General",
        isPinned: isPinned ?? false,
      },
    });

    revalidatePath(`/trips/${tripId}/notes`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating note:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update note" };
  }
}

export async function deleteNote(input: DeleteNoteInput) {
  try {
    const validated = deleteNoteSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Invalid input" };
    }

    const { id, tripId } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    await db.note.delete({
      where: { id },
    });

    revalidatePath(`/trips/${tripId}/notes`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error deleting note:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete note" };
  }
}

export async function togglePinNote(input: TogglePinNoteInput) {
  try {
    const validated = togglePinNoteSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Invalid input" };
    }

    const { id, tripId, isPinned } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await db.note.update({
      where: { id },
      data: { isPinned },
    });

    revalidatePath(`/trips/${tripId}/notes`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling pin on note:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to pin note" };
  }
}
