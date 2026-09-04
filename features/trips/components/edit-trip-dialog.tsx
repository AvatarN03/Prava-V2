"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { updateTrip } from "../actions";
import { Trip, TripStatus } from "../types";

interface EditTripDialogProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTripDialog({
  trip,
  open,
  onOpenChange,
}: EditTripDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const formatDateForInput = (d?: Date | string | null) => {
    if (!d) return "";
    const date = new Date(d);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    id: trip.id,
    title: trip.title,
    destination: trip.destination ?? "",
    description: trip.description ?? "",
    startDate: formatDateForInput(trip.startDate),
    endDate: formatDateForInput(trip.endDate),
    status: trip.status as TripStatus,
  });

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  React.useEffect(() => {
    setFormData({
      id: trip.id,
      title: trip.title,
      destination: trip.destination ?? "",
      description: trip.description ?? "",
      startDate: formatDateForInput(trip.startDate),
      endDate: formatDateForInput(trip.endDate),
      status: trip.status as TripStatus,
    });
    setError(null);
    setFieldErrors({});
  }, [trip, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await updateTrip(formData);
      if (res.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to update trip");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Trip Details</DialogTitle>
            <DialogDescription>
              Update the itinerary title, destinations, dates, and trip status.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-title">Trip Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isPending}
              />
              {fieldErrors.title && (
                <p className="text-[11px] text-destructive">{fieldErrors.title[0]}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-destination">Destination</Label>
              <Input
                id="edit-destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                disabled={isPending}
              />
              {fieldErrors.destination && (
                <p className="text-[11px] text-destructive">{fieldErrors.destination[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <DatePicker
                  date={formData.startDate ? new Date(formData.startDate) : null}
                  onDateChange={(d) => {
                    const str = d ? d.toISOString().split("T")[0] : "";
                    setFormData({ ...formData, startDate: str });
                  }}
                  placeholder="Select start date"
                  disabled={isPending}
                  maxDate={formData.endDate ? new Date(formData.endDate) : null}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-endDate">End Date</Label>
                <DatePicker
                  date={formData.endDate ? new Date(formData.endDate) : null}
                  onDateChange={(d) => {
                    const str = d ? d.toISOString().split("T")[0] : "";
                    setFormData({ ...formData, endDate: str });
                  }}
                  placeholder="Select end date"
                  disabled={isPending}
                  minDate={formData.startDate ? new Date(formData.startDate) : null}
                />
              </div>
            </div>
            {fieldErrors.endDate && (
              <p className="text-[11px] text-destructive">{fieldErrors.endDate[0]}</p>
            )}

            <div className="space-y-1">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val as TripStatus })}
                disabled={isPending}
              >
                <SelectTrigger id="edit-status" className="h-10 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-description">Description & Goals</Label>
              <Textarea
                id="edit-description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
