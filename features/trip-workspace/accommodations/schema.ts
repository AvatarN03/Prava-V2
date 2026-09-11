import { z } from "zod";

export const createAccommodationSchema = z.object({
  tripId: z.string().uuid("Invalid trip ID"),
  name: z.string().trim().min(1, "Accommodation name is required").max(120),
  type: z.string().trim().max(50).default("Hotel"),
  address: z.string().trim().max(200).optional().nullable(),
  checkIn: z.string().optional().nullable(),
  checkOut: z.string().optional().nullable(),
  confirmationCode: z.string().trim().max(100).optional().nullable(),
  contactPhone: z.string().trim().max(50).optional().nullable(),
  cost: z.number().nonnegative().optional().nullable(),
  currency: z.string().max(10).default("USD"),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const updateAccommodationSchema = z.object({
  id: z.string().uuid("Invalid accommodation ID"),
  tripId: z.string().uuid("Invalid trip ID"),
  name: z.string().trim().min(1, "Accommodation name is required").max(120),
  type: z.string().trim().max(50).default("Hotel"),
  address: z.string().trim().max(200).optional().nullable(),
  checkIn: z.string().optional().nullable(),
  checkOut: z.string().optional().nullable(),
  confirmationCode: z.string().trim().max(100).optional().nullable(),
  contactPhone: z.string().trim().max(50).optional().nullable(),
  cost: z.number().nonnegative().optional().nullable(),
  currency: z.string().max(10).default("USD"),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const deleteAccommodationSchema = z.object({
  id: z.string().uuid("Invalid accommodation ID"),
  tripId: z.string().uuid("Invalid trip ID"),
});

export type CreateAccommodationInput = z.infer<typeof createAccommodationSchema>;
export type UpdateAccommodationInput = z.infer<typeof updateAccommodationSchema>;
export type DeleteAccommodationInput = z.infer<typeof deleteAccommodationSchema>;
