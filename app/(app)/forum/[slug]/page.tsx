import { notFound } from "next/navigation";

import {
  ForumThreadView,
  getForumPostBySlug,
  getUserTripsForDiscussion,
} from "@/features/community";

interface ForumThreadPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ForumThreadPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await getForumPostBySlug(decodedSlug);

  if (!post) {
    return {
      title: "Discussion Not Found | Prava Forum",
    };
  }

  return {
    title: `${post.title} | Prava Forum`,
    description: post.content.slice(0, 160),
  };
}

export default async function ForumThreadPage({ params }: ForumThreadPageProps) {
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
