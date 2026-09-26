"use server";

import { revalidatePath } from "next/cache";

import { Pool } from "pg";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime, generateSlug } from "@/lib/utils";

import {
  CreateDiscussionInput,
  ForumCategory,
  ForumPost,
  ForumReply,
  SaveTipToTripInput,
  UpdateDiscussionInput,
  UserTripOption,
} from "@/features/community/forum-types";

// Shared connection pool singleton for forum SQL queries to prevent connection exhaustion
const globalForPg = globalThis as unknown as { pgPool?: Pool };
const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

/**
 * Format category identifier to human-readable label
 */
function getCategoryLabel(category: string): string {
  switch (category) {
    case "ROUTE_ADVICE":
      return "Route Advice";
    case "RECOMMENDATIONS":
      return "Recommendations";
    case "PACKING_GEAR":
      return "Gear & Packing";
    case "LIVE_REPORTS":
      return "Live Trip Reports";
    case "TEMPLATES":
      return "Itineraries & Blueprints";
    case "DISCUSSIONS":
    default:
      return "General Discussion";
  }
}


/**
 * Fetch forum discussions with author profiles, attached trips, and reply counts
 */
export async function getForumDiscussions(
  category?: ForumCategory,
  searchQuery?: string
): Promise<ForumPost[]> {
  try {
    let currentUserId: string | null = null;
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      currentUserId = data.user?.id || null;
    } catch {
      currentUserId = null;
    }

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (category && category !== "ALL") {
      values.push(category);
      conditions.push(`cp.category = $${values.length}`);
    }

    if (searchQuery && searchQuery.trim()) {
      values.push(`%${searchQuery.trim().toLowerCase()}%`);
      const searchIdx = values.length;
      conditions.push(
        `(LOWER(cp.title) LIKE $${searchIdx} OR LOWER(cp.content) LIKE $${searchIdx} OR LOWER(COALESCE(cp.destination, '')) LIKE $${searchIdx})`
      );
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const upvoteSubquery = currentUserId
      ? `EXISTS (SELECT 1 FROM community_post_upvotes cpu WHERE cpu.post_id = cp.id AND cpu.profile_id = '${currentUserId}')`
      : `false`;

    const savedSubquery = currentUserId
      ? `EXISTS (SELECT 1 FROM community_saved_posts csp WHERE csp.post_id = cp.id AND csp.profile_id = '${currentUserId}')`
      : `false`;

    const isAuthorSubquery = currentUserId
      ? `(cp.profile_id = '${currentUserId}')`
      : `false`;

    const sql = `
      SELECT 
        cp.id,
        cp.slug,
        cp.profile_id,
        cp.title,
        cp.content,
        cp.category,
        cp.destination,
        cp.tags,
        cp.cover_image_url,
        cp.images,
        cp.is_edited,
        cp.upvotes,
        cp.views,
        cp.created_at,
        p.full_name AS author_name,
        p.username AS author_username,
        p.avatar_url AS author_avatar_url,
        p.is_public AS is_creator_public,
        p.bio AS author_bio,
        t.id AS trip_id,
        t.title AS trip_title,
        t.destination AS trip_destination,
        t.start_date AS trip_start_date,
        t.end_date AS trip_end_date,
        t.cover_image_url AS trip_cover_image_url,
        (SELECT COUNT(*)::int FROM community_replies cr WHERE cr.post_id = cp.id) AS replies_count,
        ${upvoteSubquery} AS has_upvoted,
        ${savedSubquery} AS has_saved,
        ${isAuthorSubquery} AS is_author
      FROM community_posts cp
      LEFT JOIN profiles p ON cp.profile_id = p.id
      LEFT JOIN trips t ON cp.linked_trip_id = t.id
      ${whereClause}
      ORDER BY cp.created_at DESC
      LIMIT 50;
    `;

    const res = await pool.query(sql, values);

    return res.rows.map((row) => {
      let linkedTrip = null;
      if (row.trip_id) {
        const days =
          row.trip_start_date && row.trip_end_date
            ? Math.max(
                1,
                Math.ceil(
                  (new Date(row.trip_end_date).getTime() -
                    new Date(row.trip_start_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1
              )
            : 5;

        linkedTrip = {
          id: row.trip_id,
          title: row.trip_title,
          destination: row.trip_destination || "Global",
          durationDays: days,
          activityCount: 4,
          accommodationCount: 1,
          coverImageUrl: row.trip_cover_image_url,
        };
      }

      return {
        id: row.id,
        slug: row.slug || row.id,
        authorId: row.profile_id,
        title: row.title,
        content: row.content,
        category: row.category as ForumCategory,
        categoryLabel: getCategoryLabel(row.category),
        tags: Array.isArray(row.tags) ? row.tags : [],
        destination: row.destination,
        coverImageUrl: row.cover_image_url || (row.images && row.images[0]) || null,
        images: Array.isArray(row.images) ? row.images : [],
        isEdited: Boolean(row.is_edited),
        authorName: row.author_name || row.author_username || "Traveler",
        authorUsername: row.author_username,
        authorAvatarUrl: row.author_avatar_url,
        isCreatorPublic: Boolean(row.is_creator_public),
        authorBio: row.author_bio,
        createdAt: formatRelativeTime(row.created_at),
        upvotes: Number(row.upvotes) || 0,
        views: Number(row.views) || 0,
        repliesCount: Number(row.replies_count) || 0,
        hasUpvoted: Boolean(row.has_upvoted),
        hasSaved: Boolean(row.has_saved),
        isAuthor: Boolean(row.is_author),
        linkedTrip,
      };
    });
  } catch (error) {
    console.error("Error fetching forum discussions:", error);
    return [];
  }
}

/**
 * Fetch a single discussion thread by slug or UUID
 */
export async function getForumPostBySlug(slugOrId: string): Promise<ForumPost | null> {
  try {
    let currentUserId: string | null = null;
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      currentUserId = data.user?.id || null;
    } catch {
      currentUserId = null;
    }

    const decoded = decodeURIComponent(slugOrId).trim();
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      decoded
    );

    const updateCondition = isValidUuid ? "id = $1 OR slug = $1" : "slug = $1";

    // Increment view count safely without invalid table alias
    try {
      await pool.query(`UPDATE community_posts SET views = views + 1 WHERE ${updateCondition}`, [
        decoded,
      ]);
    } catch (viewError) {
      console.warn("Non-fatal error incrementing discussion views:", viewError);
    }

    const upvoteSubquery = currentUserId
      ? `EXISTS (SELECT 1 FROM community_post_upvotes cpu WHERE cpu.post_id = cp.id AND cpu.profile_id = '${currentUserId}')`
      : `false`;

    const savedSubquery = currentUserId
      ? `EXISTS (SELECT 1 FROM community_saved_posts csp WHERE csp.post_id = cp.id AND csp.profile_id = '${currentUserId}')`
      : `false`;

    const isAuthorSubquery = currentUserId
      ? `(cp.profile_id = '${currentUserId}')`
      : `false`;

    const selectCondition = isValidUuid
      ? "cp.id = $1::uuid OR LOWER(cp.slug) = LOWER($1)"
      : "LOWER(cp.slug) = LOWER($1)";

    const postSql = `
      SELECT 
        cp.id,
        cp.slug,
        cp.profile_id,
        cp.title,
        cp.content,
        cp.category,
        cp.destination,
        cp.tags,
        cp.cover_image_url,
        cp.images,
        cp.is_edited,
        cp.upvotes,
        cp.views,
        cp.created_at,
        p.full_name AS author_name,
        p.username AS author_username,
        p.avatar_url AS author_avatar_url,
        p.is_public AS is_creator_public,
        p.bio AS author_bio,
        t.id AS trip_id,
        t.title AS trip_title,
        t.destination AS trip_destination,
        t.start_date AS trip_start_date,
        t.end_date AS trip_end_date,
        t.cover_image_url AS trip_cover_image_url,
        ${upvoteSubquery} AS has_upvoted,
        ${savedSubquery} AS has_saved,
        ${isAuthorSubquery} AS is_author
      FROM community_posts cp
      LEFT JOIN profiles p ON cp.profile_id = p.id
      LEFT JOIN trips t ON cp.linked_trip_id = t.id
      WHERE ${selectCondition};
    `;

    const postRes = await pool.query(postSql, [decoded]);
    if (postRes.rows.length === 0) return null;
    const row = postRes.rows[0];

    // Fetch replies
    const repliesSql = `
      SELECT 
        cr.id,
        cr.post_id,
        cr.profile_id,
        cr.content,
        cr.upvotes,
        cr.is_edited,
        cr.created_at,
        p.full_name AS author_name,
        p.username AS author_username,
        p.avatar_url AS author_avatar_url,
        p.is_public AS is_creator_public,
        ${currentUserId ? `(cr.profile_id = '${currentUserId}')` : `false`} AS is_author
      FROM community_replies cr
      LEFT JOIN profiles p ON cr.profile_id = p.id
      WHERE cr.post_id = $1
      ORDER BY cr.created_at DESC;
    `;

    const repliesRes = await pool.query(repliesSql, [row.id]);

    const replies: ForumReply[] = repliesRes.rows.map((r) => ({
      id: r.id,
      postId: r.post_id,
      authorId: r.profile_id,
      authorName: r.author_name || r.author_username || "Traveler",
      authorUsername: r.author_username,
      authorAvatarUrl: r.author_avatar_url,
      isCreatorPublic: Boolean(r.is_creator_public),
      content: r.content,
      createdAt: formatRelativeTime(r.created_at),
      upvotes: Number(r.upvotes) || 0,
      isEdited: Boolean(r.is_edited),
      isAuthor: Boolean(r.is_author),
    }));

    let linkedTrip = null;
    if (row.trip_id) {
      const days =
        row.trip_start_date && row.trip_end_date
          ? Math.max(
              1,
              Math.ceil(
                (new Date(row.trip_end_date).getTime() -
                  new Date(row.trip_start_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              ) + 1
            )
          : 5;

      linkedTrip = {
        id: row.trip_id,
        title: row.trip_title,
        destination: row.trip_destination || "Global",
        durationDays: days,
        activityCount: 4,
        accommodationCount: 1,
        coverImageUrl: row.trip_cover_image_url,
      };
    }

    return {
      id: row.id,
      slug: row.slug || row.id,
      authorId: row.profile_id,
      title: row.title,
      content: row.content,
      category: row.category as ForumCategory,
      categoryLabel: getCategoryLabel(row.category),
      tags: Array.isArray(row.tags) ? row.tags : [],
      destination: row.destination,
      coverImageUrl: row.cover_image_url || (row.images && row.images[0]) || null,
      images: Array.isArray(row.images) ? row.images : [],
      isEdited: Boolean(row.is_edited),
      authorName: row.author_name || row.author_username || "Traveler",
      authorUsername: row.author_username,
      authorAvatarUrl: row.author_avatar_url,
      isCreatorPublic: Boolean(row.is_creator_public),
      authorBio: row.author_bio,
      createdAt: formatRelativeTime(row.created_at),
      upvotes: Number(row.upvotes) || 0,
      views: Number(row.views) || 0,
      repliesCount: replies.length,
      hasUpvoted: Boolean(row.has_upvoted),
      hasSaved: Boolean(row.has_saved),
      isAuthor: Boolean(row.is_author),
      replies,
      linkedTrip,
    };
  } catch (error) {
    console.error("Error fetching forum post by slug:", error);
    return null;
  }
}

/**
 * Backward compatible alias for getForumThread
 */
export async function getForumThread(postId: string): Promise<ForumPost | null> {
  return getForumPostBySlug(postId);
}

/**
 * Create a real forum discussion with auto-generated slug
 */
export async function createForumDiscussion(input: CreateDiscussionInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please sign in to start a discussion." };
    }

    if (!input.title || input.title.trim().length < 5) {
      return { success: false, error: "Title must be at least 5 characters long." };
    }

    if (!input.content || input.content.trim().length < 10) {
      return { success: false, error: "Description must be at least 10 characters long." };
    }

    // Generate unique slug
    const shortId = Math.random().toString(36).substring(2, 8);
    const baseSlug = generateSlug(input.title).replace(/-+$/, "");
    const slug = `${baseSlug || "discussion"}-${shortId}`;

    const sql = `
      INSERT INTO community_posts (
        profile_id,
        slug,
        title,
        content,
        category,
        destination,
        tags,
        images,
        cover_image_url,
        linked_trip_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, slug;
    `;

    const res = await pool.query(sql, [
      user.id,
      slug,
      input.title.trim(),
      input.content.trim(),
      input.category || "DISCUSSIONS",
      input.destination?.trim() || null,
      input.tags || [],
      input.images || [],
      input.coverImageUrl || (input.images && input.images[0]) || null,
      input.linkedTripId || null,
    ]);

    revalidatePath("/community");
    return { success: true, postId: res.rows[0].id, slug: res.rows[0].slug };
  } catch (error) {
    console.error("Error creating forum discussion:", error);
    return { success: false, error: "Failed to publish discussion." };
  }
}

/**
 * Update a forum discussion (Author only)
 */
export async function updateForumDiscussion(postId: string, input: UpdateDiscussionInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please sign in to edit this discussion." };
    }

    // Verify ownership
    const checkRes = await pool.query(
      "SELECT profile_id, slug FROM community_posts WHERE id = $1;",
      [postId]
    );

    if (checkRes.rows.length === 0) {
      return { success: false, error: "Discussion not found." };
    }

    if (checkRes.rows[0].profile_id !== user.id) {
      return { success: false, error: "You can only edit your own discussions." };
    }

    const sql = `
      UPDATE community_posts 
      SET 
        title = $1,
        content = $2,
        category = $3,
        destination = $4,
        tags = $5,
        images = $6,
        cover_image_url = $7,
        linked_trip_id = $8,
        is_edited = TRUE,
        updated_at = NOW()
      WHERE id = $9
      RETURNING slug;
    `;

    const res = await pool.query(sql, [
      input.title.trim(),
      input.content.trim(),
      input.category,
      input.destination?.trim() || null,
      input.tags || [],
      input.images || [],
      input.coverImageUrl || (input.images && input.images[0]) || null,
      input.linkedTripId || null,
      postId,
    ]);

    revalidatePath("/community");
    if (res.rows[0]?.slug) {
      revalidatePath(`/community/${res.rows[0].slug}`);
    }

    return { success: true, slug: res.rows[0]?.slug };
  } catch (error) {
    console.error("Error updating forum discussion:", error);
    return { success: false, error: "Failed to update discussion." };
  }
}

