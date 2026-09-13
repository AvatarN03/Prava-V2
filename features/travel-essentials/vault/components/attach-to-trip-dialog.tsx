"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Link as PrismaLink } from "@prisma/client";
import { Check, Compass, FolderPlus, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { attachVaultLinkToTrip, getUserTripOptions } from "../actions";

interface AttachToTripDialogProps {
  item: PrismaLink;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TripOption {
  id: string;
  title: string;
  destination: string | null;
  status: string;
}

export function AttachToTripDialog({
  item,
  open,
  onOpenChange,
}: AttachToTripDialogProps) {
  const router = useRouter();
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoadingTrips(true);
      getUserTripOptions()
        .then((res) => {
          if (res.success && res.data) {
            setTrips(res.data);
            if (res.data.length > 0) {
              setSelectedTripId(res.data[0].id);
            }
          }
        })
        .finally(() => setIsLoadingTrips(false));
    }
  }, [open]);

  const handleAttach = async () => {
    if (!selectedTripId) {
      toast.error("Please select a trip destination.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await attachVaultLinkToTrip({
        linkId: item.id,
        tripId: selectedTripId,
      });

      if (res.success) {
        toast.success(`Attached "${item.title}" to ${res.tripTitle || "trip"}!`);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to attach link to trip.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold">
                Attach to Trip Workspace
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Copy this saved bookmark directly into an active trip itinerary.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-w-0 space-y-4 py-3">
          <div className="min-w-0 overflow-hidden rounded-md border border-border/60 bg-muted/40 p-2.5 text-xs">
            <div className="min-w-0 truncate font-semibold text-foreground">{item.title}</div>
            <div
              className="min-w-0 truncate text-[11px] text-muted-foreground mt-0.5"
              title={item.url}
            >
              {item.url}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Select Trip Workspace
            </label>
            {isLoadingTrips ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                Loading your trips...
              </div>
            ) : trips.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2">
                No active or planning trips found. Create a trip first in Trips.
              </div>
            ) : (
              <Select value={selectedTripId} onValueChange={setSelectedTripId}>
                <SelectTrigger className="h-9 text-xs cursor-pointer">
                  <SelectValue placeholder="Choose a trip..." />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs cursor-pointer">
                      <div className="flex items-center gap-2 min-w-0">
                        <Compass className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium truncate">{t.title}</span>
                        {t.destination && (
                          <span className="text-muted-foreground text-[10px] shrink-0">
                            ({t.destination})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="text-xs gap-1.5 cursor-pointer font-medium"
            disabled={isSubmitting || trips.length === 0 || !selectedTripId}
            onClick={handleAttach}
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Attach to Trip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
