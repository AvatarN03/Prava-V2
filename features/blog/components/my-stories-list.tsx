"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Edit,
  ExternalLink,
  Loader2,
  Plus,
  Radio,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { deleteBlogPost, toggleStoryPublishStatus } from "../actions";

interface MyStoriesListProps {
  posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content?: string;
    coverImageUrl?: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    publishedAt: Date | string | null;
    updatedAt: Date | string;
    tags: string[];
    linkedTrip?: { id: string; title: string; destination: string | null } | null;
  }>;
}

const DEFAULT_STORY_COVER =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";

export function MyStoriesList({ posts: initialPosts }: MyStoriesListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const publishedCount = useMemo(
    () => posts.filter((p) => p.status === "PUBLISHED").length,
    [posts]
  );
  const draftCount = useMemo(
    () => posts.filter((p) => p.status === "DRAFT").length,
    [posts]
  );

  const filteredPosts = useMemo(() => {
    if (filter === "PUBLISHED") return posts.filter((p) => p.status === "PUBLISHED");
    if (filter === "DRAFT") return posts.filter((p) => p.status === "DRAFT");
    return posts;
  }, [posts, filter]);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteBlogPost(id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        toast.success("Story deleted.");
      } else {
        toast.error(res.error || "Failed to delete story.");
      }
      setDeletingId(null);
    });
  };

  const handleStatusToggle = (post: MyStoriesListProps["posts"][0]) => {
    setTogglingId(post.id);
    startTransition(async () => {
      const res = await toggleStoryPublishStatus(post.id);
      if (res.success && res.post) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  status: res.post.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
                  publishedAt: res.post.publishedAt,
                }
              : p
          )
        );
        toast.success(
          res.post.status === "PUBLISHED"
            ? "Story is now public!"
            : "Story moved back to draft."
        );
      } else {
        toast.error(res.error || "Failed to update status.");
      }
      setTogglingId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Navigation */}
      <Link
        href="/stories"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Stories
      </Link>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <BookOpen className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Story Studio
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            My Stories ({posts.length})
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your written guides, review draft itineraries, and publish narratives for the community.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/stories/new">
            <Button size="sm" className="gap-1.5 text-xs shadow-xs cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Write Story
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div className="flex items-center gap-1 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
            filter === "ALL"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          All ({posts.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter("PUBLISHED")}
          className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
            filter === "PUBLISHED"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          Published ({publishedCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter("DRAFT")}
          className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
            filter === "DRAFT"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          Drafts ({draftCount})
        </button>
      </div>

      {/* Grid of Story Cards */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center space-y-3 bg-card/40">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold">
            {filter === "ALL"
              ? "No stories written yet"
              : filter === "PUBLISHED"
              ? "No published stories found"
              : "No draft stories found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Inspire other travelers by sharing your journey, itineraries, travel hacks, and destination reviews.
          </p>
          <Link href="/stories/new">
            <Button size="sm" className="gap-1.5 text-xs mt-2 shadow-xs cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Write Story
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const coverUrl = post.coverImageUrl || DEFAULT_STORY_COVER;
            const wordCount = (post.content || post.excerpt || "").split(/\s+/).filter(Boolean).length;
            const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

            return (
              <Card
                key={post.id}
                className="group relative flex flex-col justify-between overflow-hidden border border-border bg-card hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-xs rounded-md"
              >
                {/* Story Cover Image with Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-muted border-b border-border/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverUrl}
                    alt={post.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Status Badge Overlay */}
                  <div className="absolute top-2.5 left-2.5">
                    {post.status === "PUBLISHED" ? (
                      <Badge className="bg-emerald-500/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs border-none flex items-center gap-1">
                        <Radio className="h-2.5 w-2.5" /> Published
                      </Badge>
                    ) : post.status === "DRAFT" ? (
                      <Badge
                        variant="secondary"
                        className="bg-background/90 text-foreground text-[10px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs border border-border"
                      >
                        Draft
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-background/80 text-[10px] font-bold uppercase tracking-wider"
                      >
                        Archived
                      </Badge>
                    )}
                  </div>

                  {/* Reading Time Badge Overlay */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="inline-flex items-center gap-1 rounded-sm bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                      <Clock className="w-3 h-3" /> {readTimeMin}m read
                    </span>
                  </div>
                </div>

                {/* Card Content Header & Details */}
                <CardHeader className="p-4 pb-2 space-y-2">
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 font-medium"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <Link
                    href={
                      post.status === "PUBLISHED"
                        ? `/stories/${post.slug}`
                        : `/stories/${post.slug}/edit`
                    }
                  >
                    <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                  </Link>
                </CardHeader>

                {/* Card Content Excerpt & Linked Trip */}
                <CardContent className="p-4 pt-0 pb-3 space-y-2.5 flex-1 flex flex-col justify-between">
                  {post.excerpt ? (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/60 italic">
                      No excerpt provided.
                    </p>
                  )}

                  <div className="space-y-2 pt-1">
                    {/* Attached Workspace Trip Badge */}
                    {post.linkedTrip && (
                      <div className="flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/20 px-2 py-1 text-[11px] text-primary">
                        <Compass className="h-3 w-3 shrink-0" />
                        <span className="font-semibold truncate max-w-[140px]">
                          {post.linkedTrip.title}
                        </span>
                        {post.linkedTrip.destination && (
                          <span className="text-muted-foreground text-[10px] ml-auto truncate max-w-[90px]">
                            {post.linkedTrip.destination}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Date Metadata */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Updated {new Date(post.updatedAt).toLocaleDateString()}
                      </span>
                      {post.publishedAt && (
                        <span>
                          · Published {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Card Footer Action Bar */}
                <CardFooter className="border-t border-border/60 p-2.5 flex items-center justify-between gap-1.5 bg-muted/10">
                  <div className="flex items-center gap-1">
                    {post.status === "PUBLISHED" && (
                      <Link href={`/stories/${post.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      </Link>
                    )}

                    <Link href={`/stories/${post.slug}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Publish / Unpublish Toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs cursor-pointer"
                      onClick={() => handleStatusToggle(post)}
                      disabled={togglingId === post.id}
                      title={
                        post.status === "PUBLISHED"
                          ? "Move to draft"
                          : "Publish story publicly"
                      }
                    >
                      {togglingId === post.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : post.status === "PUBLISHED" ? (
                        <Radio className="h-3 w-3 text-emerald-500 mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground mr-1" />
                      )}
                      <span>
                        {post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </span>
                    </Button>

                    {/* Delete Story Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deletingId === post.id}
                      title="Delete story"
                    >
                      {deletingId === post.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
