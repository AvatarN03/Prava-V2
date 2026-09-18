import Link from "next/link";
import { BookOpen, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllPublishedStories } from "@/features/blog/actions";
import { StoryCard } from "@/features/blog/components/story-card";

export const metadata = {
  title: "Travel Stories & Guides",
  description: "Discover curated travel stories, destination deep dives, and expert itineraries written by the Prava creator community.",
};

export default async function StoriesPage() {
  const res = await getAllPublishedStories();
  const stories = res.success && res.stories ? res.stories : [];

  // Extract all unique tags
  const allTags = Array.from(new Set(stories.flatMap((s) => s.tags)));

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <BookOpen className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Travel Stories & Guides
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Explore Creator Narratives
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Real itineraries, cultural insights, hidden spots, and actionable travel stories from the Prava community.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/stories/manage">
            <Button variant="outline" size="sm" className="text-xs">
              My Stories
            </Button>
          </Link>
          <Link href="/stories/new">
            <Button size="sm" className="gap-1.5 text-xs shadow-xs">
              <Plus className="h-3.5 w-3.5" /> Write Story
            </Button>
          </Link>
        </div>
      </div>

      {/* Tags Filter Strip */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground shrink-0 mr-1">
            Explore Topics:
          </span>
          {allTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-xs font-medium text-foreground cursor-pointer transition-colors shrink-0"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/40 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Be the first to publish a travel story</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Share your latest adventure, secret foodie spots, or packing advice to inspire fellow travelers.
            </p>
          </div>
          <Link href="/stories/new">
            <Button size="sm" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Write a Story
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
