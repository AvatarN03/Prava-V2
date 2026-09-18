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
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
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
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
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
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
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

/**
 * Server Action: 1-Click Seed of Essential Travel Packing & Document Checklist
 */
export async function seedEssentialChecklist(tripId: string) {
  try {
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const ESSENTIALS = [
      { title: "Check Passport expiration (valid for 6+ months)", category: "Documents" },
      { title: "Verify Visa and entry requirements", category: "Documents" },
      { title: "Purchase Travel Insurance policy", category: "Documents" },
      { title: "Universal travel power adapter & plug converter", category: "Packing" },
      { title: "Prescription medications & mini first-aid kit", category: "Packing" },
      { title: "Portable power bank & charging cables", category: "Packing" },
      { title: "Download offline maps (Google Maps / Maps.me)", category: "Preparation" },
      { title: "Notify credit card bank / check international fees", category: "Finance" },
      { title: "Save copies of lodging bookings & confirmation codes", category: "Documents" },
    ];

    await db.checklistItem.createMany({
      data: ESSENTIALS.map((item, idx) => ({
        tripId,
        title: item.title,
        category: item.category,
        isCompleted: false,
        order: idx,
      })),
    });

    revalidatePath(`/trips/${tripId}/checklist`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, count: ESSENTIALS.length };
  } catch (error) {
    console.error("Error seeding checklist:", error);
    return { success: false, error: "Failed to add starter checklist" };
  }
}

export async function toggleChecklistItem(input: ToggleChecklistItemInput) {
  try {
    const validated = toggleChecklistItemSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Invalid input" };
    }

    const { id, tripId, isCompleted } = validated.data;
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
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
