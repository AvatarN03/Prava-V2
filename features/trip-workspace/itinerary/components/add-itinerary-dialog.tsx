"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createItineraryItem } from "../actions";

interface AddItineraryDialogProps {
  tripId: string;
  defaultDayNumber?: number;
  trigger?: React.ReactNode;
}

export function AddItineraryDialog({
  tripId,
  defaultDayNumber,
  trigger,
}: AddItineraryDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    dayNumber: defaultDayNumber || 1,
    time: "",
    location: "",
    category: "Activity",
    cost: "",
    description: "",
  });

  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      title: "",
      dayNumber: defaultDayNumber || 1,
      time: "",
      location: "",
      category: "Activity",
      cost: "",
      description: "",
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createItineraryItem({
        tripId,
        title: formData.title,
        dayNumber: Number(formData.dayNumber) || 1,
        time: formData.time || null,
        location: formData.location || null,
        category: formData.category || "Activity",
        cost: formData.cost ? parseFloat(formData.cost) : null,
        description: formData.description || null,
        order: 0,
      });

      if (res.success) {
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        setError(res.error || "Failed to add itinerary event");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Event
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <DialogHeader>
            <DialogTitle>Add Itinerary Item</DialogTitle>
            <DialogDescription>
              Schedule an activity, tour, meal, or transport.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="item-title">Title / Activity *</Label>
              <Input
                id="item-title"
                placeholder="e.g. Visit Fushimi Inari Shrine"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="item-day">Day #</Label>
                <Input
                  id="item-day"
                  type="number"
                  min={1}
                  value={formData.dayNumber}
                  onChange={(e) => setFormData({ ...formData, dayNumber: parseInt(e.target.value) || 1 })}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="item-time">Time (Optional)</Label>
                <Input
                  id="item-time"
                  placeholder="e.g. 09:30 AM"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="item-category">Category</Label>
                <select
                  id="item-category"
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
                <Label htmlFor="item-cost">Estimated Cost ($)</Label>
                <Input
                  id="item-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="item-location">Location / Address</Label>
              <Input
                id="item-location"
                placeholder="e.g. 68 Fukakusa Yabunouchicho, Fushimi Ward"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="item-desc">Notes & Details</Label>
              <Textarea
                id="item-desc"
                placeholder="Tips, booking references, ticket details..."
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
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Save Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
