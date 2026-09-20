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
import { DatePicker } from "@/components/ui/date-picker";
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
import { createExpense } from "../actions";
import { ExpenseCategory } from "../schema";

interface AddExpenseDialogProps {
  tripId: string;
  trigger?: React.ReactNode;
  defaultCurrency?: string;
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

export function AddExpenseDialog({ tripId, trigger, defaultCurrency = "INR" }: AddExpenseDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    currency: defaultCurrency || "INR",
    category: "FOOD" as ExpenseCategory,
    date: new Date().toISOString().split("T")[0],
    paidBy: "",
    notes: "",
  });

  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      currency: defaultCurrency || "INR",
      category: "FOOD",
      date: new Date().toISOString().split("T")[0],
      paidBy: "",
      notes: "",
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid expense amount");
      return;
    }

    startTransition(async () => {
      const res = await createExpense({
        tripId,
        title: formData.title.trim(),
        amount: parsedAmount,
        currency: formData.currency,
        category: formData.category,
        date: formData.date || null,
        paidBy: formData.paidBy.trim() || null,
        notes: formData.notes.trim() || null,
      });

      if (res.success) {
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        setError(res.error || "Failed to record expense");
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
            Add Expense
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Record New Expense</DialogTitle>
            <DialogDescription>
              Track spent amount, category, and payment notes.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="exp-title">Expense Title *</Label>
              <Input
                id="exp-title"
                placeholder="e.g. Shinkansen Bullet Train Ticket"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="exp-amount">Amount *</Label>
                <Input
                  id="exp-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(val) => setFormData({ ...formData, currency: val })}
                  disabled={isPending}
                >
                  <SelectTrigger id="exp-currency" className="w-full">
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
                <Label htmlFor="exp-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val as ExpenseCategory })
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="exp-category" className="w-full">
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
                <Label htmlFor="exp-date">Date</Label>
                <DatePicker
                  date={formData.date ? new Date(formData.date + "T00:00:00") : null}
                  onDateChange={(selectedDate) => {
                    if (!selectedDate) {
                      setFormData({ ...formData, date: "" });
                    } else {
                      const yyyy = selectedDate.getFullYear();
                      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
                      const dd = String(selectedDate.getDate()).padStart(2, "0");
                      setFormData({ ...formData, date: `${yyyy}-${mm}-${dd}` });
                    }
                  }}
                  disabled={isPending}
                  placeholder="Select expense date"
                  className="h-9 text-xs rounded-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-paidby">Paid By (Optional)</Label>
              <Input
                id="exp-paidby"
                placeholder="e.g. Credit Card, Cash, Split"
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-notes">Notes</Label>
              <Textarea
                id="exp-notes"
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
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Save Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
