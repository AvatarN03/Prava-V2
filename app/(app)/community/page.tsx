import { CommunityForumView } from "@/features/community/components/community-forum-view";
import {
  getForumDiscussions,
  getUserTripsForDiscussion,
} from "@/features/community/forum-actions";

export const metadata = {
  title: "Community Forum — Travel Discussions & Itinerary Advice | Prava AI",
  description:
    "Ask for route pacing advice, share secret viewpoints and culinary gems, discuss packing strategies, and inspect fellow travelers' itineraries on the Prava Community Forum.",
};

export default async function CommunityPage() {
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
