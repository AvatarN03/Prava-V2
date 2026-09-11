import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  coverImageUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  linkedTripId: z.string().uuid().optional().nullable(),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

/**
 * Generate a URL-safe slug from a title string.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 120);
}
