import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { syncUserProfile } from "@/lib/auth/sync-profile";

export async function verifyTripOwnership(tripId: string) {
  if (!tripId || typeof tripId !== "string") {
    return { authorized: false as const, user: null, trip: null, isOwner: false };
  }

  // Validate UUID to prevent PostgreSQL error
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tripId);
  if (!isValidUuid) {
    return { authorized: false as const, user: null, trip: null, isOwner: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // Unauthenticated user - check if trip is public
    try {
      const publicTrip = await db.trip.findFirst({
        where: { id: tripId, isPublic: true },
      });
      if (publicTrip) {
        return { authorized: true as const, user: null, trip: publicTrip, isOwner: false };
      }
    } catch {
      // ignore
    }
    return { authorized: false as const, user: null, trip: null, isOwner: false };
  }

  // Ensure profile row exists in Postgres safely without email unique constraint collisions
  try {
    await syncUserProfile(user);
  } catch (err) {
    console.error("Error syncing profile in auth-check:", err);
  }

  const includeConfig = {
    _count: {
      select: {
        itinerary: true,
        accommodations: true,
        checklistItems: true,
        notes: true,
        expenses: true,
        links: true,
      },
    },
    expenses: {
      select: {
        amount: true,
        currency: true,
      },
    },
    checklistItems: {
      select: {
        isCompleted: true,
      },
    },
  };

  // First check if user is owner
  const ownedTrip = await db.trip.findFirst({
    where: {
      id: tripId,
      profileId: user.id,
    },
    include: includeConfig,
  });

  if (ownedTrip) {
    return { authorized: true as const, user, trip: ownedTrip, isOwner: true };
  }

  // If not owner, check if trip is public
  const publicTrip = await db.trip.findFirst({
    where: {
      id: tripId,
      isPublic: true,
    },
    include: includeConfig,
  });

  if (publicTrip) {
    return { authorized: true as const, user, trip: publicTrip, isOwner: false };
  }

  return { authorized: false as const, user, trip: null, isOwner: false };
  
}
