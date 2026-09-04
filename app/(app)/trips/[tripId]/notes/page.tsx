import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "@/features/trip-workspace/common/auth-check";
import { NotesGrid } from "@/features/trip-workspace/notes/components/notes-grid";

interface NotesPageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export const metadata = {
  title: "Notes | Trip Workspace",
  description: "Keep travel notes, restaurant lists, and memos organized.",
};

export default async function NotesPage({ params }: NotesPageProps) {
  const { tripId } = await params;
  const { authorized, trip } = await verifyTripOwnership(tripId);

  if (!authorized || !trip) {
    notFound();
  }

  const items = await db.note.findMany({
    where: { tripId },
    orderBy: [
      { isPinned: "desc" },
      { updatedAt: "desc" },
    ],
  });

  return (
    <div className="space-y-4">
      <NotesGrid tripId={trip.id} items={items} />
    </div>
  );
}
