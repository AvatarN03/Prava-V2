import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().max(100).optional().nullable(),
  username: z.string().max(30).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  isPublic: z.boolean().optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateGeneralPreferencesSchema = z.object({
  defaultCurrency: z.string().min(1).max(10).default("USD"),
  dateFormat: z.string().min(1).max(30).default("MMM D, YYYY"),
  aiAutoPropose: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  offlineMode: z.boolean().default(true),
  travelPreferences: z.string().max(1000).optional().nullable(),
});

export type UpdateGeneralPreferencesInput = z.infer<typeof updateGeneralPreferencesSchema>;

