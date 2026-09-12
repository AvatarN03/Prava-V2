"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  Plus,
  DollarSign,
  TrendingUp,
  CreditCard,
  MoreHorizontal,
  Pencil,
  Trash2,
  PieChart,
  Download,
  Search,
  ArrowUpDown,
  Coins,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/app-shell/confirm-delete-dialog";
import { Expense } from "@prisma/client";
import { toast } from "sonner";
import { deleteExpense } from "../actions";
import { AddExpenseDialog } from "./add-expense-dialog";
import { EditExpenseDialog } from "./edit-expense-dialog";

interface ExpenseTrackerProps {
  tripId: string;
  items: Expense[];
  userCurrency?: string;
  fxRates?: Record<string, number>;
  tripTitle?: string;
}

const CAT_CONFIG: Record<
  string,
  { label: string; color: string; badgeVariant: "default" | "secondary" | "outline" | "planning" | "active" | "completed" | "archived" }
> = {
  FOOD: { label: "Food & Dining", color: "bg-amber-500", badgeVariant: "secondary" },
  TRANSPORT: { label: "Transport", color: "bg-sky-500", badgeVariant: "outline" },
  ACCOMMODATION: { label: "Accommodation", color: "bg-violet-500", badgeVariant: "planning" },
  FLIGHT: { label: "Flights", color: "bg-blue-600", badgeVariant: "active" },
  ACTIVITIES: { label: "Activities", color: "bg-emerald-500", badgeVariant: "planning" },
  SHOPPING: { label: "Shopping", color: "bg-pink-500", badgeVariant: "archived" },
  OTHER: { label: "Other / Misc", color: "bg-slate-400", badgeVariant: "secondary" },
};

