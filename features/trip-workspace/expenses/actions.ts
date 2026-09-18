"use server";

import { revalidatePath } from "next/cache";

import { syncUserProfile } from "@/lib/auth/sync-profile";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { verifyTripOwnership } from "../common/auth-check";
import {
  CreateExpenseInput,
  createExpenseSchema,
  CreateGeneralExpenseInput,
  createGeneralExpenseSchema,
  DeleteExpenseInput,
  deleteExpenseSchema,
  UpdateExpenseInput,
  updateExpenseSchema,
} from "./schema";

export async function createExpense(input: CreateExpenseInput) {
  try {
    const validated = createExpenseSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
    }

    const { tripId, title, amount, currency, category, date, paidBy, notes } = validated.data;
    const { authorized, user, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    const item = await db.expense.create({
      data: {
        profileId: user?.id || null,
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
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
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
    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
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

/**
 * Record a general travel overhead expense (e.g. Travel Gear, Passport/Visa fees, Annual Multi-Trip Insurance)
 */
export async function createGeneralTravelExpense(input: CreateGeneralExpenseInput) {
  try {
    const validated = createGeneralExpenseSchema.safeParse(input);
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

    const { title, amount, currency, category, date, paidBy, notes } = validated.data;

    const item = await db.expense.create({
      data: {
        profileId: profile.id,
        tripId: null,
        title,
        amount,
        currency: currency || "USD",
        category,
        date: date ? new Date(date) : new Date(),
        paidBy: paidBy || null,
        notes: notes || null,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: item };
  } catch (error) {
    console.error("Error creating general travel expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record travel overhead",
    };
  }
}

/**
 * Fetch all unassigned general travel overhead expenses for the authenticated user
 */
export async function getGeneralTravelExpenses() {
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

    const items = await db.expense.findMany({
      where: {
        profileId: profile.id,
        tripId: null,
      },
      orderBy: { date: "desc" },
    });

    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching general travel expenses:", error);
    return { success: false, error: "Failed to load expenses", data: [] };
  }
}

/**
 * Delete a general travel overhead expense
 */
export async function deleteGeneralTravelExpense(id: string) {
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

    const existing = await db.expense.findFirst({
      where: { id, profileId: profile.id, tripId: null },
    });

    if (!existing) {
      return { success: false, error: "Expense not found or unauthorized" };
    }

    await db.expense.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting general travel expense:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete expense",
    };
  }
}

/**
 * Update target budget for a trip
 */
export async function updateTripBudget(tripId: string, budget: number | string | null) {
  try {
    if (!tripId) {
      return { success: false, error: "Trip ID is required" };
    }

    const { authorized, isOwner } = await verifyTripOwnership(tripId);
    if (!authorized || !isOwner) {
      return { success: false, error: "Unauthorized" };
    }

    let parsedBudget: number | null = null;
    if (budget !== null && budget !== undefined) {
      const num = typeof budget === "string" ? parseFloat(budget.replace(/[^0-9.]/g, "")) : Number(budget);
      if (!isNaN(num) && num > 0) {
        parsedBudget = num;
      }
    }

    const updated = await db.trip.update({
      where: { id: tripId },
      data: {
        budget: parsedBudget,
      },
      select: { id: true, budget: true },
    });

    revalidatePath(`/trips/${tripId}/expenses`);
    revalidatePath(`/trips/${tripId}/overview`);
    revalidatePath("/dashboard");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating trip budget:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update budget",
    };
  }
}

