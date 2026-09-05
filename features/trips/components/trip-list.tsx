"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Compass, Search, Plus, WifiOff, HardDrive, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trip, TripStatus } from "../types";
import { TripCard } from "./trip-card";
import { CreateTripDialog } from "./create-trip-dialog";
import { useOfflineSyncContext, getOfflineTrips } from "@/lib/offline";

interface TripListProps {
  initialTrips: Trip[];
}

export function TripList({ initialTrips }: TripListProps) {
  const { isOnline, lastSyncLabel, enabled: offlineEnabled } = useOfflineSyncContext();
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [isShowingOfflineData, setIsShowingOfflineData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!isOnline) {
      getOfflineTrips().then((cachedTrips) => {
        if (cachedTrips && cachedTrips.length > 0) {
          const mappedTrips = cachedTrips.map((t) => ({
            ...t,
            startDate: t.startDate ? new Date(t.startDate) : null,
            endDate: t.endDate ? new Date(t.endDate) : null,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            status: t.status as TripStatus,
          })) as unknown as Trip[];
          setTrips(mappedTrips);
          setIsShowingOfflineData(true);
        } else {
          setTrips(initialTrips);
          setIsShowingOfflineData(false);
        }
      });
    } else {
      setTrips(initialTrips);
      setIsShowingOfflineData(false);
    }
  }, [isOnline, initialTrips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trip.destination &&
          trip.destination.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trip.description &&
          trip.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ? true : trip.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [trips, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Offline Alert Note / Marquee */}
      {isShowingOfflineData && (
        <div className="rounded-sm border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xs bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <WifiOff className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Showing {trips.length} Locally Cached Trip{trips.length === 1 ? "" : "s"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                You are currently offline. Planning and active trips are available in read-only mode.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] bg-background/60 dark:bg-card/60 px-2 py-1 rounded-xs border border-border/50 text-muted-foreground self-stretch sm:self-auto justify-center">
            <HardDrive className="h-3 w-3 text-amber-500" />
            <span>Last Synced: <strong>{lastSyncLabel}</strong></span>
          </div>
        </div>
      )}

      {/* Empty State when no trips at all */}
      {trips.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-muted text-muted-foreground mb-3">
              <Compass className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">
              {isShowingOfflineData ? "No cached trips found offline" : "No trips created yet"}
            </CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              {isShowingOfflineData
                ? "No trips have been synced to this device yet. Connect to the internet with Offline Travel Cache enabled to pre-fetch your trips."
                : "Your travel workspace is empty. Create your first trip to start organizing itineraries, notes, and budgets."}
            </CardDescription>
          </CardHeader>
          {!isShowingOfflineData && (
            <CardContent className="flex justify-center pb-12">
              <CreateTripDialog
                trigger={
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create First Trip
                  </Button>
                }
              />
            </CardContent>
          )}
        </Card>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or destination..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(["ALL", "PLANNING", "ACTIVE", "COMPLETED", "ARCHIVED"] as const).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 text-xs rounded-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      statusFilter === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {status === "ALL"
                      ? "All"
                      : status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Grid of Trips */}
          {filteredTrips.length === 0 ? (
            <div className="text-center py-12 rounded-sm border border-border bg-card p-6">
              <p className="text-sm font-medium text-foreground">No matching trips found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search query or status filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
