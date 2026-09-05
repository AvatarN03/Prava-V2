"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

/**
 * Serializable payload for offline caching.
 * Only PLANNING and ACTIVE trips are included.
 */
export interface OfflineSyncPayload {
  trips: Array<{
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
  }>;
  itineraryItems: Array<{
    id: string;
    tripId: string;
    dayNumber: number | null;
    date: string | null;
    time: string | null;
    title: string;
    description: string | null;
    location: string | null;
    category: string | null;
    cost: number | null;
    order: number;
  }>;
  accommodations: Array<{
    id: string;
    tripId: string;
    name: string;
    type: string | null;
    address: string | null;
    checkIn: string | null;
    checkOut: string | null;
    confirmationCode: string | null;
    contactPhone: string | null;
    cost: number | null;
    currency: string;
    notes: string | null;
  }>;
  expenses: Array<{
    id: string;
    tripId: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    date: string;
    paidBy: string | null;
    notes: string | null;
  }>;
  notes: Array<{
    id: string;
    tripId: string;
    title: string;
    content: string;
    category: string | null;
    isPinned: boolean;
  }>;
  checklistItems: Array<{
    id: string;
    tripId: string;
    title: string;
    category: string;
    isCompleted: boolean;
    dueDate: string | null;
    order: number;
  }>;
  links: Array<{
    id: string;
    tripId: string;
    title: string;
    url: string;
    category: string | null;
    description: string | null;
  }>;
}

/**
 * Server Action: Fetch all PLANNING and ACTIVE trips with related data
 * for offline caching in IndexedDB.
 */
export async function fetchFullTripsForOfflineSync(): Promise<{
  success: boolean;
  payload?: OfflineSyncPayload;
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
      include: {
        itinerary: true,
        accommodations: true,
        expenses: true,
        notes: true,
        checklistItems: true,
        links: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Flatten into serializable payload
    const payload: OfflineSyncPayload = {
      trips: trips.map((t) => ({
        id: t.id,
        title: t.title,
        destination: t.destination,
        description: t.description,
        startDate: t.startDate?.toISOString() ?? null,
        endDate: t.endDate?.toISOString() ?? null,
        status: t.status,
        coverImageUrl: t.coverImageUrl,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      itineraryItems: trips.flatMap((t) =>
        t.itinerary.map((item) => ({
          id: item.id,
          tripId: t.id,
          dayNumber: item.dayNumber,
          date: item.date?.toISOString() ?? null,
          time: item.time,
          title: item.title,
          description: item.description,
          location: item.location,
          category: item.category,
          cost: item.cost,
          order: item.order,
        }))
      ),
      accommodations: trips.flatMap((t) =>
        t.accommodations.map((a) => ({
          id: a.id,
          tripId: t.id,
          name: a.name,
          type: a.type,
          address: a.address,
          checkIn: a.checkIn?.toISOString() ?? null,
          checkOut: a.checkOut?.toISOString() ?? null,
          confirmationCode: a.confirmationCode,
          contactPhone: a.contactPhone,
          cost: a.cost,
          currency: a.currency,
          notes: a.notes,
        }))
      ),
      expenses: trips.flatMap((t) =>
        t.expenses.map((e) => ({
          id: e.id,
          tripId: t.id,
          title: e.title,
          amount: e.amount,
          currency: e.currency,
          category: e.category,
          date: e.date.toISOString(),
          paidBy: e.paidBy,
          notes: e.notes,
        }))
      ),
      notes: trips.flatMap((t) =>
        t.notes.map((n) => ({
          id: n.id,
          tripId: t.id,
          title: n.title,
          content: n.content,
          category: n.category,
          isPinned: n.isPinned,
        }))
      ),
      checklistItems: trips.flatMap((t) =>
        t.checklistItems.map((c) => ({
          id: c.id,
          tripId: t.id,
          title: c.title,
          category: c.category,
          isCompleted: c.isCompleted,
          dueDate: c.dueDate?.toISOString() ?? null,
          order: c.order,
        }))
      ),
      links: trips.flatMap((t) =>
        t.links.map((l) => ({
          id: l.id,
          tripId: t.id,
          title: l.title,
          url: l.url,
          category: l.category,
          description: l.description,
        }))
      ),
    };

    return { success: true, payload };
  } catch (error) {
    console.error("Error fetching offline sync data:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch sync data",
    };
  }
}
