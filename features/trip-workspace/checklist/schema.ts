import { z } from "zod";

export const createChecklistItemSchema = z.object({
  tripId: z.string().uuid("Invalid trip ID"),
  title: z.string().trim().min(1, "Task title is required").max(150),
  category: z.string().trim().max(50).default("General"),
  dueDate: z.string().optional().nullable(),
  order: z.number().int().default(0),
});

export const updateChecklistItemSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
  tripId: z.string().uuid("Invalid trip ID"),
  title: z.string().trim().min(1, "Task title is required").max(150),
  category: z.string().trim().max(50).default("General"),
  dueDate: z.string().optional().nullable(),
  isCompleted: z.boolean().default(false),
  order: z.number().int().default(0),
});

export const deleteChecklistItemSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
  tripId: z.string().uuid("Invalid trip ID"),
});

export const toggleChecklistItemSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
  tripId: z.string().uuid("Invalid trip ID"),
  isCompleted: z.boolean(),
});

export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>;
export type DeleteChecklistItemInput = z.infer<typeof deleteChecklistItemSchema>;
export type ToggleChecklistItemInput = z.infer<typeof toggleChecklistItemSchema>;
