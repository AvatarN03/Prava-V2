import Link from "next/link";
import { Calendar, Clock, Globe, ArrowRight, Tag, Bookmark } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
}

export function StoryCard({ story }: { story: StoryCardItem }) {
  const publishedDate = story.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Draft";

  // Calculate estimated reading time (approx 200 words per minute)
  const wordCount = story.content ? story.content.split(/\s+/).filter(Boolean).length : 250;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const authorName = story.profile?.fullName || "Prava Traveler";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border-border bg-card hover:border-primary/40 transition-colors">
      {/* Cover Image */}
      {story.coverImageUrl ? (
        <div className="relative h-44 w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.coverImageUrl}
            alt={story.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-28 w-full bg-gradient-to-br from-primary/10 via-muted to-accent/10 border-b border-border flex items-center justify-center">
          <Bookmark className="h-8 w-8 text-muted-foreground/30" />
        </div>
      )}

      <CardHeader className="p-5 pb-2">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {story.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
              #{tag}
            </Badge>
          ))}
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" /> {readTimeMin} min read
          </span>
        </div>

        <Link href={`/stories/${story.slug}`}>
          <CardTitle className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {story.title}
          </CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="p-5 pt-0 pb-4 space-y-3">
        {story.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {story.excerpt}
          </p>
        )}

        {/* Creator Info */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
          <Avatar className="h-6 w-6 border border-sky-100 shadow-2xs">
            {story.profile?.avatarUrl && (
              <AvatarImage src={story.profile.avatarUrl} alt={authorName} />
            )}
            <AvatarFallback className="bg-sky-100 text-sky-800 text-[10px] font-bold">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 truncate">
            {story.profile?.username && story.profile.isPublic ? (
              <Link
                href={`/u/${story.profile.username}`}
                className="font-semibold text-foreground hover:text-primary transition-colors truncate"
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

      <CardFooter className="p-3 border-t border-border bg-muted/20 flex items-center justify-between rounded-b-sm">
        <Link
          href={`/stories/${story.slug}`}
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 w-full justify-end"
        >
          Read Story <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
