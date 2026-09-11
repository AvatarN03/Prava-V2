"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Edit,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  Calendar,
  Globe,
  Archive,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteBlogPost, updateBlogPost } from "../actions";

interface MyStoriesListProps {
  posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    publishedAt: Date | string | null;
    updatedAt: Date | string;
    tags: string[];
    linkedTrip?: { id: string; title: string; destination: string | null } | null;
  }>;
}

export function MyStoriesList({ posts: initialPosts }: MyStoriesListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteBlogPost(id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(res.error || "Failed to delete story.");
      }
      setDeletingId(null);
    });
  };

  const handleStatusToggle = (post: MyStoriesListProps["posts"][0]) => {
    const nextStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    startTransition(async () => {
      const res = await updateBlogPost(post.id, {
        title: post.title,
        content: "placeholder", // Content is preserved if we just toggle
        status: nextStatus,
      });
      if (res.success && res.post) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, status: res.post.status, publishedAt: res.post.publishedAt }
              : p
          )
        );
      } else {
        alert(res.error || "Failed to update status.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">My Stories ({posts.length})</h2>
          <p className="text-xs text-muted-foreground">Manage, publish, and edit your travel narratives.</p>
        </div>
        <Link href="/stories/new">
          <Button size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Write Story
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold">No stories published yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Inspire other travelers by sharing your journey, itineraries, travel hacks, and destination reviews.
          </p>
          <Link href="/stories/new">
            <Button size="sm" className="gap-1.5 text-xs mt-2">
              <Plus className="h-3.5 w-3.5" /> Write Your First Story
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-md border border-border bg-card">
          {posts.map((post) => (
            <div key={post.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={
                      post.status === "PUBLISHED"
                        ? "default"
                        : post.status === "DRAFT"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-[10px] uppercase font-bold"
                  >
                    {post.status}
                  </Badge>
                  {post.tags.map((t) => (
                    <span key={t} className="text-[10px] text-muted-foreground font-medium">
                      #{t}
                    </span>
                  ))}
                  {post.linkedTrip && (
                    <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                      · Linked: {post.linkedTrip.title}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-foreground truncate">{post.title}</h3>
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                  <span>Updated {new Date(post.updatedAt).toLocaleDateString()}</span>
                  {post.publishedAt && (
                    <span>Published {new Date(post.publishedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {post.status === "PUBLISHED" && (
                  <Link href={`/stories/${post.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                    </Button>
                  </Link>
                )}
                <Link href={`/stories/${post.slug}/edit`}>
                  <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(post.id, post.title)}
                  disabled={deletingId === post.id}
                >
                  {deletingId === post.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