export function ExpenseTracker({
  tripId,
  items,
  userCurrency = "USD",
  fxRates = {},
  tripTitle = "Trip",
}: ExpenseTrackerProps) {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [budgetGoal, setBudgetGoal] = useState<number | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  // Convert an amount in `fromCurrency` to `userCurrency`
  const convertToUserCurrency = (amount: number, fromCurrency: string): number => {
    const cleanFrom = fromCurrency?.toUpperCase() || "USD";
    const cleanUser = userCurrency?.toUpperCase() || "USD";

    if (cleanFrom === cleanUser) return amount;
    const rate = fxRates[cleanFrom];
    if (rate && rate > 0) {
      return amount / rate;
    }
    return amount; // fallback if rate unavailable
  };

  // Compute Total Spent strictly converted to user's preferred currency
  const totalSpentInUserCurrency = useMemo(() => {
    return items.reduce((acc, curr) => {
      return acc + convertToUserCurrency(curr.amount, curr.currency);
    }, 0);
  }, [items, userCurrency, fxRates]);

  // Category totals converted to userCurrency
  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const converted = convertToUserCurrency(item.amount, item.currency);
      map.set(item.category, (map.get(item.category) || 0) + converted);
    });
    return map;
  }, [items, userCurrency, fxRates]);

  const topCategory = useMemo(() => {
    let top = "None";
    let max = 0;
    categoryTotals.forEach((val, cat) => {
      if (val > max) {
        max = val;
        top = CAT_CONFIG[cat]?.label || cat;
      }
    });
    return { name: top, amount: max };
  }, [categoryTotals]);

  // Unique currencies used in this trip
  const usedCurrencies = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.currency.toUpperCase())));
  }, [items]);

  // Filtered expenses
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCat = categoryFilter === "ALL" ? true : item.category === categoryFilter;
      const matchesSearch =
        searchQuery === ""
          ? true
          : item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.paidBy && item.paidBy.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [items, categoryFilter, searchQuery]);

  // 1-Click CSV Export
  const handleExportCsv = () => {
    if (items.length === 0) {
      toast.info("No expenses to export.");
      return;
    }

    const headers = ["Date", "Title", "Category", "Amount", "Currency", "Converted Amount", "Home Currency", "Paid By", "Notes"];
    const rows = items.map((item) => {
      const converted = convertToUserCurrency(item.amount, item.currency);
      return [
        new Date(item.date).toISOString().split("T")[0],
        `"${item.title.replace(/"/g, '""')}"`,
        item.category,
        item.amount.toFixed(2),
        item.currency,
        converted.toFixed(2),
        userCurrency,
        `"${(item.paidBy || "").replace(/"/g, '""')}"`,
        `"${(item.notes || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses-${tripTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Expenses exported to CSV!");
  };

  const handleSetBudget = () => {
    const parsed = parseFloat(budgetInput);
    if (!isNaN(parsed) && parsed > 0) {
      setBudgetGoal(parsed);
      setIsEditingBudget(false);
      toast.success(`Target budget set to $${parsed.toLocaleString()}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Spent in User Currency */}
        <Card className="rounded-md border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-primary" /> Total Spent
            </span>
            {usedCurrencies.length > 1 && (
              <Badge variant="outline" className="text-[10px] font-mono gap-1">
                <Coins className="w-2.5 h-2.5 text-primary" />
                {usedCurrencies.join(", ")}
              </Badge>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              ${totalSpentInUserCurrency.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-muted-foreground font-mono">{userCurrency}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Converted from {items.length} logged expense{items.length === 1 ? "" : "s"}
          </p>
        </Card>

        {/* Top Spending Category */}
        <Card className="rounded-md border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" /> Top Category
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground truncate">
              {topCategory.name}
            </span>
            {topCategory.amount > 0 && (
              <span className="text-xs font-mono text-muted-foreground">
                (${topCategory.amount.toFixed(0)})
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {items.length > 0 && totalSpentInUserCurrency > 0
              ? `${Math.round((topCategory.amount / totalSpentInUserCurrency) * 100)}% of total expenditure`
              : "No expenditures recorded"}
          </p>
        </Card>

        {/* Target Budget Meter */}
        <Card className="rounded-md border border-border bg-card p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-primary" /> Budget Goal
            </span>
            <button
              type="button"
              onClick={() => {
                setBudgetInput(budgetGoal ? String(budgetGoal) : "");
                setIsEditingBudget(!isEditingBudget);
              }}
              className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
            >
              {budgetGoal ? "Edit Goal" : "+ Set Goal"}
            </button>
          </div>

          {isEditingBudget ? (
            <div className="mt-2 flex items-center gap-1.5">
              <Input
                type="number"
                placeholder="e.g. 2000"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="h-7 text-xs font-mono"
              />
              <Button size="sm" onClick={handleSetBudget} className="h-7 px-2 text-xs">
                Save
              </Button>
            </div>
          ) : budgetGoal ? (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-foreground font-mono">
                  ${totalSpentInUserCurrency.toFixed(0)}{" "}
                  <span className="text-muted-foreground font-normal font-sans">/ ${budgetGoal.toLocaleString()}</span>
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {Math.min(100, Math.round((totalSpentInUserCurrency / budgetGoal) * 100))}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    totalSpentInUserCurrency > budgetGoal
                      ? "bg-destructive"
                      : totalSpentInUserCurrency >= budgetGoal * 0.85
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, (totalSpentInUserCurrency / budgetGoal) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <span className="text-sm font-medium text-muted-foreground italic">No budget set</span>
              <p className="text-[11px] text-muted-foreground/80 mt-0.5">Set a target budget to track burn rate.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Category Breakdown Bar */}
      {items.length > 0 && (
        <Card className="rounded-md border border-border bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-primary" /> Category Distribution ({userCurrency})
            </span>
            <span className="text-muted-foreground text-[11px]">
              {categoryTotals.size} active categories
            </span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-muted flex overflow-hidden">
            {Array.from(categoryTotals.entries()).map(([cat, amount]) => {
              const pct = totalSpentInUserCurrency > 0 ? (amount / totalSpentInUserCurrency) * 100 : 0;
              if (pct === 0) return null;
              const cfg = CAT_CONFIG[cat] || CAT_CONFIG.OTHER;
              return (
                <div
                  key={cat}
                  style={{ width: `${pct}%` }}
                  className={`${cfg.color} h-full transition-all duration-300`}
                  title={`${cfg.label}: $${amount.toFixed(2)} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-1 text-[11px] text-muted-foreground">
            {Array.from(categoryTotals.entries()).map(([cat, amount]) => {
              const cfg = CAT_CONFIG[cat] || CAT_CONFIG.OTHER;
              const pct = totalSpentInUserCurrency > 0 ? Math.round((amount / totalSpentInUserCurrency) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${cfg.color}`} />
                  <span>{cfg.label}:</span>
                  <strong className="text-foreground font-mono">${amount.toFixed(0)}</strong>
                  <span className="text-muted-foreground/70 text-[10px]">({pct}%)</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Filter and Action Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses, notes, payers..."
              className="pl-8.5 h-9 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Export CSV & Add Expense Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                Export CSV
              </Button>
            )}

            <AddExpenseDialog
              tripId={tripId}
              defaultCurrency={userCurrency}
              trigger={
                <Button size="sm" className="h-8 gap-1.5 text-xs font-medium cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  Log Expense
                </Button>
              }
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {["ALL", ...Object.keys(CAT_CONFIG)].map((catKey) => {
            const isAll = catKey === "ALL";
            const label = isAll ? "All Categories" : CAT_CONFIG[catKey]?.label || catKey;
            const count = isAll ? items.length : items.filter((i) => i.category === catKey).length;
            const isActive = categoryFilter === catKey;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategoryFilter(catKey)}
                className={`px-3 py-1 rounded-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-xs ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses Table */}
      {filteredItems.length === 0 ? (
        <Card className="rounded-md border border-dashed p-8 text-center">
          <p className="text-sm font-semibold text-foreground">No expenses found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {items.length === 0
              ? "Start recording dining, transport, stay, and activity receipts."
              : "Try adjusting your search query or category filter."}
          </p>
        </Card>
      ) : (
        <div className="rounded-md border border-border bg-card shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-4 font-medium">Date</th>
                  <th className="py-2.5 px-3 font-medium">Expense Title</th>
                  <th className="py-2.5 px-3 font-medium">Category</th>
                  <th className="py-2.5 px-3 font-medium">Native Amount</th>
                  <th className="py-2.5 px-3 font-medium">Converted ({userCurrency})</th>
                  <th className="py-2.5 px-3 font-medium">Paid By</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredItems.map((item) => {
                  const cfg = CAT_CONFIG[item.category] || CAT_CONFIG.OTHER;
                  const convertedAmount = convertToUserCurrency(item.amount, item.currency);
                  const isDifferentCurrency = item.currency.toUpperCase() !== userCurrency.toUpperCase();

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Title & Notes */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground">{item.title}</div>
                        {item.notes && (
                          <div className="text-[11px] text-muted-foreground truncate max-w-xs mt-0.5">
                            {item.notes}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge variant={cfg.badgeVariant} className="text-[10px]">
                          {cfg.label}
                        </Badge>
                      </td>

                      {/* Native Amount */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-semibold text-foreground">
                        {item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                        <span className="text-[10px] text-muted-foreground">{item.currency}</span>
                      </td>

                      {/* Converted in User Preferred Currency */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-muted-foreground">
                        {isDifferentCurrency ? (
                          <span className="font-semibold text-foreground">
                            ≈ ${convertedAmount.toFixed(2)}{" "}
                            <span className="text-[10px] text-muted-foreground/80">{userCurrency}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Paid By */}
                      <td className="py-3 px-3 whitespace-nowrap text-muted-foreground text-[11px]">
                        {item.paidBy || "Me"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setEditingExpense(item)}
                              className="cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              Edit Expense
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingExpense(item)}
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Delete Expense
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingExpense && (
        <EditExpenseDialog
          item={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
        />
      )}

      {deletingExpense && (
        <ConfirmDeleteDialog
          open={!!deletingExpense}
          onOpenChange={(open) => !open && setDeletingExpense(null)}
          title="Delete Expense Record"
          description={`Are you sure you want to delete "${deletingExpense.title}"?`}
          onConfirm={async () => {
            await deleteExpense({ id: deletingExpense.id, tripId });
            setDeletingExpense(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
