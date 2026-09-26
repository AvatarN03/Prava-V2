import {
  CommunityForumView,
  getForumDiscussions,
  getUserTripsForDiscussion,
} from "@/features/community";

export const metadata = {
  title: "Traveler Forum",
  description:
    "Ask for route pacing advice, share secret viewpoints and culinary gems, discuss packing strategies, and inspect fellow travelers' itineraries on the Prava Forum.",
};

export default async function ForumPage() {
  const [initialDiscussions, userTrips] = await Promise.all([
    getForumDiscussions(),
    getUserTripsForDiscussion(),
  ]);

  return (
    <CommunityForumView
      initialPosts={initialDiscussions}
      userTrips={userTrips}
    />
  );
}
