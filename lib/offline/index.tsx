"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { openDB, type IDBPDatabase } from "idb";
import { WifiOff, Database } from "lucide-react";
import { fetchTripsForOfflineSync } from "./actions";

// ─── Constants & Types ────────────────────────────────────────────────────────

const DB_NAME = "prava-offline-db";
const DB_VERSION = 1;
const SYNC_DELAY_MS = 3 * 60 * 1000; // Wait 3m after mount
const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30m stale threshold

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

export interface OfflineSyncState {
  isSyncing: boolean;
  lastSyncLabel: string;
  enabled: boolean;
  triggerSync: () => void;
}

export interface OfflineSyncContextValue extends OfflineSyncState {
  isOnline: boolean;
}

// ─── IndexedDB Storage Engine ─────────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is only available in browser"));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("trips")) {
          db.createObjectStore("trips", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("sync_meta")) {
          db.createObjectStore("sync_meta", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

export async function getOfflineTrips(): Promise<OfflineTrip[]> {
  try {
    const db = await getDb();
    return await db.getAll("trips");
  } catch (err) {
    console.warn("[OfflineDB] Failed to read cached trips:", err);
    return [];
  }
}

export async function getOfflineTripById(id: string): Promise<OfflineTrip | null> {
  try {
    const db = await getDb();
    return (await db.get("trips", id)) || null;
  } catch {
    return null;
  }
}

export async function clearOfflineDb(): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction(["trips", "sync_meta"], "readwrite");
    await tx.objectStore("trips").clear();
    await tx.objectStore("sync_meta").clear();
    await tx.done;
  } catch (err) {
    console.warn("[OfflineDB] Failed to clear database:", err);
  }
}

export const clearOfflineData = clearOfflineDb;

export async function getLastSyncInfo(): Promise<{
  synced: boolean;
  timestamp: number;
  label: string;
  userId?: string;
}> {
  try {
    const db = await getDb();
    const meta = await db.get("sync_meta", "last_sync");
    if (!meta || !meta.timestamp) {
      return { synced: false, timestamp: 0, label: "Not synced" };
    }

    const diffMs = Date.now() - meta.timestamp;
    const diffMins = Math.floor(diffMs / 60000);

    let label: string;
    if (diffMins < 1) label = "Just now";
    else if (diffMins < 60) label = `${diffMins}m ago`;
    else {
      const diffHours = Math.floor(diffMins / 60);
      label = diffHours < 24 ? `${diffHours}h ago` : new Date(meta.timestamp).toLocaleDateString();
    }

    return {
      synced: true,
      timestamp: meta.timestamp,
      label,
      userId: meta.userId,
    };
  } catch {
    return { synced: false, timestamp: 0, label: "Not synced" };
  }
}

export async function syncTripsToIndexedDB(
  trips: OfflineTrip[],
  userId: string
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["trips", "sync_meta"], "readwrite");
  const tripStore = tx.objectStore("trips");
  const metaStore = tx.objectStore("sync_meta");

  await tripStore.clear();
  for (const trip of trips) {
    await tripStore.put(trip);
  }

  await metaStore.put({
    key: "last_sync",
    timestamp: Date.now(),
    userId,
    count: trips.length,
  });

  await tx.done;
}

// ─── Network Status Hook ──────────────────────────────────────────────────────

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// ─── Offline Banner Component ─────────────────────────────────────────────────

export function OfflineBanner({
  lastSyncLabel = "Cached data",
  itemCount,
}: {
  lastSyncLabel?: string;
  itemCount?: number;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-40 w-full border-b border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 backdrop-blur-md px-3 py-2 text-xs text-amber-900 dark:text-amber-200 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>

          <div className="flex items-center gap-1.5 font-semibold text-[11px] tracking-wide uppercase shrink-0 bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-xs border border-amber-500/30">
            <WifiOff className="h-3 w-3" />
            <span>Offline Mode</span>
          </div>

          <p className="truncate text-xs text-foreground/90 font-medium">
            You are offline. Showing cached trip data (Read-Only).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1 bg-background/60 dark:bg-card/60 px-2 py-0.5 rounded-xs border border-border/60">
            <Database className="h-3 w-3 text-amber-500" />
            <span>
              Last synced: <strong className="text-foreground">{lastSyncLabel}</strong>
            </span>
          </div>
          {itemCount !== undefined && itemCount > 0 && (
            <span className="hidden md:inline-block bg-background/60 dark:bg-card/60 px-2 py-0.5 rounded-xs border border-border/60">
              {itemCount} trips cached
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Offline Sync Hook ────────────────────────────────────────────────────────

export function useOfflineSync(
  offlineModeEnabled: boolean,
  userId: string
): OfflineSyncState {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncLabel, setLastSyncLabel] = useState("Not synced");
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasScheduledRef = useRef(false);

  const performSync = useCallback(async () => {
    if (!userId) return;

    setIsSyncing(true);
    try {
      const syncInfo = await getLastSyncInfo();
      if (syncInfo.userId && syncInfo.userId !== userId) {
        await clearOfflineDb();
      }

      const isStale =
        !syncInfo.synced || Date.now() - syncInfo.timestamp > STALE_THRESHOLD_MS;

      if (!isStale) {
        setLastSyncLabel(syncInfo.label);
        setIsSyncing(false);
        return;
      }

      const res = await fetchTripsForOfflineSync();
      if (res.success && res.trips) {
        await syncTripsToIndexedDB(res.trips, userId);
        const info = await getLastSyncInfo();
        setLastSyncLabel(info.label);
      }
    } catch (err) {
      console.error("[OfflineSync] Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [userId]);

  const triggerSync = useCallback(() => {
    if (offlineModeEnabled && !isSyncing) {
      performSync();
    }
  }, [offlineModeEnabled, isSyncing, performSync]);

  useEffect(() => {
    if (offlineModeEnabled) {
      getLastSyncInfo().then((info) => setLastSyncLabel(info.label));

      if (!hasScheduledRef.current) {
        hasScheduledRef.current = true;
        delayTimerRef.current = setTimeout(() => {
          performSync();
        }, SYNC_DELAY_MS);
      }
    } else {
      clearOfflineDb().then(() => {
        setLastSyncLabel("Not synced");
      });
      hasScheduledRef.current = false;
    }

    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, [offlineModeEnabled, performSync]);

  return {
    isSyncing,
    lastSyncLabel,
    enabled: offlineModeEnabled,
    triggerSync,
  };
}

// ─── React Context & Provider ─────────────────────────────────────────────────

const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null);

export function useOfflineSyncContext(): OfflineSyncContextValue {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    return {
      isSyncing: false,
      lastSyncLabel: "Not synced",
      enabled: false,
      isOnline: true,
      triggerSync: () => {},
    };
  }
  return context;
}

export function OfflineSyncProvider({
  children,
  userId,
  initialOfflineMode,
}: {
  children: React.ReactNode;
  userId: string;
  initialOfflineMode: boolean;
}) {
  const [offlineMode, setOfflineMode] = useState(initialOfflineMode);
  const isOnline = useOnlineStatus();
  const syncState = useOfflineSync(offlineMode, userId);

  useEffect(() => {
    setOfflineMode(initialOfflineMode);
  }, [initialOfflineMode]);

  return (
    <OfflineSyncContext.Provider value={{ ...syncState, enabled: offlineMode, isOnline }}>
      {!isOnline && <OfflineBanner lastSyncLabel={syncState.lastSyncLabel} />}
      {children}
    </OfflineSyncContext.Provider>
  );
}
