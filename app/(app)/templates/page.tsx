import { getCommunityTrips } from "@/features/community/actions";
import { TemplatesView } from "@/features/community/components/templates-view";

export const metadata = {
  title: "Trip Templates & Curated Itineraries | Prava AI",
  description:
    "Explore curated trip templates, discover destination itineraries, and 1-click clone complete travel plans into your personal Prava workspace.",
};

export default async function TemplatesPage() {
  const trips = await getCommunityTrips();

  return <TemplatesView initialTrips={trips} />;
}
