import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// ─── IndexedDB Schema ───────────────────────────────────────────────

export interface OfflineMeta {
  lastSyncTimestamp: number;
  userId: string;
  syncInProgress: boolean;
}

export interface OfflineTrip {
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

export interface OfflineItineraryItem {
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
}

export interface OfflineAccommodation {
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
}

export interface OfflineExpense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  paidBy: string | null;
  notes: string | null;
}

export interface OfflineNote {
  id: string;
  tripId: string;
  title: string;
  content: string;
  category: string | null;
  isPinned: boolean;
}

export interface OfflineChecklistItem {
  id: string;
  tripId: string;
  title: string;
  category: string;
  isCompleted: boolean;
  dueDate: string | null;
  order: number;
}

export interface OfflineLink {
  id: string;
  tripId: string;
  title: string;
  url: string;
  category: string | null;
  description: string | null;
}

interface PravaOfflineDB extends DBSchema {
  meta: {
    key: string;
    value: OfflineMeta;
  };
  trips: {
    key: string;
    value: OfflineTrip;
  };
  itineraryItems: {
    key: string;
    value: OfflineItineraryItem;
    indexes: { "by-trip": string };
  };
  accommodations: {
    key: string;
    value: OfflineAccommodation;
    indexes: { "by-trip": string };
  };
  expenses: {
    key: string;
    value: OfflineExpense;
    indexes: { "by-trip": string };
  };
  notes: {
    key: string;
    value: OfflineNote;
    indexes: { "by-trip": string };
  };
  checklistItems: {
    key: string;
    value: OfflineChecklistItem;
    indexes: { "by-trip": string };
  };
  links: {
    key: string;
    value: OfflineLink;
    indexes: { "by-trip": string };
  };
}

const DB_NAME = "prava-offline-v1";
const DB_VERSION = 1;

// ─── Database Connection ────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase<PravaOfflineDB>> | null = null;

export function openOfflineDb(): Promise<IDBPDatabase<PravaOfflineDB>> {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser.");
  }

  if (!dbPromise) {
    dbPromise = openDB<PravaOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Meta store (lastSyncTimestamp, userId)
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta");
        }

        // Trips store
        if (!db.objectStoreNames.contains("trips")) {
          db.createObjectStore("trips", { keyPath: "id" });
        }

        // Related data stores — all indexed by tripId
        const storesWithTripIndex = [
          "itineraryItems",
          "accommodations",
          "expenses",
          "notes",
          "checklistItems",
          "links",
        ] as const;

        for (const storeName of storesWithTripIndex) {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: "id" });
            store.createIndex("by-trip", "tripId");
          }
        }
      },
    });
  }

  return dbPromise;
}

// ─── Meta Helpers ───────────────────────────────────────────────────

export async function getOfflineMeta(): Promise<OfflineMeta | undefined> {
  const db = await openOfflineDb();
  return db.get("meta", "sync");
}

export async function setOfflineMeta(
  partial: Partial<OfflineMeta>
): Promise<void> {
  const db = await openOfflineDb();
  const existing = (await db.get("meta", "sync")) || {
    lastSyncTimestamp: 0,
    userId: "",
    syncInProgress: false,
  };
  await db.put("meta", { ...existing, ...partial }, "sync");
}

// ─── Clear All Stores ───────────────────────────────────────────────

export async function clearOfflineDb(): Promise<void> {
  const db = await openOfflineDb();
  const storeNames = [
    "trips",
    "itineraryItems",
    "accommodations",
    "expenses",
    "notes",
    "checklistItems",
    "links",
    "meta",
  ] as const;

  const tx = db.transaction([...storeNames], "readwrite");
  await Promise.all(storeNames.map((s) => tx.objectStore(s).clear()));
  await tx.done;
}

// ─── Read Helpers (for offline rendering) ───────────────────────────

export async function getOfflineTrips(): Promise<OfflineTrip[]> {
  const db = await openOfflineDb();
  return db.getAll("trips");
}

export async function getOfflineTripById(
  tripId: string
): Promise<OfflineTrip | undefined> {
  const db = await openOfflineDb();
  return db.get("trips", tripId);
}

export async function getOfflineItemsByTrip<
  S extends
    | "itineraryItems"
    | "accommodations"
    | "expenses"
    | "notes"
    | "checklistItems"
    | "links",
>(storeName: S, tripId: string): Promise<PravaOfflineDB[S]["value"][]> {
  const db = await openOfflineDb();
  const tx = db.transaction(storeName, "readonly");
  const index = tx.store.index("by-trip" as never);
  const items = await (index as any).getAll(tripId);
  return items as unknown as PravaOfflineDB[S]["value"][];
}
