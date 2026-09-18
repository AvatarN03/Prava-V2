import { BlogEditor } from "@/features/blog/components/blog-editor";
import { getTrips } from "@/features/trips/actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Write a Travel Story",
  description: "Compose and publish a travel story or itinerary guide on Prava.",
};

export default async function NewStoryPage() {
  const trips = await getTrips();
  const userTrips = trips.map((t) => ({
    id: t.id,
    title: t.title,
    destination: t.destination,
  }));

  return (
    <div className="py-2">
      <BlogEditor mode="create" userTrips={userTrips} />
    </div>
  );
}
