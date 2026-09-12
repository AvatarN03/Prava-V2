import { notFound } from "next/navigation";

import { ForumThreadView } from "@/features/community/components/forum-thread-view";
import {
  getForumPostBySlug,
  getUserTripsForDiscussion,
} from "@/features/community/forum-actions";

interface CommunityThreadPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CommunityThreadPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await getForumPostBySlug(decodedSlug);

  if (!post) {
    return {
      title: "Discussion Not Found | Prava AI Community",
    };
  }

  return {
    title: `${post.title} | Prava AI Community Forum`,
    description: post.content.slice(0, 160),
  };
}

export default async function CommunityThreadPage({ params }: CommunityThreadPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const [post, userTrips] = await Promise.all([
    getForumPostBySlug(decodedSlug),
    getUserTripsForDiscussion(),
  ]);

  if (!post) {
    notFound();
  }

  return <ForumThreadView initialPost={post} userTrips={userTrips} />;
}
