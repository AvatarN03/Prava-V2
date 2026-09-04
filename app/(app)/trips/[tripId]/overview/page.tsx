import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "@/features/trip-workspace/common/auth-check";
import { OverviewDashboard } from "@/features/trip-workspace/overview/components/overview-dashboard";

interface OverviewPageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export const metadata = {
  title: "Trip Overview | Prava AI",
  description: "High-level summary of trip itinerary, budget, stays, and preparation checklist.",
};

export default async function OverviewPage({ params }: OverviewPageProps) {
  const { tripId } = await params;
  const { authorized, trip } = await verifyTripOwnership(tripId);

  if (!authorized || !trip) {
    notFound();
  }

  // Query all workspace entities for this trip in parallel
  const [itinerary, accommodations, expenses, notes, checklist, links] =
    await Promise.all([
      db.itineraryItem.findMany({
        where: { tripId },
        orderBy: [{ dayNumber: "asc" }, { order: "asc" }, { createdAt: "asc" }],
      }),
      db.accommodation.findMany({
        where: { tripId },
        orderBy: [{ checkIn: "asc" }, { createdAt: "asc" }],
      }),
      db.expense.findMany({
        where: { tripId },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
      db.note.findMany({
        where: { tripId },
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      }),
      db.checklistItem.findMany({
        where: { tripId },
        orderBy: [{ isCompleted: "asc" }, { order: "asc" }, { createdAt: "asc" }],
      }),
      db.link.findMany({
        where: { tripId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <div className="space-y-4">
      <OverviewDashboard
        trip={trip}
        itinerary={itinerary}
        accommodations={accommodations}
        expenses={expenses}
        notes={notes}
        checklist={checklist}
        links={links}
      />
    </div>
  );
}
