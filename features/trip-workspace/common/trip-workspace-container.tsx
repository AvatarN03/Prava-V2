"use client";

import { ReactNode, useEffect } from "react";

import { Trip } from "@prisma/client";

import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceNav } from "./workspace-nav";

import { useWorkspaceAi } from "@/features/trip-workspace/context/workspace-ai-context";

interface TripWorkspaceContainerProps {
  trip: Trip;
  counts: {
    itinerary: number;
    accommodations: number;
    expenses: number;
    notes: number;
    checklist?: { completed: number; total: number };
    links: number;
  };
  children: ReactNode;
}

export function TripWorkspaceContainer({
  trip,
  counts,
  children,
}: TripWorkspaceContainerProps) {
  const { setActiveTrip } = useWorkspaceAi();

  useEffect(() => {
    setActiveTrip({
      tripId: trip.id,
      tripTitle: trip.title,
      destination: trip.destination,
    });
    return () => {
      setActiveTrip(null);
    };
  }, [trip.id, trip.title, trip.destination, setActiveTrip]);

  return (
    <div className="w-full min-w-0 space-y-4">
      <WorkspaceHeader trip={trip} />
      <WorkspaceNav tripId={trip.id} counts={counts} />
      <div className="pt-2">{children}</div>
    </div>
  );
}


