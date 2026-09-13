"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Expense } from "@prisma/client";
import {
  ArrowUpRight,
  ChevronRight,
  Coins,
  CreditCard,
  FolderOpen,
  Loader2,
  Package,
  Plus,
  Shield,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/app-shell/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  createGeneralTravelExpense,
  deleteGeneralTravelExpense,
} from "@/features/trip-workspace/expenses/actions";

const OVERHEAD_CATEGORIES = [
  { value: "GEAR", label: "Travel Gear & Bags", icon: Package, badge: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800" },
  { value: "INSURANCE", label: "Travel Insurance", icon: Shield, badge: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800" },
  { value: "PASSPORT_VISA", label: "Passports & Visas", icon: CreditCard, badge: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800" },
  { value: "SUBSCRIPTION_SIM", label: "SIM Cards & Tech", icon: Coins, badge: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800" },
  { value: "OTHER", label: "General Overhead", icon: Wallet, badge: "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800" },
];

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "AED", "SGD", "CAD", "AUD", "CHF"];

interface TravelFinancialsDialogProps {
  metrics: {
    totalSpend: number;
    tripSpend: number;
    generalSpend: number;
  };
  generalExpenses: Expense[];
  currency?: string;
  trigger?: React.ReactNode;
}

export function TravelFinancialsDialog({
  metrics,
  generalExpenses,
  currency = "INR",
  trigger,
}: TravelFinancialsDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [category, setCategory] = useState("GEAR");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setSelectedCurrency(currency);
    setCategory("GEAR");
    setNotes("");
    setShowAddForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please provide a valid title and positive amount.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createGeneralTravelExpense({
        title: title.trim(),
        amount: numAmount,
        currency: selectedCurrency,
        category,
        notes: notes.trim() || null,
      });

      if (res.success) {
        toast.success("Travel overhead expense recorded.");
        resetForm();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to record expense.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      const res = await deleteGeneralTravelExpense(deletingId);
      if (res.success) {
        toast.success("Overhead expense deleted.");
        setDeletingId(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete expense.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  const deletingItem = generalExpenses.find((e) => e.id === deletingId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button
            type="button"
            className="text-left w-full cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="text-[11px] text-primary hover:underline inline-flex items-center font-medium mt-1">
              Financial Breakdown <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Cross-Trip Travel Financials
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Aggregated spend across all trip workspaces & general travel overheads.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 flex-1 overflow-y-auto pr-1">
          {/* Spend Summary Matrix */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg bg-muted/40 border border-border">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Total Spend
              </span>
              <div className="text-lg font-bold font-mono text-foreground">
                {currency} {metrics.totalSpend.toLocaleString()}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Trip Workspaces
              </span>
              <div className="text-sm font-semibold font-mono text-foreground">
                {currency} {metrics.tripSpend.toLocaleString()}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Travel Gear & Overheads
              </span>
              <div className="text-sm font-semibold font-mono text-foreground">
                {currency} {metrics.generalSpend.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Inline Add Overhead Form */}
          {showAddForm ? (
            <form
              onSubmit={handleCreate}
              className="p-3.5 rounded-lg border border-border bg-card space-y-3"
            >
              <div className="flex items-center justify-between pb-1 border-b border-border/60">
                <span className="text-xs font-semibold text-foreground">
                  Record Travel Overhead / Gear
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="ovh-title" className="text-xs">
                    Item Description <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ovh-title"
                    placeholder="e.g. 40L Travel Backpack, Annual Insurance"
                    className="h-8 text-xs"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="ovh-amount" className="text-xs">
                      Amount <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="ovh-amount"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      className="h-8 text-xs font-mono"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ovh-curr" className="text-xs">
                      Currency
                    </Label>
                    <Select
                      value={selectedCurrency}
                      onValueChange={setSelectedCurrency}
                    >
                      <SelectTrigger id="ovh-curr" className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c} className="text-xs">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="ovh-category" className="text-xs">
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="ovh-category" className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OVERHEAD_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="text-xs">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ovh-notes" className="text-xs">
                    Notes <span className="text-muted-foreground text-[10px]">(Optional)</span>
                  </Label>
                  <Input
                    id="ovh-notes"
                    placeholder="Brand, policy number, or warranty"
                    className="h-8 text-xs"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 text-xs gap-1.5 cursor-pointer font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  Save Overhead Item
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                General Travel Overheads ({generalExpenses.length})
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 cursor-pointer font-medium"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Overhead / Gear
              </Button>
            </div>
          )}

          {/* List of general travel overheads */}
          <div className="space-y-2">
            {generalExpenses.length === 0 ? (
              <div className="p-6 rounded-md border border-dashed text-center text-xs text-muted-foreground">
                No general travel overhead items logged yet. Record global items like travel backpacks, multi-trip insurance, or passport renewals here.
              </div>
            ) : (
              generalExpenses.map((exp) => {
                const catInfo =
                  OVERHEAD_CATEGORIES.find((c) => c.value === exp.category) ||
                  OVERHEAD_CATEGORIES[4];
                return (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-2.5 rounded-md border border-border bg-card/60 hover:bg-card transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 h-4 border ${catInfo.badge}`}
                      >
                        {catInfo.label}
                      </Badge>
                      <span className="font-semibold text-foreground truncate">
                        {exp.title}
                      </span>
                      {exp.notes && (
                        <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
                          — {exp.notes}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-mono font-bold text-foreground">
                        {exp.currency} {exp.amount.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeletingId(exp.id)}
                        className="text-muted-foreground hover:text-destructive cursor-pointer p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>

      {deletingId && (
        <ConfirmDeleteDialog
          open={!!deletingId}
          onOpenChange={(open) => !open && setDeletingId(null)}
          title="Delete Travel Overhead Expense"
          description={`Are you sure you want to delete "${deletingItem?.title || "this expense"}"?`}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </Dialog>
  );
}
