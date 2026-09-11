"use client";

import { useState, useTransition, useEffect } from "react";
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
import { updateItineraryItem } from "../actions";
import { ItineraryItem } from "@prisma/client";

interface EditItineraryDialogProps {
  item: ItineraryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditItineraryDialog({
  item,
  open,
  onOpenChange,
}: EditItineraryDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: item.title,
    dayNumber: item.dayNumber || 1,
    time: item.time ?? "",
    location: item.location ?? "",
    category: item.category ?? "Activity",
    cost: item.cost !== null ? String(item.cost) : "",
    description: item.description ?? "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      title: item.title,
      dayNumber: item.dayNumber || 1,
      time: item.time ?? "",
      location: item.location ?? "",
      category: item.category ?? "Activity",
      cost: item.cost !== null ? String(item.cost) : "",
      description: item.description ?? "",
    });
    setError(null);
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await updateItineraryItem({
        id: item.id,
        tripId: item.tripId,
        title: formData.title,
        dayNumber: Number(formData.dayNumber) || 1,
        time: formData.time || null,
        location: formData.location || null,
        category: formData.category || "Activity",
        cost: formData.cost ? parseFloat(formData.cost) : null,
        description: formData.description || null,
        order: item.order,
      });

      if (res.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to update itinerary event");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <DialogHeader>
            <DialogTitle>Edit Itinerary Item</DialogTitle>
            <DialogDescription>
              Update timing, location, or details for this event.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-item-title">Title / Activity *</Label>
              <Input
                id="edit-item-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-item-day">Day #</Label>
                <Input
                  id="edit-item-day"
                  type="number"
                  min={1}
                  value={formData.dayNumber}
                  onChange={(e) => setFormData({ ...formData, dayNumber: parseInt(e.target.value) || 1 })}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-item-time">Time</Label>
                <Input
                  id="edit-item-time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-item-category">Category</Label>
                <select
                  id="edit-item-category"
                  className="flex h-9 w-full rounded-sm border border-border bg-background px-3 py-1 text-sm shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={isPending}
                >
                  <option value="Activity">Activity / Sightseeing</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Transport">Transport / Travel</option>
                  <option value="Tour">Guided Tour</option>
                  <option value="Leisure">Free Time & Leisure</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-item-cost">Estimated Cost ($)</Label>
                <Input
                  id="edit-item-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-item-location">Location / Address</Label>
              <Input
                id="edit-item-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-item-desc">Notes & Details</Label>
              <Textarea
                id="edit-item-desc"
                rows={2}
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
