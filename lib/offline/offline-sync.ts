import {
  openOfflineDb,
  clearOfflineDb,
  setOfflineMeta,
  getOfflineMeta,
} from "./offline-db";
import type { OfflineSyncPayload } from "./offline-sync-action";

/**
 * Write a full sync payload into IndexedDB.
 * Clears existing data and writes fresh content.
 */
export async function syncTripsToIndexedDB(
  payload: OfflineSyncPayload,
  userId: string
): Promise<void> {
  const db = await openOfflineDb();

  // Mark sync as in progress
  await setOfflineMeta({ syncInProgress: true, userId });

  // Clear all existing trip-related data
  const storeNames = [
    "trips",
    "itineraryItems",
    "accommodations",
    "expenses",
    "notes",
    "checklistItems",
    "links",
  ] as const;

  const clearTx = db.transaction([...storeNames], "readwrite");
  await Promise.all(storeNames.map((s) => clearTx.objectStore(s).clear()));
  await clearTx.done;

  // Write trips
  if (payload.trips.length > 0) {
    const tripTx = db.transaction("trips", "readwrite");
    for (const trip of payload.trips) {
      await tripTx.store.put(trip);
    }
    await tripTx.done;
  }

  // Write itinerary items
  if (payload.itineraryItems.length > 0) {
    const tx = db.transaction("itineraryItems", "readwrite");
    for (const item of payload.itineraryItems) {
      await tx.store.put(item);
    }
    await tx.done;
  }

  // Write accommodations
  if (payload.accommodations.length > 0) {
    const tx = db.transaction("accommodations", "readwrite");
    for (const item of payload.accommodations) {
      await tx.store.put(item);
    }
    await tx.done;
  }

  // Write expenses
  if (payload.expenses.length > 0) {
    const tx = db.transaction("expenses", "readwrite");
    for (const item of payload.expenses) {
      await tx.store.put(item);
    }
    await tx.done;
  }

  // Write notes
  if (payload.notes.length > 0) {
    const tx = db.transaction("notes", "readwrite");
    for (const item of payload.notes) {
      await tx.store.put(item);
    }
    await tx.done;
  }

  // Write checklist items
  if (payload.checklistItems.length > 0) {
    const tx = db.transaction("checklistItems", "readwrite");
    for (const item of payload.checklistItems) {
      await tx.store.put(item);
    }
    await tx.done;
  }

  // Write links
  if (payload.links.length > 0) {
    const tx = db.transaction("links", "readwrite");
    for (const item of payload.links) {
      await tx.store.put(item);
    }
    await tx.done;
  }

  // Update meta with sync timestamp
  await setOfflineMeta({
    lastSyncTimestamp: Date.now(),
    userId,
    syncInProgress: false,
  });
}

/**
 * Clear all offline cached data.
 * Called when user disables offline mode.
 */
export async function clearOfflineData(): Promise<void> {
  await clearOfflineDb();
}

/**
 * Get the last sync time as a human-readable relative string.
 */
export async function getLastSyncInfo(): Promise<{
  synced: boolean;
  label: string;
  timestamp: number;
}> {
  const meta = await getOfflineMeta();
  if (!meta || !meta.lastSyncTimestamp) {
    return { synced: false, label: "Never synced", timestamp: 0 };
  }

  const elapsed = Date.now() - meta.lastSyncTimestamp;
  const minutes = Math.floor(elapsed / 60_000);
  const hours = Math.floor(elapsed / 3_600_000);

  let label: string;
  if (minutes < 1) {
    label = "Synced just now";
  } else if (minutes < 60) {
    label = `Synced ${minutes}m ago`;
  } else if (hours < 24) {
    label = `Synced ${hours}h ago`;
  } else {
    const days = Math.floor(hours / 24);
    label = `Synced ${days}d ago`;
  }

  return { synced: true, label, timestamp: meta.lastSyncTimestamp };
}
