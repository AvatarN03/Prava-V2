"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  Compass,
  FileText,
  Globe,
  Loader2,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { cloneTripTemplate } from "../actions";
import { TemplateTripItem } from "../types";

interface TemplateCardProps {
  trip: TemplateTripItem;
  onPreview: (trip: TemplateTripItem) => void;
}

const DEFAULT_TRIP_COVER =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";

export function TemplateCard({ trip, onPreview }: TemplateCardProps) {
  const router = useRouter();
  const [isCloning, startCloning] = useTransition();

  const handleQuickClone = () => {
    startCloning(async () => {
      const res = await cloneTripTemplate(trip.id);
      if (res.success && res.newTripId) {
        toast.success(`Cloned "${trip.title}" into your workspace!`);
        router.push(`/trips/${res.newTripId}`);
      } else {
        toast.error(res.error || "Failed to clone template.");
      }
    });
  };

  const coverUrl = trip.coverImageUrl || DEFAULT_TRIP_COVER;
  const authorInitials = (trip.author.fullName || trip.author.username || "T")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border border-border bg-card hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-xs rounded-md">
      {/* Cover Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-muted border-b border-border/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={trip.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top-Left Badges: Duration & Destination */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <Badge className="bg-background/90 text-foreground text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs border border-border shadow-xs">
            <Clock className="w-3 h-3 mr-1" />
            {trip.durationDays} {trip.durationDays === 1 ? "Day" : "Days"}
          </Badge>

          {trip.destination && (
            <span className="inline-flex items-center gap-1 rounded-sm bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
              <MapPin className="w-3 h-3 text-primary" /> {trip.destination}
            </span>
          )}
        </div>

        {/* Top-Right: Budget Badge */}
        {trip.metrics.expenseTotal > 0 && (
          <div className="absolute top-2.5 right-2.5">
            <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-xs">
              <Wallet className="w-3 h-3" />
              ~{trip.metrics.expenseTotal.toLocaleString()}{" "}
              {trip.metrics.currency}
            </span>
          </div>
        )}

        {/* Bottom Banner Title Overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white">
          <h3
            onClick={() => onPreview(trip)}
            className="text-base font-bold leading-snug line-clamp-1 drop-shadow-xs group-hover:text-primary transition-colors cursor-pointer"
          >
            {trip.title}
          </h3>
        </div>
      </div>

      {/* Card Content & Details */}
      <CardHeader className="p-4 pb-2 space-y-2.5">
        {/* Creator Attribution */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6 border border-border">
              {trip.author.avatarUrl ? (
                <AvatarImage src={trip.author.avatarUrl} alt={trip.author.fullName || ""} />
              ) : null}
              <AvatarFallback className="text-[10px] font-bold">
                {authorInitials}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-1.5 min-w-0 text-xs">
              {trip.author.username && trip.author.isPublic ? (
                <Link
                  href={`/u/${trip.author.username}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors truncate"
                >
                  {trip.author.fullName || trip.author.username}
                </Link>
              ) : (
                <span className="font-semibold text-foreground truncate">
                  {trip.author.fullName || "Prava Traveler"}
                </span>
              )}
              {trip.author.username && (
                <span className="text-[10px] text-muted-foreground font-mono truncate">
                  @{trip.author.username}
                </span>
              )}
            </div>
          </div>

          {trip.author.isPublic && (
            <Badge variant="secondary" className="text-[9px] px-1 py-0 gap-0.5 shrink-0">
              <Globe className="h-2.5 w-2.5 text-primary" /> Creator
            </Badge>
          )}
        </div>

        {/* Description */}
        {trip.description ? (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {trip.description}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">
            Authentic community travel blueprint ready to clone.
          </p>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0 pb-3 space-y-3 flex-1 flex flex-col justify-between">
        {/* "What's Included" Asset Strip */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <div className="flex items-center gap-1.5 rounded-sm bg-muted/40 px-2 py-1 text-[11px] text-foreground">
            <Calendar className="h-3 w-3 text-primary shrink-0" />
            <span className="font-medium truncate">
              {trip.metrics.activityCount} Activities
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-sm bg-muted/40 px-2 py-1 text-[11px] text-foreground">
            <Compass className="h-3 w-3 text-primary shrink-0" />
            <span className="font-medium truncate">
              {trip.metrics.accommodationCount} Stays
            </span>
          </div>

          {trip.metrics.checklistCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-sm bg-muted/40 px-2 py-1 text-[11px] text-foreground">
              <CheckSquare className="h-3 w-3 text-primary shrink-0" />
              <span className="font-medium truncate">
                {trip.metrics.checklistCount} Packing
              </span>
            </div>
          )}

          {trip.metrics.notesCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-sm bg-muted/40 px-2 py-1 text-[11px] text-foreground">
              <FileText className="h-3 w-3 text-primary shrink-0" />
              <span className="font-medium truncate">
                {trip.metrics.notesCount} Local Tips
              </span>
            </div>
          )}
        </div>

        {/* Cross-Link: Connected Travel Story */}
        {trip.linkedStory && (
          <Link
            href={`/stories/${trip.linkedStory.slug}`}
            className="flex items-center justify-between gap-2 p-2 rounded-sm border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-[11px] text-primary"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span className="font-semibold truncate">
                Story: {trip.linkedStory.title}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider shrink-0">
              Read →
            </span>
          </Link>
        )}
      </CardContent>

      {/* Card Footer Actions */}
      <CardFooter className="border-t border-border/60 p-3 flex items-center gap-2 bg-muted/10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPreview(trip)}
          className="flex-1 h-8 text-xs cursor-pointer border-border hover:border-primary/50"
        >
          Preview Itinerary
        </Button>

        <Button
          size="sm"
          onClick={handleQuickClone}
          disabled={isCloning}
          className="flex-1 h-8 text-xs gap-1.5 shadow-xs cursor-pointer"
        >
          {isCloning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          <span>Clone Plan</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
