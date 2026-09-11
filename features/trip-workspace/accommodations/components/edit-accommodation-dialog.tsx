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
import { updateAccommodation } from "../actions";
import { Accommodation } from "@prisma/client";

interface EditAccommodationDialogProps {
  item: Accommodation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAccommodationDialog({
  item,
  open,
  onOpenChange,
}: EditAccommodationDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const formatDateForInput = (d?: Date | string | null) => {
    if (!d) return "";
    const date = new Date(d);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    name: item.name,
    type: item.type ?? "Hotel",
    address: item.address ?? "",
    checkIn: formatDateForInput(item.checkIn),
    checkOut: formatDateForInput(item.checkOut),
    confirmationCode: item.confirmationCode ?? "",
    contactPhone: item.contactPhone ?? "",
    cost: item.cost !== null ? String(item.cost) : "",
    currency: item.currency ?? "USD",
    notes: item.notes ?? "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      name: item.name,
      type: item.type ?? "Hotel",
      address: item.address ?? "",
      checkIn: formatDateForInput(item.checkIn),
      checkOut: formatDateForInput(item.checkOut),
      confirmationCode: item.confirmationCode ?? "",
      contactPhone: item.contactPhone ?? "",
      cost: item.cost !== null ? String(item.cost) : "",
      currency: item.currency ?? "USD",
      notes: item.notes ?? "",
    });
    setError(null);
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await updateAccommodation({
        id: item.id,
        tripId: item.tripId,
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
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to update accommodation");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <DialogHeader>
            <DialogTitle>Edit Accommodation</DialogTitle>
            <DialogDescription>
              Update booking details, check-in dates, and contact numbers.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-acc-name">Accommodation Name *</Label>
              <Input
                id="edit-acc-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-acc-type">Type</Label>
                <select
                  id="edit-acc-type"
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
                <Label htmlFor="edit-acc-cost">Total Cost ($)</Label>
                <Input
                  id="edit-acc-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-acc-checkin">Check-in Date</Label>
                <Input
                  id="edit-acc-checkin"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-acc-checkout">Check-out Date</Label>
                <Input
                  id="edit-acc-checkout"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-acc-address">Address</Label>
              <Input
                id="edit-acc-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-acc-code">Confirmation Code</Label>
                <Input
                  id="edit-acc-code"
                  value={formData.confirmationCode}
                  onChange={(e) => setFormData({ ...formData, confirmationCode: e.target.value })}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-acc-phone">Contact Phone</Label>
                <Input
                  id="edit-acc-phone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-acc-notes">Notes & Instructions</Label>
              <Textarea
                id="edit-acc-notes"
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
