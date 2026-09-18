"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "../common/auth-check";
import {
  createItinerarySchema,
  updateItinerarySchema,
  deleteItinerarySchema,
  CreateItineraryInput,
  UpdateItineraryInput,
  DeleteItineraryInput,
} from "./schema";

export async function createItineraryItem(input: CreateItineraryInput) {
  try {
    const validated = createItinerarySchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { tripId, dayNumber, date, time, title, description, location, category, cost, order } = validated.data;
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const item = await db.itineraryItem.create({
      data: {
        tripId,
        dayNumber: dayNumber ?? null,
        date: date ? new Date(date) : null,
        time: time || null,
        title,
        description: description || null,
        location: location || null,
        category: category || "Activity",
        cost: cost ?? null,
        order: order ?? 0,
      },
    });

    revalidatePath(`/trips/${tripId}/itinerary`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: item };
  } catch (error) {
    console.error("Error creating itinerary item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create item" };
  }
}

export async function updateItineraryItem(input: UpdateItineraryInput) {
  try {
    const validated = updateItinerarySchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { id, tripId, dayNumber, date, time, title, description, location, category, cost, order } = validated.data;
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await db.itineraryItem.update({
      where: { id },
      data: {
        dayNumber: dayNumber ?? null,
        date: date ? new Date(date) : null,
        time: time || null,
        title,
        description: description || null,
        location: location || null,
        category: category || "Activity",
        cost: cost ?? null,
        order: order ?? 0,
      },
    });

    revalidatePath(`/trips/${tripId}/itinerary`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating itinerary item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update item" };
  }
}

export async function deleteItineraryItem(input: DeleteItineraryInput) {
  try {
    const validated = deleteItinerarySchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Invalid input" };
    }

    const { id, tripId } = validated.data;
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    await db.itineraryItem.delete({
      where: { id },
    });

    revalidatePath(`/trips/${tripId}/itinerary`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error deleting itinerary item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete item" };
  }
}
