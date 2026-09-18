"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "../common/auth-check";
import {
  createAccommodationSchema,
  updateAccommodationSchema,
  deleteAccommodationSchema,
  CreateAccommodationInput,
  UpdateAccommodationInput,
  DeleteAccommodationInput,
} from "./schema";

export async function createAccommodation(input: CreateAccommodationInput) {
  try {
    const validated = createAccommodationSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { tripId, name, type, address, checkIn, checkOut, confirmationCode, contactPhone, cost, currency, notes } = validated.data;
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const item = await db.accommodation.create({
      data: {
        tripId,
        name,
        type: type || "Hotel",
        address: address || null,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        confirmationCode: confirmationCode || null,
        contactPhone: contactPhone || null,
        cost: cost ?? null,
        currency: currency || "USD",
        notes: notes || null,
      },
    });

    revalidatePath(`/trips/${tripId}/accommodations`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: item };
  } catch (error) {
    console.error("Error creating accommodation:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create stay" };
  }
}

export async function updateAccommodation(input: UpdateAccommodationInput) {
  try {
    const validated = updateAccommodationSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { id, tripId, name, type, address, checkIn, checkOut, confirmationCode, contactPhone, cost, currency, notes } = validated.data;
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await db.accommodation.update({
      where: { id },
      data: {
        name,
        type: type || "Hotel",
        address: address || null,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        confirmationCode: confirmationCode || null,
        contactPhone: contactPhone || null,
        cost: cost ?? null,
        currency: currency || "USD",
        notes: notes || null,
      },
    });

    revalidatePath(`/trips/${tripId}/accommodations`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating accommodation:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update stay" };
  }
}

export async function deleteAccommodation(input: DeleteAccommodationInput) {
  try {
    const validated = deleteAccommodationSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Invalid input" };
    }

    const { id, tripId } = validated.data;
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    await db.accommodation.delete({
      where: { id },
    });

    revalidatePath(`/trips/${tripId}/accommodations`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error deleting accommodation:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete stay" };
  }
}
