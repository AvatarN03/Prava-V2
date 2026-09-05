"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useOfflineSync, OfflineSyncState } from "./use-offline-sync";
import { useOnlineStatus } from "./use-online-status";
import { OfflineBanner } from "./offline-banner";

interface OfflineSyncContextValue extends OfflineSyncState {
  isOnline: boolean;
}

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

interface OfflineSyncProviderProps {
  children: React.ReactNode;
  userId: string;
  initialOfflineMode: boolean;
}

export function OfflineSyncProvider({
  children,
  userId,
  initialOfflineMode,
}: OfflineSyncProviderProps) {
  const [offlineMode, setOfflineMode] = useState(initialOfflineMode);
  const isOnline = useOnlineStatus();
  const syncState = useOfflineSync(offlineMode, userId);

  // Sync state if initialOfflineMode changes from server or parent
  useEffect(() => {
    setOfflineMode(initialOfflineMode);
  }, [initialOfflineMode]);

  return (
    <OfflineSyncContext.Provider value={{ ...syncState, enabled: offlineMode, isOnline }}>
      {!isOnline && (
        <OfflineBanner lastSyncLabel={syncState.lastSyncLabel} />
      )}
      {children}
    </OfflineSyncContext.Provider>
  );
}
