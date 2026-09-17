import { notFound } from "next/navigation";

import { ItineraryView } from "@/features/trip-workspace/itinerary/components/itinerary-view";

import { db } from "@/lib/db";
import { verifyTripOwnership } from "@/features/trip-workspace/common/auth-check";

interface ItineraryPageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export const metadata = {
  title: "Itinerary | Trip Workspace",
  description: "Schedule day-by-day activities and travel plans.",
};

export default async function ItineraryPage({ params }: ItineraryPageProps) {
  const { tripId } = await params;
  const { authorized, trip } = await verifyTripOwnership(tripId);

  if (!authorized || !trip) {
    notFound();
  }

  const items = await db.itineraryItem.findMany({
    where: { tripId },
    orderBy: [
      { dayNumber: "asc" },
      { order: "asc" },
      { createdAt: "asc" },
    ],
  });

  return (
    <div className="space-y-4">
      <ItineraryView
        tripId={trip.id}
        items={items}
        tripTitle={trip.title}
        destination={trip.destination}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
      />
    </div>
  );
}
