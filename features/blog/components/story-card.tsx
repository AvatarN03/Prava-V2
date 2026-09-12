import Link from "next/link";

import { ArrowRight, Clock, Compass, Globe } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface StoryCardItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content?: string;
  coverImageUrl: string | null;
  tags: string[];
  publishedAt: Date | string | null;
  profile?: {
    fullName: string | null;
    username: string | null;
    avatarUrl: string | null;
    isPublic: boolean;
  } | null;
  linkedTrip?: {
    id: string;
    title: string;
    destination: string | null;
  } | null;
}

const DEFAULT_STORY_COVER =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";

export function StoryCard({ story }: { story: StoryCardItem }) {
  const publishedDate = story.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Draft";

  // Calculate estimated reading time (approx 200 words per minute)
  const wordCount = story.content
    ? story.content.split(/\s+/).filter(Boolean).length
    : 250;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const authorName = story.profile?.fullName || "Prava Traveler";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const coverUrl = story.coverImageUrl || DEFAULT_STORY_COVER;

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border border-border bg-card hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-xs rounded-md">
      {/* Cover Image Header */}
      <div className="relative h-44 w-full overflow-hidden bg-muted border-b border-border/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={story.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {story.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-1.5 py-0 font-medium"
            >
              #{tag}
            </Badge>
          ))}
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" /> {readTimeMin} min read
          </span>
        </div>

        <Link href={`/stories/${story.slug}`}>
          <CardTitle className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {story.title}
          </CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-0 pb-3 space-y-2.5 flex-1 flex flex-col justify-between">
        {story.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {story.excerpt}
          </p>
        )}

        {/* Attached Workspace Trip Badge */}
        {story.linkedTrip && (
          <div className="flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/20 px-2 py-1 text-[11px] text-primary">
            <Compass className="h-3 w-3 shrink-0" />
            <span className="font-semibold truncate max-w-[150px]">
              {story.linkedTrip.title}
            </span>
            <span className="text-muted-foreground ml-auto text-[10px]">
              Cloneable Trip
            </span>
          </div>
        )}

        {/* Creator Attribution */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
          <Avatar className="h-5 w-5 border border-border">
            {story.profile?.avatarUrl && (
              <AvatarImage src={story.profile.avatarUrl} alt={authorName} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-bold">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 truncate">
            {story.profile?.username && story.profile.isPublic ? (
              <Link
                href={`/u/${story.profile.username}`}
                className="font-medium text-foreground hover:text-primary transition-colors truncate"
              >
                @{story.profile.username}
              </Link>
            ) : (
              <span className="font-medium truncate">{authorName}</span>
            )}
            {story.profile?.isPublic && (
              <Globe className="w-2.5 h-2.5 text-primary shrink-0" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {publishedDate}
          </span>
        </div>
      </CardContent>

      {/* Footer CTA: Bottom Right */}
      <CardFooter className="p-3 border-t border-border bg-muted/20 flex items-center justify-end rounded-b-md">
        <Link
          href={`/stories/${story.slug}`}
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Read Story</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
