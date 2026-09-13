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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateExpense } from "../actions";
import { Expense } from "@prisma/client";
import { ExpenseCategory } from "../schema";

interface EditExpenseDialogProps {
  item: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "FOOD", label: "Food & Dining" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "ACCOMMODATION", label: "Accommodation" },
  { value: "FLIGHT", label: "Flights" },
  { value: "ACTIVITIES", label: "Activities / Sightseeing" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "OTHER", label: "Other / Misc" },
];

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "JPY", label: "JPY (¥)" },
  { value: "INR", label: "INR (₹)" },
  { value: "AUD", label: "AUD ($)" },
  { value: "CAD", label: "CAD ($)" },
  { value: "CHF", label: "CHF (Fr)" },
];

export function EditExpenseDialog({
  item,
  open,
  onOpenChange,
}: EditExpenseDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const formatDateForInput = (d?: Date | string | null) => {
    if (!d) return "";
    const date = new Date(d);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    title: item.title,
    amount: String(item.amount),
    currency: item.currency ?? "USD",
    category: (item.category as ExpenseCategory) || "OTHER",
    date: formatDateForInput(item.date),
    paidBy: item.paidBy ?? "",
    notes: item.notes ?? "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      title: item.title,
      amount: String(item.amount),
      currency: item.currency ?? "USD",
      category: (item.category as ExpenseCategory) || "OTHER",
      date: formatDateForInput(item.date),
      paidBy: item.paidBy ?? "",
      notes: item.notes ?? "",
    });
    setError(null);
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid expense amount");
      return;
    }

    startTransition(async () => {
      const res = await updateExpense({
        id: item.id,
        tripId: item.tripId!,
        title: formData.title.trim(),
        amount: parsedAmount,
        currency: formData.currency,
        category: formData.category,
        date: formData.date || null,
        paidBy: formData.paidBy.trim() || null,
        notes: formData.notes.trim() || null,
      });

      if (res.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to update expense");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Modify expense record details, category, or payment notes.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="edit-exp-title">Expense Title *</Label>
              <Input
                id="edit-exp-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-exp-amount">Amount *</Label>
                <Input
                  id="edit-exp-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-exp-currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(val) => setFormData({ ...formData, currency: val })}
                  disabled={isPending}
                >
                  <SelectTrigger id="edit-exp-currency" className="w-full">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-exp-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val as ExpenseCategory })
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="edit-exp-category" className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-exp-date">Date</Label>
                <Input
                  id="edit-exp-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-exp-paidby">Paid By</Label>
              <Input
                id="edit-exp-paidby"
                placeholder="e.g. Credit Card, Cash, Split"
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-exp-notes">Notes</Label>
              <Textarea
                id="edit-exp-notes"
                placeholder="Receipt details, split calculations, or memos..."
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
