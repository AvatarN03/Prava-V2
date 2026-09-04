import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "@/features/trip-workspace/common/auth-check";
import { LinksGrid } from "@/features/trip-workspace/links/components/links-grid";

interface LinksPageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export const metadata = {
  title: "Links | Trip Workspace",
  description: "Save and access travel bookmarks, guides, and reservation links.",
};

export default async function LinksPage({ params }: LinksPageProps) {
  const { tripId } = await params;
  const { authorized, trip } = await verifyTripOwnership(tripId);

  if (!authorized || !trip) {
    notFound();
  }

  const items = await db.link.findMany({
    where: { tripId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <LinksGrid tripId={trip.id} items={items} />
    </div>
  );
}
