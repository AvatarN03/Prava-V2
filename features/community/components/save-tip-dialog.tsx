"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { Bookmark, Compass, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { saveForumTipToTripNote } from "@/features/community/forum-actions";
import { UserTripOption } from "@/features/community/forum-types";

interface SaveTipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipContent: string;
  sourceTitle: string;
  authorName: string;
  userTrips: UserTripOption[];
}

export function SaveTipDialog({
  open,
  onOpenChange,
  tipContent,
  sourceTitle,
  authorName,
  userTrips,
}: SaveTipDialogProps) {
  const [selectedTripId, setSelectedTripId] = useState<string>(
    userTrips[0]?.id || ""
  );
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!selectedTripId) {
      toast.error("Please select a trip workspace.");
      return;
    }

    startTransition(async () => {
      const res = await saveForumTipToTripNote({
        tripId: selectedTripId,
        tipContent,
        sourceTitle,
        authorName,
      });

      if (res.success) {
        toast.success(`Saved tip to "${res.tripTitle}" Notes!`);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to save tip.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-lg border-border bg-card text-card-foreground shadow-lg">
        <DialogHeader className="space-y-1 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bookmark className="h-4 w-4" />
            </span>
            <DialogTitle className="text-base font-bold text-foreground">
              Save Advice to Trip Workspace
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Inject this community recommendation directly into your personal trip notes so you can reference it on the road.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tip Excerpt */}
          <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Advice Preview
            </span>
            <p className="text-xs text-foreground line-clamp-3 italic">
              &ldquo;{tipContent}&rdquo;
            </p>
            <span className="text-[10px] text-muted-foreground block pt-0.5">
              — Shared by @{authorName}
            </span>
          </div>

          {/* Select Target Trip */}
          {userTrips.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                You don&apos;t have any active trip workspaces yet.
              </p>
              <Link href="/trips">
                <Button size="sm" variant="outline" className="text-xs">
                  Create a Trip First
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-primary" />
                Select Workspace Trip
              </Label>
              <Select
                value={selectedTripId}
                onValueChange={setSelectedTripId}
                disabled={isPending}
              >
                <SelectTrigger className="text-xs h-9 bg-background border-border">
                  <SelectValue placeholder="Choose a trip" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {userTrips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id} className="text-xs cursor-pointer">
                      {trip.title} {trip.destination ? `(${trip.destination})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isPending || userTrips.length === 0}
            className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
            Save to Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
