"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { CommunityTripItem, CommunityCreatorItem } from "./types";
import { SEED_COMMUNITY_TEMPLATES } from "./data/seed-templates";
import { syncUserProfile } from "@/lib/auth/sync-profile";

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

    return [...SEED_COMMUNITY_TEMPLATES, ...mappedDbTrips];
  } catch (error) {
    console.error("Error fetching community trips:", error);
    return SEED_COMMUNITY_TEMPLATES;
  }
}

/**
 * Clone a community trip or curated template directly into the authenticated user's workspace.
 */
export async function cloneTripTemplate(templateId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: "Please sign in to clone this itinerary." };
    }

    // Ensure user profile exists in Postgres safely without email collisions
    await syncUserProfile(user);

    // 1. Check if cloning from a SEED template
    const seed = SEED_COMMUNITY_TEMPLATES.find((s) => s.id === templateId);
    if (seed) {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + seed.durationDays - 1);

      // Create new private trip for user
      const newTrip = await db.trip.create({
        data: {
          profileId: user.id,
          title: seed.title,
          description: seed.description,
          destination: seed.destination,
          startDate: today,
          endDate: endDate,
          status: "PLANNING",
          isPublic: false,
          isTemplate: false,
        },
      });

      // Clone Itinerary items
      if (seed.itineraryPreview.length > 0) {
        await db.itineraryItem.createMany({
          data: seed.itineraryPreview.map((item, idx) => ({
            tripId: newTrip.id,
            dayNumber: item.day,
            title: item.title,
            description: item.description || null,
            category: item.category || "Activity",
            order: idx,
          })),
        });
      }

      // Clone Packing Checklist
      if (seed.packingHighlights && seed.packingHighlights.length > 0) {
        await db.checklistItem.createMany({
          data: seed.packingHighlights.map((task, idx) => ({
            tripId: newTrip.id,
            title: task,
            category: "Packing",
            order: idx,
            isCompleted: false,
          })),
        });
      }

      // Clone Tips into Notes
      if (seed.tips && seed.tips.length > 0) {
        await db.note.createMany({
          data: seed.tips.map((tip) => ({
            tripId: newTrip.id,
            title: "Local Tip",
            content: tip,
            category: "Advice",
            isPinned: false,
          })),
        });
      }

      revalidatePath("/trips");
      revalidatePath("/dashboard");
      return { success: true, tripId: newTrip.id };
    }

    // 2. Clone from a User-published Postgres trip
    const sourceTrip = await db.trip.findFirst({
      where: { id: templateId, isPublic: true },
      include: {
        itinerary: true,
        accommodations: true,
        checklistItems: true,
        notes: true,
      },
    });

    if (!sourceTrip) {
      return { success: false, error: "Trip template not found or not public." };
    }

    const today = new Date();
    const clonedTrip = await db.trip.create({
      data: {
        profileId: user.id,
        title: `${sourceTrip.title} (Cloned)`,
        description: sourceTrip.description,
        destination: sourceTrip.destination,
        startDate: today,
        status: "PLANNING",
        isPublic: false,
        isTemplate: false,
      },
    });

    // Copy relations
    if (sourceTrip.itinerary.length > 0) {
      await db.itineraryItem.createMany({
        data: sourceTrip.itinerary.map((item) => ({
          tripId: clonedTrip.id,
          dayNumber: item.dayNumber,
          time: item.time,
          title: item.title,
          description: item.description,
          location: item.location,
          category: item.category,
          cost: item.cost,
          order: item.order,
        })),
      });
    }

    if (sourceTrip.accommodations.length > 0) {
      await db.accommodation.createMany({
        data: sourceTrip.accommodations.map((acc) => ({
          tripId: clonedTrip.id,
          name: acc.name,
          type: acc.type,
          address: acc.address,
          currency: acc.currency,
          notes: acc.notes,
        })),
      });
    }

    if (sourceTrip.checklistItems.length > 0) {
      await db.checklistItem.createMany({
        data: sourceTrip.checklistItems.map((c) => ({
          tripId: clonedTrip.id,
          title: c.title,
          category: c.category,
          order: c.order,
          isCompleted: false,
        })),
      });
    }

    if (sourceTrip.notes.length > 0) {
      await db.note.createMany({
        data: sourceTrip.notes.map((n) => ({
          tripId: clonedTrip.id,
          title: n.title,
          content: n.content,
          category: n.category,
          isPinned: n.isPinned,
        })),
      });
    }

    revalidatePath("/trips");
    revalidatePath("/dashboard");
    return { success: true, tripId: clonedTrip.id };
  } catch (error) {
    console.error("Error cloning trip template:", error);
    return { success: false, error: "Failed to clone trip template." };
  }
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

