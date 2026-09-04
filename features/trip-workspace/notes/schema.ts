import { z } from "zod";

export const createNoteSchema = z.object({
  tripId: z.string().uuid("Invalid trip ID"),
  title: z.string().trim().min(1, "Title is required").max(150),
  content: z.string().trim().min(1, "Content is required"),
  category: z.string().trim().max(50).default("General"),
  isPinned: z.boolean().default(false),
});

export const updateNoteSchema = z.object({
  id: z.string().uuid("Invalid note ID"),
  tripId: z.string().uuid("Invalid trip ID"),
  title: z.string().trim().min(1, "Title is required").max(150),
  content: z.string().trim().min(1, "Content is required"),
  category: z.string().trim().max(50).default("General"),
  isPinned: z.boolean().default(false),
});

export const deleteNoteSchema = z.object({
  id: z.string().uuid("Invalid note ID"),
  tripId: z.string().uuid("Invalid trip ID"),
});

export const togglePinNoteSchema = z.object({
  id: z.string().uuid("Invalid note ID"),
  tripId: z.string().uuid("Invalid trip ID"),
  isPinned: z.boolean(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type DeleteNoteInput = z.infer<typeof deleteNoteSchema>;
export type TogglePinNoteInput = z.infer<typeof togglePinNoteSchema>;
