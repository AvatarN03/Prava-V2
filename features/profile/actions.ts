"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { validateUsername } from "./reserved-usernames";
import {
  updateProfileSchema,
  UpdateProfileInput,
  updateGeneralPreferencesSchema,
  UpdateGeneralPreferencesInput,
} from "./schema";

export interface ProfileWithStats {
  id: string;
  email: string;
  fullName: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  defaultCurrency: string;
  dateFormat: string;
  aiAutoPropose: boolean;
  emailNotifications: boolean;
  offlineMode: boolean;
  travelPreferences: string | null;
  createdAt: string;
  totalTrips: number;
  publishedTrips: number;
  tier: "free" | "pro";
  tripsQuota: number;
  tripsRemaining: number;
  aiCreditsUsed: number;
  aiCreditsQuota: number;
  aiCreditsRemaining: number;
}

import { generateSmartUniqueUsername } from "./username-generator";

/**
 * Get current authenticated user's profile with trip statistics.
 */
export async function getCurrentProfile(): Promise<{ success: boolean; profile?: ProfileWithStats; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    let profile = await db.profile.findUnique({
      where: { id: user.id },
      include: {
        _count: {
          select: {
            trips: true,
          },
        },
        trips: {
          where: { isPublic: true },
          select: { id: true },
        },
      },
    });

    if (!profile) {
      const userMeta = user.user_metadata || {};
      const fullName = userMeta.full_name || userMeta.name || null;
      const initialUsername =
        userMeta.username ||
        (await generateSmartUniqueUsername(fullName || user.email || "traveler", user.id));

      // Auto-create profile with smart unique username and avatar
      profile = await db.profile.create({
        data: {
          id: user.id,
          email: user.email || "",
          fullName: fullName,
          avatarUrl: userMeta.avatar_url || userMeta.picture || null,
          username: initialUsername,
        },
        include: {
          _count: {
            select: {
              trips: true,
            },
          },
          trips: {
            where: { isPublic: true },
            select: { id: true },
          },
        },
      });
    } else if (!profile.username) {
      // Backfill missing username if profile existed prior
      const generatedUsername = await generateSmartUniqueUsername(
        profile.fullName || profile.email || "traveler",
        profile.id
      );
      profile = await db.profile.update({
        where: { id: profile.id },
        data: { username: generatedUsername },
        include: {
          _count: {
            select: {
              trips: true,
            },
          },
          trips: {
            where: { isPublic: true },
            select: { id: true },
          },
        },
      });
    }

    const isPro = user.user_metadata?.tier === "pro" || user.user_metadata?.is_pro === true;
    const tier = isPro ? ("pro" as const) : ("free" as const);
    const tripsQuota = isPro ? 25 : 10;
    const aiCreditsQuota = isPro ? 150 : 30;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const aiCreditsUsed = await db.aiMessage.count({
      where: {
        conversation: { profileId: user.id },
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const tripsRemaining = Math.max(0, tripsQuota - profile._count.trips);
    const aiCreditsRemaining = Math.max(0, aiCreditsQuota - aiCreditsUsed);

    return {
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        username: profile.username,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        isPublic: profile.isPublic,
        defaultCurrency: (profile as unknown as { defaultCurrency?: string }).defaultCurrency || "USD",
        dateFormat: (profile as unknown as { dateFormat?: string }).dateFormat || "MMM D, YYYY",
        aiAutoPropose: (profile as unknown as { aiAutoPropose?: boolean }).aiAutoPropose ?? true,
        emailNotifications: (profile as unknown as { emailNotifications?: boolean }).emailNotifications ?? true,
        offlineMode: (profile as unknown as { offlineMode?: boolean }).offlineMode ?? false,
        travelPreferences: (profile as unknown as { travelPreferences?: string | null }).travelPreferences || null,
        createdAt: profile.createdAt.toISOString(),
        totalTrips: profile._count.trips,
        publishedTrips: profile.trips.length,
        tier,
        tripsQuota,
        tripsRemaining,
        aiCreditsUsed,
        aiCreditsQuota,
        aiCreditsRemaining,
      },
    };
  } catch (error) {
    console.error("Error fetching current profile:", error);
    return { success: false, error: "Failed to load profile" };
  }
}

/**
 * Check if a username is available and valid.
 */
export async function checkUsernameAvailability(username: string): Promise<{ available: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const validation = validateUsername(username);
    if (!validation.valid || !validation.cleanUsername) {
      return { available: false, error: validation.error };
    }

    const cleanUsername = validation.cleanUsername;

    const existing = await db.profile.findUnique({
      where: { username: cleanUsername },
      select: { id: true },
    });

    // If already owned by current user, it's available for them
    if (existing && existing.id !== user?.id) {
      return { available: false, error: "Username is already taken." };
    }

    return { available: true };
  } catch (error) {
    console.error("Error checking username:", error);
    return { available: false, error: "Failed to check availability." };
  }
}

/**
 * Update authenticated user's profile and creator identity.
 */
