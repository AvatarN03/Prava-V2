import { notFound } from "next/navigation";

import { TripWorkspaceContainer } from "@/features/trip-workspace/common/trip-workspace-container";

import { verifyTripOwnership } from "@/features/trip-workspace/common/auth-check";

interface TripWorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    tripId: string;
  }>;
}

export default async function TripWorkspaceLayout({
  children,
  params,
}: TripWorkspaceLayoutProps) {
  const { tripId } = await params;
  const { authorized, trip } = await verifyTripOwnership(tripId);

  if (!authorized || !trip) {
    notFound();
  }

  const tripWithRelations = trip as typeof trip & {
    _count?: {
      itinerary: number;
      accommodations: number;
      checklistItems: number;
      notes: number;
      expenses: number;
      links: number;
    };
    expenses?: { amount: number; currency: string }[];
    checklistItems?: { isCompleted: boolean }[];
  };

  const totalSpend = tripWithRelations.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const completedTasks = tripWithRelations.checklistItems?.filter((c) => c.isCompleted).length || 0;
  const totalTasks = tripWithRelations._count?.checklistItems || 0;

  const counts = {
    itinerary: tripWithRelations._count?.itinerary || 0,
    accommodations: tripWithRelations._count?.accommodations || 0,
    expenses: totalSpend,
    notes: tripWithRelations._count?.notes || 0,
    checklist: totalTasks > 0 ? { completed: completedTasks, total: totalTasks } : undefined,
    links: tripWithRelations._count?.links || 0,
  };

  return (
    <TripWorkspaceContainer trip={trip} counts={counts}>
      {children}
    </TripWorkspaceContainer>
  );
}

