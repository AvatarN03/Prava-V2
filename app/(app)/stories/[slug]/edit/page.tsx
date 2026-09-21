import { notFound } from "next/navigation";

import { BlogEditor } from "@/features/blog/components/blog-editor";

import { getBlogPostForEdit } from "@/features/blog/actions";
import { getTrips } from "@/features/trips/actions";

export const dynamic = "force-dynamic";

interface EditStoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditStoryPage({ params }: EditStoryPageProps) {
  const { slug } = await params;
  const [postRes, trips] = await Promise.all([
    getBlogPostForEdit(slug),
    getTrips(),
  ]);

  if (!postRes.success || !postRes.post) {
    notFound();
  }

  const userTrips = trips.map((t) => ({
    id: t.id,
    title: t.title,
    destination: t.destination,
  }));

  const post = postRes.post;

  return (
    <div className="py-2">
      <BlogEditor
        mode="edit"
        postId={post.id}
        initialData={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImageUrl: post.coverImageUrl,
          tags: post.tags,
          status: post.status,
          linkedTripId: post.linkedTripId,
        }}
        userTrips={userTrips}
      />
    </div>
  );
}