export async function updateProfile(input: UpdateProfileInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid profile data" };
    }

    const { fullName, username, bio, isPublic, avatarUrl } = parsed.data;

    // Get existing profile to enforce username immutability
    const existingProfile = await db.profile.findUnique({
      where: { id: user.id },
      select: { username: true },
    });

    let targetUsername = existingProfile?.username;

    // Only allow setting username if user didn't have one previously
    if (!targetUsername && username && username.trim()) {
      const validation = validateUsername(username);
      if (!validation.valid || !validation.cleanUsername) {
        return { success: false, error: validation.error };
      }
      const cleanUsername = validation.cleanUsername;

      // Uniqueness check
      const existing = await db.profile.findUnique({
        where: { username: cleanUsername },
        select: { id: true },
      });

      if (existing && existing.id !== user.id) {
        return { success: false, error: `The username "@${cleanUsername}" is already taken.` };
      }
      targetUsername = cleanUsername;
    }

    const updated = await db.profile.update({
      where: { id: user.id },
      data: {
        ...(fullName !== undefined && { fullName: fullName?.trim() || null }),
        ...(targetUsername && { username: targetUsername }),
        ...(bio !== undefined && { bio: bio?.trim() || null }),
        ...(isPublic !== undefined && { isPublic }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    revalidatePath("/profile");
    if (targetUsername) {
      revalidatePath(`/u/${targetUsername}`);
    }
    revalidatePath("/community");
    revalidatePath("/dashboard");

    return { success: true, profile: updated };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

/**
 * Update authenticated user's workspace & general preferences.
 */
export async function updateGeneralPreferences(input: UpdateGeneralPreferencesInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = updateGeneralPreferencesSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid preferences data" };
    }

    const {
      defaultCurrency,
      dateFormat,
      aiAutoPropose,
      emailNotifications,
      offlineMode,
      travelPreferences,
    } = parsed.data;

    const updated = await db.profile.update({
      where: { id: user.id },
      data: {
        defaultCurrency,
        dateFormat,
        aiAutoPropose,
        emailNotifications,
        offlineMode,
        ...(travelPreferences !== undefined && { travelPreferences: travelPreferences?.trim() || null }),
      },
    });

    revalidatePath("/profile");
    revalidatePath("/trips");
    revalidatePath("/settings");

    return { success: true, profile: updated };
  } catch (error) {
    console.error("Error updating general preferences:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save preferences",
    };
  }
}

/**
 * Fetch a public creator profile by username, including their published trips.
 */
export async function getPublicCreatorProfile(username: string) {
  try {
    const cleanUsername = username.trim().toLowerCase();

    const profile = await db.profile.findFirst({
      where: {
        username: cleanUsername,
        isPublic: true,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        trips: {
          where: {
            isPublic: true,
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            destination: true,
            startDate: true,
            endDate: true,
            status: true,
            coverImageUrl: true,
            isTemplate: true,
            itinerary: {
              take: 5,
              orderBy: [{ dayNumber: "asc" }, { order: "asc" }],
              select: {
                id: true,
                title: true,
                dayNumber: true,
                time: true,
                category: true,
                location: true,
              },
            },
            accommodations: {
              take: 3,
              select: {
                id: true,
                name: true,
                type: true,
                address: true,
              },
            },
            _count: {
              select: {
                itinerary: true,
                accommodations: true,
                checklistItems: true,
              },
            },
          },
        },
        blogPosts: {
          where: {
            status: "PUBLISHED",
          },
          orderBy: { publishedAt: "desc" },
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            coverImageUrl: true,
            tags: true,
            publishedAt: true,
          },
        },
      },
    });

    if (!profile) {
      return { success: false, error: "Creator profile not found or private." };
    }

    return {
      success: true,
      creator: {
        id: profile.id,
        fullName: profile.fullName || profile.username || "Travel Creator",
        username: profile.username!,
        bio: profile.bio || "Passionate traveler and trip architect on Prava AI.",
        avatarUrl: profile.avatarUrl,
        memberSince: new Date(profile.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        stories: profile.blogPosts.map((post) => ({
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          coverImageUrl: post.coverImageUrl,
          tags: post.tags,
          publishedAt: post.publishedAt,
        })),
        trips: profile.trips.map((t) => {
          let durationDays = 1;
          if (t.startDate && t.endDate) {
            const diffTime = Math.abs(new Date(t.endDate).getTime() - new Date(t.startDate).getTime());
            durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }
          return {
            id: t.id,
            title: t.title,
            description: t.description,
            destination: t.destination,
            coverImageUrl: t.coverImageUrl,
            durationDays,
            isTemplate: t.isTemplate,
            activityCount: t._count.itinerary,
            accommodationCount: t._count.accommodations,
            checklistCount: t._count.checklistItems,
            sampleItinerary: t.itinerary,
          };
        }),
      },
    };
  } catch (error) {
    console.error("Error loading creator profile:", error);
    return { success: false, error: "Failed to load creator profile" };
  }
}
