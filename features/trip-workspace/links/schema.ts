import { z } from "zod";

export const createLinkSchema = z.object({
  tripId: z.string().uuid("Invalid trip ID"),
  title: z.string().trim().min(1, "Title is required").max(120),
  url: z.string().trim().url("Please enter a valid URL (including http:// or https://)"),
  category: z.string().trim().max(50).default("Resource"),
  description: z.string().trim().max(500).optional().nullable(),
});

export const updateLinkSchema = z.object({
  id: z.string().uuid("Invalid link ID"),
  tripId: z.string().uuid("Invalid trip ID"),
  title: z.string().trim().min(1, "Title is required").max(120),
  url: z.string().trim().url("Please enter a valid URL"),
  category: z.string().trim().max(50).default("Resource"),
  description: z.string().trim().max(500).optional().nullable(),
});

export const deleteLinkSchema = z.object({
  id: z.string().uuid("Invalid link ID"),
  tripId: z.string().uuid("Invalid trip ID"),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type DeleteLinkInput = z.infer<typeof deleteLinkSchema>;
