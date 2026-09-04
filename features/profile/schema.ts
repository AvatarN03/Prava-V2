import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().max(100).optional().nullable(),
  username: z.string().max(30).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  isPublic: z.boolean().optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
