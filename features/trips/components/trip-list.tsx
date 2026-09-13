"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Plus,
  WifiOff,
  HardDrive,
  LayoutGrid,
  List,
  ArrowUpDown,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  LayoutTemplate,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trip, TripStatus, TripViewMode, TripSortOption, TripUsageQuota } from "../types";
import { TripCard } from "./trip-card";
import { TripTableView } from "./trip-table-view";
import { CreateTripDialog } from "./create-trip-dialog";
import { UpgradeDialog } from "@/features/pricing/components/upgrade-dialog";
import { useOfflineSyncContext, getOfflineTrips } from "@/lib/offline";

interface TripListProps {
  initialTrips: Trip[];
  tripUsage?: TripUsageQuota;
}

export function TripList({ initialTrips, tripUsage }: TripListProps) {
  const { isOnline, lastSyncLabel } = useOfflineSyncContext();
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [isShowingOfflineData, setIsShowingOfflineData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<TripViewMode>("grid");
  const [sortOption, setSortOption] = useState<TripSortOption>("departure");
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // Sync with initial trips or offline cache
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

  // Overall metric aggregations
  const totalCount = trips.length;
  const activeCount = trips.filter((t) => t.status === "ACTIVE").length;
  const planningCount = trips.filter((t) => t.status === "PLANNING").length;
  const completedCount = trips.filter((t) => t.status === "COMPLETED").length;
  const archivedCount = trips.filter((t) => t.status === "ARCHIVED").length;

  const maxTrips = tripUsage?.maxTrips || (tripUsage?.isPro ? 25 : 10);
  const usageCount = tripUsage?.count ?? totalCount;
  const usagePercentage = Math.min(Math.round((usageCount / maxTrips) * 100), 100);

  // Filter and sort trips
  const filteredTrips = useMemo(() => {
    const result = trips.filter((trip) => {
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

    return result.sort((a, b) => {
      if (sortOption === "departure") {
        // Trips with upcoming start dates first, then unset dates
        if (!a.startDate && !b.startDate) return 0;
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      if (sortOption === "recent_updated") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortOption === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === "alphabetical") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [trips, searchQuery, statusFilter, sortOption]);

  const statusOptions = [
    { label: "All", value: "ALL", count: totalCount },
    { label: "Active", value: "ACTIVE", count: activeCount },
    { label: "Planning", value: "PLANNING", count: planningCount },
    { label: "Completed", value: "COMPLETED", count: completedCount },
    { label: "Archived", value: "ARCHIVED", count: archivedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Offline Alert Banner */}
      {isShowingOfflineData && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xs bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <WifiOff className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Showing {trips.length} Locally Cached Trip{trips.length === 1 ? "" : "s"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                You are currently offline. Workspace trips and itineraries are accessible in read-only mode.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] bg-background/60 dark:bg-card/60 px-2.5 py-1 rounded-xs border border-border/50 text-muted-foreground self-stretch sm:self-auto justify-center">
            <HardDrive className="h-3 w-3 text-amber-500" />
            <span>Last Synced: <strong>{lastSyncLabel}</strong></span>
          </div>
        </div>
      )}

      {/* Top Metrics & Tier Meter Strip */}
      {totalCount > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Active Trips Metric */}
          <Card className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active Trips</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">{activeCount}</span>
              <span className="text-[11px] text-muted-foreground">In progress</span>
            </div>
          </Card>

          {/* Planning Metric */}
          <Card className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Planning</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-sky-500/10 text-sky-600">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">{planningCount}</span>
              <span className="text-[11px] text-muted-foreground">Upcoming drafts</span>
            </div>
          </Card>

          {/* Completed Metric */}
          <Card className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Completed</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-blue-500/10 text-blue-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">{completedCount}</span>
              <span className="text-[11px] text-muted-foreground">Past journeys</span>
            </div>
          </Card>

          {/* Workspace Tier & Quota Meter */}
          <Card className="rounded-md border border-border bg-card p-3.5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" /> Workspace Slots
              </span>
              {!tripUsage?.isPro && (
                <button
                  type="button"
                  onClick={() => setIsUpgradeOpen(true)}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  <Sparkles className="h-2.5 w-2.5" /> Upgrade
                </button>
              )}
            </div>
            <div className="mt-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-foreground">
                  {usageCount} <span className="text-[11px] font-normal text-muted-foreground">/ {maxTrips} trips</span>
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">{usagePercentage}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    usagePercentage >= 90
                      ? "bg-destructive"
                      : usagePercentage >= 70
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Empty State when no trips at all */}
      {totalCount === 0 ? (
        <Card className="border-dashed rounded-md">
          <CardHeader className="text-center py-14">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary mb-3">
              <Compass className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold">
              {isShowingOfflineData ? "No cached trips found offline" : "Your Travel Workspace is Empty"}
            </CardTitle>
            <CardDescription className="max-w-md mx-auto text-xs mt-1">
              {isShowingOfflineData
                ? "No trips have been cached on this browser yet. Connect to the internet to sync your workspace."
                : "Organize daily itineraries, bookings, expenses, notes, and packing checklists in one cohesive workspace."}
            </CardDescription>
          </CardHeader>
          {!isShowingOfflineData && (
            <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-14">
              <CreateTripDialog
                trigger={
                  <Button size="sm" className="cursor-pointer gap-1.5">
                    <Plus className="w-4 h-4" />
                    Create First Trip
                  </Button>
                }
              />
              <Link href="/templates">
                <Button variant="outline" size="sm" className="cursor-pointer gap-1.5">
                  <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                  Explore Curated Templates
                </Button>
              </Link>
            </CardContent>
          )}
        </Card>
      ) : (
        <>
          {/* Controls Bar: Search, Status Filter Pills, Sort Dropdown & View Mode Switcher */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search title, destination, notes..."
                  className="pl-8.5 h-9 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Sort & View Mode Switcher */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Select
                  value={sortOption}
                  onValueChange={(val) => setSortOption(val as TripSortOption)}
                >
                  <SelectTrigger className="h-9 w-[205px] text-xs cursor-pointer">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="departure" className="cursor-pointer">Departure (Soonest)</SelectItem>
                    <SelectItem value="recent_updated" className="cursor-pointer">Recently Updated</SelectItem>
                    <SelectItem value="newest" className="cursor-pointer">Newest Created</SelectItem>
                    <SelectItem value="alphabetical" className="cursor-pointer">Title (A–Z)</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle Buttons */}
                <div className="flex items-center rounded-md border border-border bg-card p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    className={`flex h-7.5 w-7.5 items-center justify-center rounded-xs transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    aria-label="Table view"
                    className={`flex h-7.5 w-7.5 items-center justify-center rounded-xs transition-colors cursor-pointer ${
                      viewMode === "table"
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {statusOptions.map(({ label, value, count }) => {
                const isActive = statusFilter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={`px-3 py-1 rounded-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-xs ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results: Grid or Table */}
          {filteredTrips.length === 0 ? (
            <div className="text-center py-12 rounded-md border border-border bg-card p-6">
              <p className="text-sm font-semibold text-foreground">No matching trips found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search query or switching the status filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs cursor-pointer"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <TripTableView trips={filteredTrips} />
          )}
        </>
      )}

      <UpgradeDialog
        open={isUpgradeOpen}
        onOpenChange={setIsUpgradeOpen}
      />
    </div>
  );
}
