import { getMyBlogPosts } from "@/features/blog/actions";
import { MyStoriesList } from "@/features/blog/components/my-stories-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Travel Stories | Prava AI",
  description: "Manage your drafts and published travel stories.",
};

export default async function ManageStoriesPage() {
  const res = await getMyBlogPosts();
  const posts = res.success && res.posts ? res.posts : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full py-2">
      <MyStoriesList posts={posts} />
    </div>
  );
}
