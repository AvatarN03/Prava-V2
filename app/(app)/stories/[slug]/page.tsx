import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  ArrowLeft,
  Clock,
  Compass,
  Globe,
  MapPin,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloneTripButton } from "@/app/u/[username]/clone-trip-button";
import { MarkdownRenderer } from "@/features/blog/components/markdown-renderer";
import { StoryHeaderActions } from "@/features/blog/components/story-header-actions";

import { getPublishedStory } from "@/features/blog/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPublishedStory(slug);

  if (!res.success || !res.story) {
    return {
      title: "Story Not Found | Prava",
    };
  }

  const story = res.story;
  return {
    title: `${story.title} | Prava Stories`,
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
  const [res, supabase] = await Promise.all([
    getPublishedStory(slug),
    createClient(),
  ]);

  if (!res.success || !res.story) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const story = res.story;
  const isAuthor = Boolean(user && story.profileId === user.id);
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
    <div className="space-y-6 max-w-3xl mx-auto w-full py-2 pb-16">
      {/* Top Navigation & Action Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <Link
          href="/stories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Stories
        </Link>

        <StoryHeaderActions slug={story.slug} isAuthor={isAuthor} />
      </div>

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

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {story.title}
        </h1>

        {story.excerpt && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
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
        <div className="rounded-lg overflow-hidden border border-border shadow-xs bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.coverImageUrl}
            alt={story.title}
            className="w-full h-auto max-h-[460px] object-cover"
          />
        </div>
      )}

      {/* Story Body Content */}
      <article className="prose prose-neutral dark:prose-invert max-w-none pt-2">
        <MarkdownRenderer content={story.content} />
      </article>

      {/* Linked Itinerary Callout Card (1-Click Clone) */}
      {story.linkedTrip && (
        <div className="mt-10 p-5 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center gap-2">
            <Compass className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Follow this Itinerary
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            The author has linked their complete itinerary to this story. You can clone all activities, stays, checklists, and notes directly into your Prava workspace with 1 click.
          </p>

          <div className="p-3.5 rounded-md border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
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

      {/* Author Bio Card */}
      <div className="mt-10 p-5 rounded-lg border border-border bg-muted/20 flex flex-col sm:flex-row items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted overflow-hidden font-bold text-xs text-muted-foreground shrink-0 border border-border">
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
        <div className="space-y-1.5 flex-1">
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
            Traveler and creator on Prava. Exploring destinations and creating actionable itinerary plans.
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
    </div>
  );
}
