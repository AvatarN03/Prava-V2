import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

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

  // Ensure profile row exists in Postgres (syncs Supabase auth.users)
  try {
    await db.profile.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email ?? "",
        fullName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        avatarUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
      },
      update: {
        email: user.email ?? "",
        fullName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        avatarUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
      },
    });
  } catch (err) {
    console.error("Error upserting profile in auth-check:", err);
  }

  // First check if user is owner
  const ownedTrip = await db.trip.findFirst({
    where: {
      id: tripId,
      profileId: user.id,
    },
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
  });

  if (publicTrip) {
    return { authorized: true as const, user, trip: publicTrip, isOwner: false };
  }

  return { authorized: false as const, user, trip: null, isOwner: false };
}
