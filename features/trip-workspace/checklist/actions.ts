"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "../common/auth-check";
import {
  createChecklistItemSchema,
  updateChecklistItemSchema,
  deleteChecklistItemSchema,
  toggleChecklistItemSchema,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
  DeleteChecklistItemInput,
  ToggleChecklistItemInput,
} from "./schema";

export async function createChecklistItem(input: CreateChecklistItemInput) {
  try {
    const validated = createChecklistItemSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { tripId, title, category, dueDate, order } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const item = await db.checklistItem.create({
      data: {
        tripId,
        title,
        category: category || "General",
        dueDate: dueDate ? new Date(dueDate) : null,
        order: order ?? 0,
        isCompleted: false,
      },
    });

    revalidatePath(`/trips/${tripId}/checklist`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: item };
  } catch (error) {
    console.error("Error creating checklist item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to add task" };
  }
}

export async function updateChecklistItem(input: UpdateChecklistItemInput) {
  try {
    const validated = updateChecklistItemSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { id, tripId, title, category, dueDate, isCompleted, order } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await db.checklistItem.update({
      where: { id },
      data: {
        title,
        category: category || "General",
        dueDate: dueDate ? new Date(dueDate) : null,
        isCompleted,
        order: order ?? 0,
      },
    });

    revalidatePath(`/trips/${tripId}/checklist`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update task" };
  }
}

export async function deleteChecklistItem(input: DeleteChecklistItemInput) {
  try {
    const validated = deleteChecklistItemSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Invalid input" };
    }

    const { id, tripId } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    await db.checklistItem.delete({
      where: { id },
    });

    revalidatePath(`/trips/${tripId}/checklist`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete task" };
  }
}

export async function toggleChecklistItem(input: ToggleChecklistItemInput) {
  try {
    const validated = toggleChecklistItemSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Invalid input" };
    }

    const { id, tripId, isCompleted } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await db.checklistItem.update({
      where: { id },
      data: { isCompleted },
    });

    revalidatePath(`/trips/${tripId}/checklist`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling checklist item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle task" };
  }
}
