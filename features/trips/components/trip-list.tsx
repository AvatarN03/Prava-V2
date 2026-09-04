"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Compass, Search, Plus, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trip, TripStatus } from "../types";
import { TripCard } from "./trip-card";
import { CreateTripDialog } from "./create-trip-dialog";

interface TripListProps {
  initialTrips: Trip[];
}

export function TripList({ initialTrips }: TripListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredTrips = useMemo(() => {
    return initialTrips.filter((trip) => {
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
  }, [initialTrips, searchQuery, statusFilter]);

  if (initialTrips.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-muted text-muted-foreground mb-3">
            <Compass className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">No trips created yet</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            Your travel workspace is empty. Create your first trip to start organizing itineraries, notes, and budgets.
          </CardDescription>
        </CardHeader>
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
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
    </div>
  );
}
