"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteTrip } from "../actions";
import { Trip } from "../types";

interface DeleteTripDialogProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTripDialog({
  trip,
  open,
  onOpenChange,
}: DeleteTripDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteTrip({ id: trip.id });
      if (res.success) {
        onOpenChange(false);
        router.push("/trips");
        router.refresh();
      } else {
        setError(res.error || "Failed to delete trip");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">Delete Trip</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{trip.title}"</span>? This will permanently remove all associated itineraries, notes, and workspace data. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
            {error}
          </div>
        )}

        <DialogFooter className="sm:justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Delete Trip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
