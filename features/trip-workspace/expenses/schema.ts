import { z } from "zod";

export const expenseCategoryEnum = z.enum([
  "FLIGHT",
  "ACCOMMODATION",
  "TRANSPORT",
  "FOOD",
  "ACTIVITIES",
  "SHOPPING",
  "OTHER",
]);

export const createExpenseSchema = z.object({
  tripId: z.string().uuid("Invalid trip ID"),
  title: z.string().trim().min(1, "Title is required").max(120),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().max(10).default("USD"),
  category: expenseCategoryEnum.default("OTHER"),
  date: z.string().optional().nullable(),
  paidBy: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const updateExpenseSchema = z.object({
  id: z.string().uuid("Invalid expense ID"),
  tripId: z.string().uuid("Invalid trip ID"),
  title: z.string().trim().min(1, "Title is required").max(120),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().max(10).default("USD"),
  category: expenseCategoryEnum.default("OTHER"),
  date: z.string().optional().nullable(),
  paidBy: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const deleteExpenseSchema = z.object({
  id: z.string().uuid("Invalid expense ID"),
  tripId: z.string().uuid("Invalid trip ID"),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type DeleteExpenseInput = z.infer<typeof deleteExpenseSchema>;
export type ExpenseCategory = z.infer<typeof expenseCategoryEnum>;
