"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export interface OfflineTripPayload {
  id: string;
  title: string;
  destination: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Server action to fetch active and planning trips for client-side offline caching.
 */
export async function fetchTripsForOfflineSync(): Promise<{
  success: boolean;
  trips?: OfflineTripPayload[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const trips = await db.trip.findMany({
      where: {
        profileId: user.id,
        status: { in: ["PLANNING", "ACTIVE"] },
      },
      select: {
        id: true,
        title: true,
        destination: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        coverImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { startDate: "asc" },
    });

    const serializedTrips: OfflineTripPayload[] = trips.map((t) => ({
      ...t,
      startDate: t.startDate ? t.startDate.toISOString() : null,
      endDate: t.endDate ? t.endDate.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    return { success: true, trips: serializedTrips };
  } catch (error) {
    console.error("[OfflineSync] Error fetching trips for sync:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch trips",
    };
  }
}
