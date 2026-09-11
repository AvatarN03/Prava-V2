import Link from "next/link";
import { User, Globe, MapPin, BookOpen, Route, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CommunityCreatorItem } from "../types";

interface CommunityCreatorCardProps {
  creator: CommunityCreatorItem;
}

export function CommunityCreatorCard({ creator }: CommunityCreatorCardProps) {
  const displayName = creator.fullName || creator.username;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col justify-between rounded-xl border border-sky-100 bg-card p-5 shadow-2xs hover:border-[#2D9BF0]/40 hover:shadow-xs transition-all duration-200 group">
      <div className="space-y-4">
        {/* Top profile row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-sky-200 shadow-2xs">
              {creator.avatarUrl && (
                <AvatarImage src={creator.avatarUrl} alt={displayName} />
              )}
              <AvatarFallback className="bg-gradient-to-tr from-[#2D9BF0] to-[#55B8FF] text-white font-bold text-sm">
                {initials || <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/u/${creator.username}`}
                  className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate"
                >
                  {displayName}
                </Link>
                <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                  <Globe className="h-2.5 w-2.5" />
                  Creator
                </span>
              </div>
              <Link
                href={`/u/${creator.username}`}
                className="text-xs text-muted-foreground hover:underline block truncate"
              >
                @{creator.username}
              </Link>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {creator.bio || "Passionate travel curator and itinerary architect on Prava AI."}
        </p>

        {/* Top Destinations */}
        {creator.topDestinations && creator.topDestinations.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mr-0.5">
              <MapPin className="h-3 w-3 text-primary/70" /> Destinations:
            </span>
            {creator.topDestinations.slice(0, 3).map((dest) => (
              <span
                key={dest}
                className="inline-flex items-center px-2 py-0.5 rounded bg-muted/60 text-[10px] font-medium text-foreground"
              >
                {dest}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats & Profile Action */}
      <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-medium" title="Published Itineraries">
            <Route className="h-3.5 w-3.5 text-primary/80" />
            <span>{creator.publishedTripsCount} {creator.publishedTripsCount === 1 ? "Trip" : "Trips"}</span>
          </div>
          <div className="flex items-center gap-1 font-medium" title="Published Stories">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{creator.publishedStoriesCount} {creator.publishedStoriesCount === 1 ? "Story" : "Stories"}</span>
          </div>
        </div>

        <Link href={`/u/${creator.username}`}>
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1 group-hover:text-primary">
            Profile
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
