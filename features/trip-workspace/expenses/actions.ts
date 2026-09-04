"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "../common/auth-check";
import {
  createExpenseSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
  CreateExpenseInput,
  UpdateExpenseInput,
  DeleteExpenseInput,
} from "./schema";

export async function createExpense(input: CreateExpenseInput) {
  try {
    const validated = createExpenseSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { tripId, title, amount, currency, category, date, paidBy, notes } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const item = await db.expense.create({
      data: {
        tripId,
        title,
        amount,
        currency: currency || "USD",
        category,
        date: date ? new Date(date) : new Date(),
        paidBy: paidBy || null,
        notes: notes || null,
      },
    });

    revalidatePath(`/trips/${tripId}/expenses`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: item };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to record expense" };
  }
}

export async function updateExpense(input: UpdateExpenseInput) {
  try {
    const validated = updateExpenseSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { id, tripId, title, amount, currency, category, date, paidBy, notes } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await db.expense.update({
      where: { id },
      data: {
        title,
        amount,
        currency: currency || "USD",
        category,
        date: date ? new Date(date) : new Date(),
        paidBy: paidBy || null,
        notes: notes || null,
      },
    });

    revalidatePath(`/trips/${tripId}/expenses`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update expense" };
  }
}

export async function deleteExpense(input: DeleteExpenseInput) {
  try {
    const validated = deleteExpenseSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Invalid input" };
    }

    const { id, tripId } = validated.data;
    const { authorized } = await verifyTripOwnership(tripId);
    if (!authorized) {
      return { success: false, error: "Unauthorized" };
    }

    await db.expense.delete({
      where: { id },
    });

    revalidatePath(`/trips/${tripId}/expenses`);
    revalidatePath(`/trips/${tripId}/overview`);

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete expense" };
  }
}
