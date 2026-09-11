import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "@/features/trip-workspace/common/auth-check";
import { ItineraryView } from "@/features/trip-workspace/itinerary/components/itinerary-view";

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
      <ItineraryView tripId={trip.id} items={items} />
    </div>
  );
}
