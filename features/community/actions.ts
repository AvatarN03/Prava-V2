"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { CommunityTripItem, CommunityCreatorItem } from "./types";

/**
 * Fetch all publicly shared community trips and seed templates.
 */
export async function getCommunityTrips(): Promise<CommunityTripItem[]> {
  try {
    const publicDbTrips = await db.trip.findMany({
      where: { isPublic: true },
      include: {
        profile: {
          select: {
            fullName: true,
            email: true,
            username: true,
            avatarUrl: true,
            bio: true,
            isPublic: true,
          },
        },
        itinerary: { orderBy: [{ dayNumber: "asc" }, { order: "asc" }] },
        accommodations: true,
        checklistItems: true,
        notes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedDbTrips: CommunityTripItem[] = publicDbTrips.map((t) => {
      const days =
        t.startDate && t.endDate
          ? Math.max(
              1,
              Math.ceil(
                (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              ) + 1
            )
          : Math.max(1, t.itinerary.length > 0 ? Math.max(...t.itinerary.map((i) => i.dayNumber || 1)) : 5);

      const authorName = t.profile.fullName || t.profile.username || t.profile.email.split("@")[0] || "Traveler";

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        destination: t.destination,
        durationDays: days,
        region: "Europe", // default fallback
        category: "Cultural",
        authorName,
        authorUsername: t.profile.username,
        authorAvatarUrl: t.profile.avatarUrl,
        authorBio: t.profile.bio,
        isCreatorPublic: t.profile.isPublic,
        coverImageUrl: t.coverImageUrl,
        isTemplate: t.isTemplate,
        activityCount: t.itinerary.length,
        accommodationCount: t.accommodations.length,
        checklistCount: t.checklistItems.length,
        highlights: t.itinerary.slice(0, 4).map((i) => i.title),
        itineraryPreview: t.itinerary.map((i) => ({
          day: i.dayNumber || 1,
          title: i.title,
          category: i.category || "Activity",
          description: i.description || undefined,
        })),
        packingHighlights: t.checklistItems.slice(0, 4).map((c) => c.title),
        tips: t.notes.slice(0, 3).map((n) => n.title),
      };
    });

    return mappedDbTrips;
  } catch (error) {
    console.error("Error fetching community trips:", error);
    return [];
  }
}

import { cloneTripTemplate as baseCloneTripTemplate } from "@/features/templates/actions";

/**
 * Re-export wrapper for cloneTripTemplate adhering to Next.js "use server" async function requirements.
 */
export async function cloneTripTemplate(templateId: string, customInstructions?: string) {
  return await baseCloneTripTemplate(templateId, customInstructions);
}

/**
 * Toggle public sharing for user-owned trip.
 */
export async function toggleTripPublishStatus(tripId: string, isPublic: boolean) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const trip = await db.trip.findFirst({
      where: { id: tripId, profileId: user.id },
    });

    if (!trip) {
      return { success: false, error: "Trip not found or permission denied" };
    }

    const updated = await db.trip.update({
      where: { id: tripId },
      data: { isPublic },
    });

    revalidatePath(`/trips/${tripId}`);
    revalidatePath("/community");

    return { success: true, isPublic: updated.isPublic };
  } catch (error) {
    console.error("Error updating trip publish status:", error);
    return { success: false, error: "Failed to update publish settings" };
  }
}

/**
 * Fetch public creators who have published itineraries or stories.
 */
export async function getCommunityCreators(): Promise<CommunityCreatorItem[]> {
  try {
    const creators = await db.profile.findMany({
      where: {
        isPublic: true,
        username: { not: null },
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        trips: {
          where: { isPublic: true },
          select: { destination: true },
        },
        blogPosts: {
          where: { status: "PUBLISHED" },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return creators
      .map((c) => {
        const dests = Array.from(
          new Set(c.trips.map((t) => t.destination).filter(Boolean))
        ) as string[];

        return {
          id: c.id,
          username: c.username!,
          fullName: c.fullName,
          avatarUrl: c.avatarUrl,
          bio: c.bio,
          publishedTripsCount: c.trips.length,
          publishedStoriesCount: c.blogPosts.length,
          topDestinations: dests,
        };
      })
      .sort(
        (a, b) =>
          b.publishedTripsCount +
          b.publishedStoriesCount -
          (a.publishedTripsCount + a.publishedStoriesCount)
      );
  } catch (error) {
    console.error("Error fetching community creators:", error);
    return [];
  }
}

