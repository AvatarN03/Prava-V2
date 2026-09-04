import { notFound } from "next/navigation";
import { verifyTripOwnership } from "@/features/trip-workspace/common/auth-check";
import { WorkspaceHeader } from "@/features/trip-workspace/common/workspace-header";
import { WorkspaceNav } from "@/features/trip-workspace/common/workspace-nav";

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

  return (
    <div className="space-y-4">
      <WorkspaceHeader trip={trip} />
      <WorkspaceNav tripId={trip.id} />
      <div className="pt-2">{children}</div>
    </div>
  );
}
