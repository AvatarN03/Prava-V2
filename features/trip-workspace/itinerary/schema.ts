import { z } from "zod";

export const createItinerarySchema = z.object({
  tripId: z.string().uuid("Invalid trip ID"),
  dayNumber: z.number().int().min(1).optional().nullable(),
  date: z.string().optional().nullable(),
  time: z.string().trim().max(50).optional().nullable(),
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  location: z.string().trim().max(150).optional().nullable(),
  category: z.string().trim().max(50).default("Activity"),
  cost: z.number().nonnegative().optional().nullable(),
  order: z.number().int().default(0),
});

export const updateItinerarySchema = z.object({
  id: z.string().uuid("Invalid item ID"),
  tripId: z.string().uuid("Invalid trip ID"),
  dayNumber: z.number().int().min(1).optional().nullable(),
  date: z.string().optional().nullable(),
  time: z.string().trim().max(50).optional().nullable(),
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  location: z.string().trim().max(150).optional().nullable(),
  category: z.string().trim().max(50).default("Activity"),
  cost: z.number().nonnegative().optional().nullable(),
  order: z.number().int().default(0),
});

export const deleteItinerarySchema = z.object({
  id: z.string().uuid("Invalid item ID"),
  tripId: z.string().uuid("Invalid trip ID"),
});

export type CreateItineraryInput = z.infer<typeof createItinerarySchema>;
export type UpdateItineraryInput = z.infer<typeof updateItinerarySchema>;
export type DeleteItineraryInput = z.infer<typeof deleteItinerarySchema>;
