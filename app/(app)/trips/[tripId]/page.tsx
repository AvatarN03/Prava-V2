import { redirect } from "next/navigation";

interface TripPageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export default async function TripPage({ params }: TripPageProps) {
  const { tripId } = await params;
  redirect(`/trips/${tripId}/overview`);
}
