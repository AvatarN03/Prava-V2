import { z } from "zod";

export const vaultCategoryEnum = z.enum([
  "Resource",
  "Visa & Embassy",
  "Flights & Transit",
  "Guides & Blogs",
  "Accommodations",
  "Gear & Packing",
  "Food & Dining",
  "Emergency & Safety",
]);

export const createVaultLinkSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  url: z.string().trim().url("Valid URL is required"),
  category: vaultCategoryEnum.default("Resource"),
  description: z.string().trim().max(1000).optional().nullable(),
});

export const updateVaultLinkSchema = z.object({
  id: z.string().uuid("Invalid link ID"),
  title: z.string().trim().min(1, "Title is required").max(120),
  url: z.string().trim().url("Valid URL is required"),
  category: vaultCategoryEnum.default("Resource"),
  description: z.string().trim().max(1000).optional().nullable(),
});

export const attachVaultLinkToTripSchema = z.object({
  linkId: z.string().uuid("Invalid link ID"),
  tripId: z.string().uuid("Invalid trip ID"),
});

export type CreateVaultLinkInput = z.infer<typeof createVaultLinkSchema>;
export type UpdateVaultLinkInput = z.infer<typeof updateVaultLinkSchema>;
export type AttachVaultLinkToTripInput = z.infer<typeof attachVaultLinkToTripSchema>;
export type VaultCategory = z.infer<typeof vaultCategoryEnum>;