/**
 * Delete a forum discussion (Author only)
 */
export async function deleteForumDiscussion(postId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please sign in to delete this discussion." };
    }

    const checkRes = await pool.query(
      "SELECT profile_id, slug FROM community_posts WHERE id = $1;",
      [postId]
    );

    if (checkRes.rows.length === 0) {
      return { success: false, error: "Discussion not found." };
    }

    if (checkRes.rows[0].profile_id !== user.id) {
      return { success: false, error: "You can only delete your own discussions." };
    }

    await pool.query("DELETE FROM community_posts WHERE id = $1;", [postId]);

    revalidatePath("/community");
    return { success: true };
  } catch (error) {
    console.error("Error deleting forum discussion:", error);
    return { success: false, error: "Failed to delete discussion." };
  }
}

/**
 * Post a real reply to a discussion
 */
export async function postForumReply(postId: string, content: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please sign in to reply." };
    }

    if (!content || content.trim().length < 2) {
      return { success: false, error: "Reply cannot be empty." };
    }

    const sql = `
      INSERT INTO community_replies (post_id, profile_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, created_at;
    `;

    await pool.query(sql, [postId, user.id, content.trim()]);

    const postRes = await pool.query("SELECT slug FROM community_posts WHERE id = $1;", [postId]);
    revalidatePath("/community");
    if (postRes.rows[0]?.slug) {
      revalidatePath(`/community/${postRes.rows[0].slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error posting forum reply:", error);
    return { success: false, error: "Failed to post reply." };
  }
}

/**
 * Update a reply (Author only)
 */
export async function updateForumReply(replyId: string, content: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please sign in to edit your reply." };
    }

    if (!content || content.trim().length < 2) {
      return { success: false, error: "Reply cannot be empty." };
    }

    const checkRes = await pool.query(
      "SELECT profile_id, post_id FROM community_replies WHERE id = $1;",
      [replyId]
    );

    if (checkRes.rows.length === 0) {
      return { success: false, error: "Reply not found." };
    }

    if (checkRes.rows[0].profile_id !== user.id) {
      return { success: false, error: "You can only edit your own replies." };
    }

    await pool.query(
      "UPDATE community_replies SET content = $1, is_edited = TRUE WHERE id = $2;",
      [content.trim(), replyId]
    );

    const postRes = await pool.query("SELECT slug FROM community_posts WHERE id = $1;", [
      checkRes.rows[0].post_id,
    ]);

    revalidatePath("/community");
    if (postRes.rows[0]?.slug) {
      revalidatePath(`/community/${postRes.rows[0].slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating reply:", error);
    return { success: false, error: "Failed to update reply." };
  }
}

/**
 * Delete a reply (Author only)
 */
export async function deleteForumReply(replyId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please sign in to delete your reply." };
    }

    const checkRes = await pool.query(
      "SELECT profile_id, post_id FROM community_replies WHERE id = $1;",
      [replyId]
    );

    if (checkRes.rows.length === 0) {
      return { success: false, error: "Reply not found." };
    }

    if (checkRes.rows[0].profile_id !== user.id) {
      return { success: false, error: "You can only delete your own replies." };
    }

    await pool.query("DELETE FROM community_replies WHERE id = $1;", [replyId]);

    const postRes = await pool.query("SELECT slug FROM community_posts WHERE id = $1;", [
      checkRes.rows[0].post_id,
    ]);

    revalidatePath("/community");
    if (postRes.rows[0]?.slug) {
      revalidatePath(`/community/${postRes.rows[0].slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting reply:", error);
    return { success: false, error: "Failed to delete reply." };
  }
}

/**
 * Toggle upvote for a discussion
 */
export async function toggleForumPostUpvote(postId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please sign in to upvote." };
    }

    const checkSql = `
      SELECT 1 FROM community_post_upvotes 
      WHERE profile_id = $1 AND post_id = $2;
    `;
    const checkRes = await pool.query(checkSql, [user.id, postId]);
    const alreadyUpvoted = checkRes.rows.length > 0;

    if (alreadyUpvoted) {
      await pool.query(
        "DELETE FROM community_post_upvotes WHERE profile_id = $1 AND post_id = $2;",
        [user.id, postId]
      );
      await pool.query(
        "UPDATE community_posts SET upvotes = GREATEST(0, upvotes - 1) WHERE id = $1;",
        [postId]
      );
    } else {
      await pool.query(
        "INSERT INTO community_post_upvotes (profile_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;",
        [user.id, postId]
      );
      await pool.query(
        "UPDATE community_posts SET upvotes = upvotes + 1 WHERE id = $1;",
        [postId]
      );
    }

    revalidatePath("/community");
    return { success: true, hasUpvoted: !alreadyUpvoted };
  } catch (error) {
    console.error("Error toggling upvote:", error);
    return { success: false, error: "Failed to update upvote." };
  }
}

/**
 * Toggle bookmark / save discussion
 */
export async function toggleSaveDiscussion(postId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please sign in to bookmark discussions." };
    }

    const checkRes = await pool.query(
      "SELECT 1 FROM community_saved_posts WHERE profile_id = $1 AND post_id = $2;",
      [user.id, postId]
    );
    const alreadySaved = checkRes.rows.length > 0;

    if (alreadySaved) {
      await pool.query(
        "DELETE FROM community_saved_posts WHERE profile_id = $1 AND post_id = $2;",
        [user.id, postId]
      );
    } else {
      await pool.query(
        "INSERT INTO community_saved_posts (profile_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;",
        [user.id, postId]
      );
    }

    revalidatePath("/community");
    return { success: true, hasSaved: !alreadySaved };
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return { success: false, error: "Failed to bookmark discussion." };
  }
}

/**
 * THE WORKSPACE BRIDGE: Save a community tip/advice directly into a user's Trip Notes!
 */
export async function saveForumTipToTripNote(input: SaveTipToTripInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please sign in to save this tip." };
    }

    // Verify trip ownership
    const trip = await db.trip.findFirst({
      where: { id: input.tripId, profileId: user.id },
      select: { id: true, title: true },
    });

    if (!trip) {
      return { success: false, error: "Target trip not found in your workspace." };
    }

    const noteContent = `${input.tipContent.trim()}\n\n---\n*Community Tip via Prava Forum on "${input.sourceTitle}" (by @${input.authorName})*`;

    await db.note.create({
      data: {
        tripId: trip.id,
        title: `Tip: ${input.sourceTitle.slice(0, 45)}...`,
        content: noteContent,
        category: "Advice",
        isPinned: false,
      },
    });

    revalidatePath(`/trips/${trip.id}/notes`);
    return { success: true, tripTitle: trip.title };
  } catch (error) {
    console.error("Error saving tip to trip note:", error);
    return { success: false, error: "Failed to save tip to your trip workspace." };
  }
}

/**
 * Fetch authenticated user's workspace trips to attach to a discussion or save tips to
 */
export async function getUserTripsForDiscussion(): Promise<UserTripOption[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const trips = await db.trip.findMany({
      where: { profileId: user.id },
      select: {
        id: true,
        title: true,
        destination: true,
        startDate: true,
        endDate: true,
        coverImageUrl: true,
        _count: {
          select: { itinerary: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return trips.map((t) => ({
      id: t.id,
      title: t.title,
      destination: t.destination,
      startDate: t.startDate ? t.startDate.toISOString() : null,
      endDate: t.endDate ? t.endDate.toISOString() : null,
      activityCount: t._count.itinerary,
      coverImageUrl: t.coverImageUrl,
    }));
  } catch (error) {
    console.error("Error fetching user trips for forum:", error);
    return [];
  }
}
