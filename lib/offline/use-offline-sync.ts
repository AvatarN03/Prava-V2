"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getOfflineMeta } from "./offline-db";
import { syncTripsToIndexedDB, clearOfflineData, getLastSyncInfo } from "./offline-sync";
import { fetchFullTripsForOfflineSync } from "./offline-sync-action";

/** How long to wait after login/mount before triggering a sync (3 minutes) */
const SYNC_DELAY_MS = 3 * 60 * 1000;

/** Re-sync if the last sync was older than 30 minutes */
const STALE_THRESHOLD_MS = 30 * 60 * 1000;

export interface OfflineSyncState {
  /** Whether a sync is currently in progress */
  isSyncing: boolean;
  /** Human-readable last sync label */
  lastSyncLabel: string;
  /** Whether offline mode is enabled */
  enabled: boolean;
  /** Manually trigger a sync */
  triggerSync: () => void;
}

/**
 * React hook that manages background syncing of trip data to IndexedDB.
 *
 * When offlineMode is enabled:
 *   - Waits 3 minutes after mount before syncing (so user can work first)
 *   - Checks if the cached data belongs to the same user
 *   - Re-syncs if data is stale (>30 min old)
 *
 * When offlineMode is disabled:
 *   - Clears all IndexedDB data immediately
 */
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
      // Check if the IndexedDB belongs to a different user — clear if so
      const meta = await getOfflineMeta();
      if (meta && meta.userId && meta.userId !== userId) {
        await clearOfflineData();
      }

      // Check staleness
      const syncInfo = await getLastSyncInfo();
      const isStale =
        !syncInfo.synced ||
        Date.now() - syncInfo.timestamp > STALE_THRESHOLD_MS;

      if (!isStale) {
        // Data is fresh enough, skip sync
        setLastSyncLabel(syncInfo.label);
        setIsSyncing(false);
        return;
      }

      // Fetch fresh data from server
      const res = await fetchFullTripsForOfflineSync();
      if (res.success && res.payload) {
        await syncTripsToIndexedDB(res.payload, userId);
        const info = await getLastSyncInfo();
        setLastSyncLabel(info.label);
      } else {
        console.error("Offline sync failed:", res.error);
      }
    } catch (err) {
      console.error("Offline sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [userId]);

  // Manual trigger (skips delay)
  const triggerSync = useCallback(() => {
    if (offlineModeEnabled && !isSyncing) {
      performSync();
    }
  }, [offlineModeEnabled, isSyncing, performSync]);

  // Main effect: schedule or clear based on offlineMode
  useEffect(() => {
    if (offlineModeEnabled) {
      // Refresh label on mount
      getLastSyncInfo().then((info) => setLastSyncLabel(info.label));

      // Only schedule once per mount — wait SYNC_DELAY_MS before syncing
      if (!hasScheduledRef.current) {
        hasScheduledRef.current = true;
        delayTimerRef.current = setTimeout(() => {
          performSync();
        }, SYNC_DELAY_MS);
      }
    } else {
      // User disabled offline mode — clear IndexedDB
      clearOfflineData().then(() => {
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
