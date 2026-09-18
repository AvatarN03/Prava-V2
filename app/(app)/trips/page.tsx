import { Compass } from "lucide-react";

import { CreateTripDialog } from "@/features/trips/components/create-trip-dialog";
import { TripList } from "@/features/trips/components/trip-list";

import { getTrips, getTripUsageQuota } from "@/features/trips/actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Prava Trips",
  description: "Manage your personal travel itineraries, accommodations, expenses, and checklists.",
};

export default async function TripsPage() {
  const [trips, usage] = await Promise.all([
    getTrips(),
    getTripUsageQuota(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <Compass className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Prava Trips
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Trips Workspace
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your travel itineraries, bookings, budgets, notes, and preparation checklists.
          </p>
        </div>
        <CreateTripDialog />
      </div>

      <TripList initialTrips={trips} tripUsage={usage} />
    </div>
  );
}
