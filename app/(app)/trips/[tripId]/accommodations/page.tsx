import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "@/features/trip-workspace/common/auth-check";
import { AccommodationList } from "@/features/trip-workspace/accommodations/components/accommodation-list";

interface AccommodationsPageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export const metadata = {
  title: "Accommodation | Trip Workspace",
  description: "Manage hotel and lodging stays for your trip.",
};

export default async function AccommodationsPage({ params }: AccommodationsPageProps) {
  const { tripId } = await params;
  const { authorized, trip } = await verifyTripOwnership(tripId);

  if (!authorized || !trip) {
    notFound();
  }

  const items = await db.accommodation.findMany({
    where: { tripId },
    orderBy: [{ checkIn: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-4">
      <AccommodationList tripId={trip.id} items={items} />
    </div>
  );
}
