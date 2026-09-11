import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Sparkles,
  Share2,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { getPublishedStory } from "@/features/blog/actions";
import { MarkdownRenderer } from "@/features/blog/components/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CloneTripButton } from "@/app/u/[username]/clone-trip-button";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPublishedStory(slug);

  if (!res.success || !res.story) {
    return {
      title: "Story Not Found | Prava AI",
    };
  }

  const story = res.story;
  return {
    title: `${story.title} | Prava AI Stories`,
    description: story.excerpt || `Read this travel story by ${story.profile?.fullName || "a Prava traveler"}.`,
    openGraph: {
      title: story.title,
      description: story.excerpt || undefined,
      images: story.coverImageUrl ? [story.coverImageUrl] : undefined,
    },
  };
}

export default async function StoryDetailPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const res = await getPublishedStory(slug);

  if (!res.success || !res.story) {
    notFound();
  }

  const story = res.story;
  const authorName = story.profile?.fullName || "Prava Traveler";
  const authorUsername = story.profile?.username;
  const isCreatorPublic = story.profile?.isPublic;
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const wordCount = story.content.split(/\s+/).filter(Boolean).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const publishedDate = story.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Draft";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Public Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/stories"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Stories
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground font-extrabold text-sm">
              P
            </span>
            <span className="font-bold tracking-tight text-sm">Prava AI</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button size="sm" className="h-7 px-3 text-xs shadow-xs">
                Open Workspace
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Story Layout */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Story Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {story.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                #{tag}
              </Badge>
            ))}
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
              <Clock className="w-3.5 h-3.5" /> {readTimeMin} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            {story.title}
          </h1>

          {story.excerpt && (
            <p className="text-base text-muted-foreground leading-relaxed">
              {story.excerpt}
            </p>
          )}

          {/* Author Byline */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted overflow-hidden font-bold text-xs text-muted-foreground shrink-0 border border-border">
              {story.profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={story.profile.avatarUrl}
                  alt={authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                authorInitials
              )}
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                {authorUsername && isCreatorPublic ? (
                  <Link
                    href={`/u/${authorUsername}`}
                    className="font-bold text-sm text-foreground hover:text-primary transition-colors"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="font-bold text-sm text-foreground">{authorName}</span>
                )}
                {authorUsername && isCreatorPublic && (
                  <Link
                    href={`/u/${authorUsername}`}
                    className="text-xs text-muted-foreground hover:text-primary font-mono"
                  >
                    @{authorUsername}
                  </Link>
                )}
                {isCreatorPublic && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 gap-0.5">
                    <Globe className="h-2.5 w-2.5 text-primary" /> Creator
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Published on {publishedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Hero Cover Image */}
        {story.coverImageUrl && (
          <div className="rounded-xl overflow-hidden border border-border shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.coverImageUrl}
              alt={story.title}
              className="w-full h-auto max-h-[480px] object-cover"
            />
          </div>
        )}

        {/* Story Body */}
        <article className="prose prose-neutral dark:prose-invert max-w-none pt-2">
          <MarkdownRenderer content={story.content} />
        </article>

        {/* Linked Itinerary Callout Card (1-Click Clone) */}
        {story.linkedTrip && (
          <div className="mt-12 p-6 rounded-xl border border-primary/30 bg-primary/5 space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                Follow this Itinerary
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              The author has linked their complete itinerary to this story. You can clone all activities, stays, checklists, and notes directly into your Prava workspace with 1 click.
            </p>

            <div className="p-4 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">{story.linkedTrip.title}</h4>
                {story.linkedTrip.destination && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {story.linkedTrip.destination}
                  </p>
                )}
              </div>

              <CloneTripButton
                tripId={story.linkedTrip.id}
                tripTitle={story.linkedTrip.title}
              />
            </div>
          </div>
        )}

        {/* Author Bio Card Footer */}
        <div className="mt-12 p-6 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted overflow-hidden font-bold text-sm text-muted-foreground shrink-0 border border-border">
            {story.profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.profile.avatarUrl}
                alt={authorName}
                className="h-full w-full object-cover"
              />
            ) : (
              authorInitials
            )}
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">Written by {authorName}</h4>
              {authorUsername && isCreatorPublic && (
                <Link
                  href={`/u/${authorUsername}`}
                  className="text-xs text-primary hover:underline font-mono"
                >
                  @{authorUsername}
                </Link>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Traveler and creator on Prava AI. Exploring destinations and creating actionable itinerary plans.
            </p>
            {authorUsername && isCreatorPublic && (
              <div className="pt-1">
                <Link href={`/u/${authorUsername}`}>
                  <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                    <Globe className="h-3 w-3" /> View Creator Profile & Trips
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-border mt-16 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Prava AI — The Next-Gen Autonomous Travel Workspace.</p>
      </footer>
    </div>
  );
}
