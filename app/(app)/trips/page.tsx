import { getTrips } from "@/features/trips/actions";
import { TripList } from "@/features/trips/components/trip-list";
import { CreateTripDialog } from "@/features/trips/components/create-trip-dialog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trips | Prava AI",
  description: "Manage your personal travel itineraries, accommodations, and expenses.",
};

export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Trips</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize itineraries, accommodations, expenses, notes, and checklists.
          </p>
        </div>
        <CreateTripDialog />
      </div>

      <TripList initialTrips={trips} />
    </div>
  );
}
