"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { blogPostSchema, BlogPostInput, generateSlug } from "./schema";

/**
 * Create a new blog post (draft by default).
 */
export async function createBlogPost(input: BlogPostInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = blogPostSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid blog post data",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { title, excerpt, content, coverImageUrl, tags, status, linkedTripId } = parsed.data;

    // Generate unique slug
    let baseSlug = parsed.data.slug || generateSlug(title);
    let slug = baseSlug;
    let attempt = 0;

    while (true) {
      const existing = await db.blogPost.findUnique({ where: { slug }, select: { id: true } });
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const isPublishing = status === "PUBLISHED";

    const post = await db.blogPost.create({
      data: {
        profileId: user.id,
        slug,
        title: title.trim(),
        excerpt: excerpt?.trim() || null,
        content,
        coverImageUrl: coverImageUrl || null,
        tags: tags || [],
        status: status || "DRAFT",
        linkedTripId: linkedTripId || null,
        publishedAt: isPublishing ? new Date() : null,
      },
    });

    revalidatePath("/stories");
    revalidatePath("/profile");

    return { success: true, post };
  } catch (error) {
    console.error("Error creating blog post:", error);
    return { success: false, error: "Failed to create blog post" };
  }
}

/**
 * Update an existing blog post.
 */
export async function updateBlogPost(postId: string, input: BlogPostInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const existing = await db.blogPost.findFirst({
      where: { id: postId, profileId: user.id },
    });

    if (!existing) {
      return { success: false, error: "Blog post not found or permission denied" };
    }

    const parsed = blogPostSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid blog post data" };
    }

    const { title, excerpt, content, coverImageUrl, tags, status, linkedTripId } = parsed.data;

    // Handle slug changes
    let slug = existing.slug;
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      let baseSlug = parsed.data.slug;
      slug = baseSlug;
      let attempt = 0;
      while (true) {
        const dup = await db.blogPost.findFirst({
          where: { slug, id: { not: postId } },
          select: { id: true },
        });
        if (!dup) break;
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      }
    }

    const wasPublished = existing.status === "PUBLISHED";
    const isPublishing = status === "PUBLISHED";

    const post = await db.blogPost.update({
      where: { id: postId },
      data: {
        slug,
        title: title.trim(),
        excerpt: excerpt?.trim() || null,
        content,
        coverImageUrl: coverImageUrl || null,
        tags: tags || [],
        status: status || existing.status,
        linkedTripId: linkedTripId || null,
        publishedAt: isPublishing && !wasPublished ? new Date() : existing.publishedAt,
      },
    });

    revalidatePath("/stories");
    revalidatePath(`/stories/${post.slug}`);
    revalidatePath("/profile");

    return { success: true, post };
  } catch (error) {
    console.error("Error updating blog post:", error);
    return { success: false, error: "Failed to update blog post" };
  }
}

/**
 * Delete a blog post.
 */
export async function deleteBlogPost(postId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const post = await db.blogPost.findFirst({
      where: { id: postId, profileId: user.id },
    });

    if (!post) {
      return { success: false, error: "Blog post not found or permission denied" };
    }

    await db.blogPost.delete({ where: { id: postId } });

    revalidatePath("/stories");
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return { success: false, error: "Failed to delete blog post" };
  }
}

/**
 * Fetch the current user's blog posts (all statuses).
 */
export async function getMyBlogPosts() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized", posts: [] };
    }

    const posts = await db.blogPost.findMany({
      where: { profileId: user.id },
      include: {
        linkedTrip: { select: { id: true, title: true, destination: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, posts };
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return { success: false, error: "Failed to load blog posts", posts: [] };
  }
}

/**
 * Fetch a single blog post by slug OR ID for the owner (editing).
 */
export async function getBlogPostForEdit(slugOrId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

    const post = await db.blogPost.findFirst({
      where: {
        AND: [
          { profileId: user.id },
          {
            OR: [
              { slug: slugOrId },
              ...(isValidUuid ? [{ id: slugOrId }] : []),
            ],
          },
        ],
      },
      include: {
        linkedTrip: { select: { id: true, title: true, destination: true } },
      },
    });

    if (!post) {
      return { success: false, error: "Blog post not found" };
    }

    return { success: true, post };
  } catch (error) {
    console.error("Error fetching blog post for edit:", error);
    return { success: false, error: "Failed to load blog post" };
  }
}

/**
 * Fetch a story by slug OR id (public if published, or accessible to the author if draft).
 */
export async function getPublishedStory(slugOrId: string) {
  try {
    if (!slugOrId) {
      return { success: false, error: "Invalid story identifier" };
    }

    let user = null;
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      user = null;
    }

    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

    const post = await db.blogPost.findFirst({
      where: {
        AND: [
          {
            OR: [
              { slug: slugOrId },
              ...(isValidUuid ? [{ id: slugOrId }] : []),
            ],
          },
          {
            OR: [
              { status: "PUBLISHED" },
              ...(user ? [{ profileId: user.id }] : []),
            ],
          },
        ],
      },
      include: {
        profile: {
          select: {
            fullName: true,
            username: true,
            avatarUrl: true,
            isPublic: true,
          },
        },
        linkedTrip: {
          select: {
            id: true,
            title: true,
            destination: true,
            coverImageUrl: true,
            isPublic: true,
          },
        },
      },
    });

    if (!post) {
      return { success: false, error: "Story not found" };
    }

    return { success: true, story: post };
  } catch (error) {
    console.error("Error fetching published story:", error);
    return { success: false, error: "Failed to load story" };
  }
}

/**
 * Fetch all published stories for public discovery.
 */
export async function getAllPublishedStories() {
  try {
    const posts = await db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      include: {
        profile: {
          select: {
            fullName: true,
            username: true,
            avatarUrl: true,
            isPublic: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
    });

    return { success: true, stories: posts };
  } catch (error) {
    console.error("Error fetching published stories:", error);
    return { success: false, error: "Failed to load stories", stories: [] };
  }
}
