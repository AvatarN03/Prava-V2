import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ListTodo,
  BedDouble,
  Copy,
  Eye,
  Loader2,
  Globe,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CommunityTripItem } from "../types";
import { cloneTripTemplate } from "../actions";

interface CommunityTripCardProps {
  trip: CommunityTripItem;
  onPreview: (trip: CommunityTripItem) => void;
}

export function CommunityTripCard({ trip, onPreview }: CommunityTripCardProps) {
  const router = useRouter();
  const [isCloning, startCloning] = useTransition();

  const handleClone = () => {
    startCloning(async () => {
      const res = await cloneTripTemplate(trip.id);
      if (res.success && res.tripId) {
        toast.success(`Successfully cloned "${trip.title}" to your workspace!`);
        router.push(`/trips/${res.tripId}/overview`);
      } else {
        toast.error(res.error || "Failed to clone template. Please sign in.");
      }
    });
  };

  const getAuthorInitials = () => {
    return (trip.authorName || "T")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border-border bg-card hover:border-primary/40 transition-colors">
      {/* Cover Image or Gradient Fallback */}
      {trip.coverImageUrl ? (
        <div className="relative h-28 w-full overflow-hidden border-b border-border bg-muted/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trip.coverImageUrl}
            alt={trip.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-16 w-full bg-gradient-to-r from-primary/10 via-muted/60 to-accent/15 border-b border-border flex items-center justify-between px-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
            {trip.region || "Travel Route"}
          </span>
          <MapPin className="h-4 w-4 text-primary/40" />
        </div>
      )}

      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="planning">{trip.category}</Badge>
              <span className="text-[11px] font-medium text-muted-foreground">
                {trip.durationDays} Days
              </span>
            </div>
            <CardTitle className="text-base font-bold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {trip.title}
            </CardTitle>
          </div>
        </div>

        {trip.destination && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{trip.destination}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-5 pt-0 pb-4 space-y-3">
        {trip.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {trip.description}
          </p>
        )}

        {/* Author Creator Badge */}
        <div className="flex items-center gap-2 pt-1">
          <Avatar className="h-5 w-5 border border-sky-100 shadow-2xs">
            {trip.authorAvatarUrl && (
              <AvatarImage src={trip.authorAvatarUrl} alt={trip.authorName} />
            )}
            <AvatarFallback className="bg-sky-100 text-sky-800 text-[9px] font-bold">
              {getAuthorInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground min-w-0 truncate">
            {trip.authorUsername && trip.isCreatorPublic ? (
              <Link
                href={`/u/${trip.authorUsername}`}
                className="font-semibold text-foreground hover:text-primary transition-colors truncate"
                onClick={(e) => e.stopPropagation()}
              >
                @{trip.authorUsername}
              </Link>
            ) : (
              <span className="font-medium truncate">{trip.authorName}</span>
            )}
            {trip.isCreatorPublic && (
              <Globe className="w-2.5 h-2.5 text-primary shrink-0" />
            )}
          </div>
        </div>

        {/* Highlights Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {trip.highlights.slice(0, 3).map((hl, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-0.5 rounded-2xs bg-muted/60 text-[10px] text-foreground font-medium truncate max-w-[180px]"
            >
              {hl}
            </span>
          ))}
        </div>

        {/* Counts Strip */}
        <div className="flex items-center gap-3 pt-2 text-[11px] text-muted-foreground border-t border-border/60">
          <span className="inline-flex items-center gap-1">
            <ListTodo className="w-3 h-3 text-primary" /> {trip.activityCount} events
          </span>
          <span className="inline-flex items-center gap-1">
            <BedDouble className="w-3 h-3 text-primary" /> {trip.accommodationCount} stays
          </span>
          {trip.estimatedBudget && (
            <span className="font-mono text-emerald-600 font-semibold ml-auto">
              {trip.estimatedBudget}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3.5 border-t border-border bg-muted/20 flex items-center justify-between rounded-b-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onPreview(trip)}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          Preview
        </Button>

        <Button
          type="button"
          size="sm"
          className="h-8 px-3 text-xs font-semibold gap-1.5"
          onClick={handleClone}
          disabled={isCloning}
        >
          {isCloning ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          Clone Template
        </Button>
      </CardFooter>
    </Card>
  );
}
