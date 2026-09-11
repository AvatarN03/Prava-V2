"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ListTodo,
  CheckSquare,
  Copy,
  Loader2,
  DollarSign,
  Globe,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommunityTripItem } from "../types";
import { cloneTripTemplate } from "../actions";

interface TripPreviewDialogProps {
  trip: CommunityTripItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TripPreviewDialog({ trip, open, onOpenChange }: TripPreviewDialogProps) {
  const router = useRouter();
  const [isCloning, startCloning] = useTransition();

  if (!trip) return null;

  const handleClone = () => {
    startCloning(async () => {
      const res = await cloneTripTemplate(trip.id);
      if (res.success && res.tripId) {
        onOpenChange(false);
        router.push(`/trips/${res.tripId}/overview`);
      } else {
        alert(res.error || "Failed to clone template. Please try again.");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-0">
        {/* Cover Image Banner */}
        {trip.coverImageUrl && (
          <div className="relative h-36 w-full overflow-hidden rounded-t-lg bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trip.coverImageUrl}
              alt={trip.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}

        <DialogHeader className="p-6 pb-3 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="planning">{trip.category}</Badge>
            <span className="text-xs text-muted-foreground">
              {trip.durationDays} Days
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground pt-1">
            {trip.title}
          </DialogTitle>
          {trip.destination && (
            <DialogDescription className="flex items-center text-xs pt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
              {trip.destination}
              {trip.estimatedBudget && (
                <span className="ml-3 inline-flex items-center text-muted-foreground">
                  <DollarSign className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
                  Budget: {trip.estimatedBudget}
                </span>
              )}
            </DialogDescription>
          )}

          {/* Creator Attribution */}
          <div className="flex items-center gap-2 pt-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted overflow-hidden text-[10px] font-bold text-muted-foreground shrink-0">
              {trip.authorAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trip.authorAvatarUrl}
                  alt={trip.authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                getAuthorInitials()
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Created by</span>
              {trip.authorUsername && trip.isCreatorPublic ? (
                <Link
                  href={`/u/${trip.authorUsername}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  @{trip.authorUsername}
                </Link>
              ) : (
                <span className="font-semibold text-foreground">{trip.authorName}</span>
              )}
              {trip.isCreatorPublic && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 gap-0.5">
                  <Globe className="h-2.5 w-2.5 text-primary" /> Public Creator
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Itinerary & Tips Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {trip.description && (
            <p className="text-muted-foreground leading-relaxed">
              {trip.description}
            </p>
          )}

          {/* Day by Day Schedule */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5 text-primary" />
              Day-by-Day Itinerary ({trip.itineraryPreview.length} Events)
            </h4>

            <div className="space-y-2">
              {trip.itineraryPreview.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-sm border border-border bg-background space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      Day {item.day}: {item.title}
                    </span>
                    {item.category && (
                      <Badge variant="secondary" className="text-[10px]">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-muted-foreground leading-relaxed text-[11px]">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Packing & Preparation Highlights */}
          {trip.packingHighlights && trip.packingHighlights.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-primary" />
                Included Packing Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {trip.packingHighlights.map((task, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-sm bg-muted/40 text-[11px] text-foreground flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="truncate">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 border-t border-border bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isCloning}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleClone}
            disabled={isCloning}
            className="gap-1.5"
          >
            {isCloning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Use this Itinerary Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
