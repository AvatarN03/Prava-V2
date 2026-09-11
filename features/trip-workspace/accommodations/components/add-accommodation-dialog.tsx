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
import { createAccommodation } from "../actions";

interface AddAccommodationDialogProps {
  tripId: string;
  trigger?: React.ReactNode;
}

export function AddAccommodationDialog({
  tripId,
  trigger,
}: AddAccommodationDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    type: "Hotel",
    address: "",
    checkIn: "",
    checkOut: "",
    confirmationCode: "",
    contactPhone: "",
    cost: "",
    currency: "USD",
    notes: "",
  });

  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Hotel",
      address: "",
      checkIn: "",
      checkOut: "",
      confirmationCode: "",
      contactPhone: "",
      cost: "",
      currency: "USD",
      notes: "",
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createAccommodation({
        tripId,
        name: formData.name,
        type: formData.type,
        address: formData.address || null,
        checkIn: formData.checkIn || null,
        checkOut: formData.checkOut || null,
        confirmationCode: formData.confirmationCode || null,
        contactPhone: formData.contactPhone || null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        currency: formData.currency,
        notes: formData.notes || null,
      });

      if (res.success) {
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        setError(res.error || "Failed to add accommodation");
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
            Add Stay
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <DialogHeader>
            <DialogTitle>Add Accommodation</DialogTitle>
            <DialogDescription>
              Record your hotel, Airbnb, hostel, or resort booking.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="acc-name">Accommodation Name *</Label>
              <Input
                id="acc-name"
                placeholder="e.g. Park Hyatt Tokyo, Ryokan Gion"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="acc-type">Type</Label>
                <select
                  id="acc-type"
                  className="flex h-9 w-full rounded-sm border border-border bg-background px-3 py-1 text-sm shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={isPending}
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Airbnb / Apartment">Airbnb / Apartment</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Resort">Resort</option>
                  <option value="Ryokan / Traditional">Ryokan / Traditional</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="acc-cost">Total Cost ($)</Label>
                <Input
                  id="acc-cost"
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="acc-checkin">Check-in Date</Label>
                <Input
                  id="acc-checkin"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="acc-checkout">Check-out Date</Label>
                <Input
                  id="acc-checkout"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="acc-address">Address</Label>
              <Input
                id="acc-address"
                placeholder="e.g. 3-7-1-2 Nishishinjuku, Shinjuku City, Tokyo"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="acc-code">Confirmation Code</Label>
                <Input
                  id="acc-code"
                  placeholder="e.g. #HM-982137"
                  value={formData.confirmationCode}
                  onChange={(e) => setFormData({ ...formData, confirmationCode: e.target.value })}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="acc-phone">Contact Phone</Label>
                <Input
                  id="acc-phone"
                  placeholder="e.g. +81 3-5322-1234"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="acc-notes">Notes & Instructions</Label>
              <Textarea
                id="acc-notes"
                placeholder="Key lockbox code, check-in window, amenities..."
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              Save Stay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
