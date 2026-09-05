"use client";

import React from "react";
import { WifiOff, Database, AlertCircle } from "lucide-react";

interface OfflineBannerProps {
  lastSyncLabel?: string;
  itemCount?: number;
}

export function OfflineBanner({
  lastSyncLabel = "Cached data",
  itemCount,
}: OfflineBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-40 w-full border-b border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 backdrop-blur-md px-3 py-2 text-xs text-amber-900 dark:text-amber-200 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Indicator & Main Message */}
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

        {/* Right: Sync Status and Offline notice */}
        <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1 bg-background/60 dark:bg-card/60 px-2 py-0.5 rounded-xs border border-border/60">
            <Database className="h-3 w-3 text-amber-500" />
            <span>Last synced: <strong className="text-foreground">{lastSyncLabel}</strong></span>
          </div>
          {itemCount !== undefined && itemCount > 0 && (
            <span className="hidden md:inline-block bg-background/60 dark:bg-card/60 px-2 py-0.5 rounded-xs border border-border/60">
              {itemCount} active/planning trips available
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
