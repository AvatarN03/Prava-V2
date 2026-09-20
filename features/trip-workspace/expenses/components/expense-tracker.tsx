"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Expense } from "@prisma/client";
import {
  Car,
  CircleHelp,
  Coins,
  Compass,
  Download,
  Filter,
  Hotel,
  MoreHorizontal,
  Pencil,
  PieChart,
  Plane,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  Target,
  Trash2,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/app-shell/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddExpenseDialog } from "./add-expense-dialog";
import { EditExpenseDialog } from "./edit-expense-dialog";

import { SUPPORTED_CURRENCIES } from "@/features/travel-essentials/currency/currency-service";
import { deleteExpense, updateTripBudget } from "../actions";

interface ExpenseTrackerProps {
  tripId: string;
  items: Expense[];
  userCurrency?: string;
  fxRates?: Record<string, number>;
  tripTitle?: string;
  initialBudget?: number | null;
}

const CAT_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    hex: string;
    badgeVariant: "default" | "secondary" | "outline" | "planning" | "active" | "completed" | "archived";
    icon: React.ElementType;
  }
> = {
  FOOD: { label: "Food & Dining", color: "bg-amber-500", hex: "#f59e0b", badgeVariant: "secondary", icon: Utensils },
  TRANSPORT: { label: "Transport", color: "bg-sky-500", hex: "#0ea5e9", badgeVariant: "outline", icon: Car },
  ACCOMMODATION: { label: "Accommodation", color: "bg-violet-500", hex: "#8b5cf6", badgeVariant: "planning", icon: Hotel },
  FLIGHT: { label: "Flights", color: "bg-blue-600", hex: "#2563eb", badgeVariant: "active", icon: Plane },
  ACTIVITIES: { label: "Activities", color: "bg-emerald-500", hex: "#10b981", badgeVariant: "planning", icon: Compass },
  SHOPPING: { label: "Shopping", color: "bg-pink-500", hex: "#ec4899", badgeVariant: "archived", icon: ShoppingBag },
  OTHER: { label: "Other / Misc", color: "bg-slate-400", hex: "#94a3b8", badgeVariant: "secondary", icon: CircleHelp },
};

function getCurrencySymbol(code?: string): string {
  if (!code) return "$";
  const found = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return found?.symbol || code;
}

export function ExpenseTracker({
  tripId,
  items,
  userCurrency = "INR",
  fxRates = {},
  tripTitle = "Trip",
  initialBudget = null,
}: ExpenseTrackerProps) {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [budgetGoal, setBudgetGoal] = useState<number | null>(initialBudget ?? null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const currencySymbol = useMemo(() => getCurrencySymbol(userCurrency), [userCurrency]);

  // Convert an amount in `fromCurrency` to `userCurrency`
  const convertToUserCurrency = (amount: number, fromCurrency: string): number => {
    const cleanFrom = fromCurrency?.toUpperCase() || "USD";
    const cleanUser = userCurrency?.toUpperCase() || "INR";

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

  const sortedCategories = useMemo(() => {
    return Array.from(categoryTotals.entries())
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [categoryTotals]);

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

  // Donut chart segment geometry (radius 64, circumference ~402.12)
  const donutSegments = useMemo(() => {
    if (totalSpentInUserCurrency <= 0) return [];
    const circumference = 2 * Math.PI * 64;
    let accumulated = 0;

    return sortedCategories.map(([cat, amount]) => {
      const pct = amount / totalSpentInUserCurrency;
      const strokeDasharray = `${pct * circumference} ${circumference}`;
      const strokeDashoffset = -accumulated * circumference;
      accumulated += pct;
      const cfg = CAT_CONFIG[cat] || CAT_CONFIG.OTHER;

      return {
        cat,
        label: cfg.label,
        hex: cfg.hex,
        amount,
        pct: pct * 100,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [sortedCategories, totalSpentInUserCurrency]);

  const activeSegment = useMemo(() => {
    if (!activeCategory) return null;
    return donutSegments.find((s) => s.cat === activeCategory) || null;
  }, [activeCategory, donutSegments]);

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

  const handleSetBudget = async () => {
    const cleaned = budgetInput.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Please enter a valid budget amount greater than 0");
      return;
    }

    setIsSavingBudget(true);
    try {
      const res = await updateTripBudget(tripId, parsed);
      if (res?.success) {
        setBudgetGoal(parsed);
        setIsEditingBudget(false);
        toast.success(`Target budget set to ${currencySymbol}${parsed.toLocaleString()}`);
        router.refresh();
      } else {
        toast.error(res?.error || "Failed to update budget");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update budget");
    } finally {
      setIsSavingBudget(false);
    }
  };

  const handleClearBudget = async () => {
    setIsSavingBudget(true);
    try {
      const res = await updateTripBudget(tripId, null);
      if (res.success) {
        setBudgetGoal(null);
        setBudgetInput("");
        setIsEditingBudget(false);
        toast.success("Budget goal removed");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to remove budget");
      }
    } catch {
      toast.error("Failed to remove budget");
    } finally {
      setIsSavingBudget(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Spent in User Currency */}
        <Card className="rounded-sm border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-primary" /> Total Spent
            </span>
            {usedCurrencies.length > 1 && (
              <Badge variant="outline" className="text-[10px] font-mono gap-1 rounded-xs">
                <Coins className="w-2.5 h-2.5 text-primary" />
                {usedCurrencies.join(", ")}
              </Badge>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {currencySymbol}{totalSpentInUserCurrency.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-muted-foreground font-mono">{userCurrency}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Converted from {items.length} logged expense{items.length === 1 ? "" : "s"}
          </p>
        </Card>

        {/* Top Spending Category */}
        <Card className="rounded-sm border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" /> Top Category
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground truncate">
              {topCategory.name}
            </span>
            {topCategory.amount > 0 && (
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                ({currencySymbol}{topCategory.amount.toLocaleString("en-US", { maximumFractionDigits: 0 })})
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
        <Card className="rounded-sm border border-border bg-card p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-primary" /> Budget Goal
            </span>
            <div className="flex items-center gap-2">
              {budgetGoal && !isEditingBudget && (
                <button
                  type="button"
                  onClick={handleClearBudget}
                  disabled={isSavingBudget}
                  className="text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  title="Remove budget goal"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setBudgetInput(budgetGoal ? String(budgetGoal) : "");
                  setIsEditingBudget(!isEditingBudget);
                }}
                className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
              >
                {budgetGoal ? (isEditingBudget ? "Cancel" : "Edit Goal") : "+ Set Goal"}
              </button>
            </div>
          </div>

          {isEditingBudget ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSetBudget();
              }}
              className="mt-2 flex items-center gap-1.5"
            >
              <Input
                type="text"
                inputMode="decimal"
                placeholder="e.g. 2000"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSetBudget();
                  }
                  if (e.key === "Escape") {
                    setIsEditingBudget(false);
                  }
                }}
                autoFocus
                className="h-7 text-xs font-mono rounded-xs"
                disabled={isSavingBudget}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSavingBudget}
                className="h-7 px-2.5 text-xs rounded-xs cursor-pointer shrink-0"
              >
                {isSavingBudget ? "Saving..." : "Save"}
              </Button>
            </form>
          ) : budgetGoal ? (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-foreground font-mono">
                  {currencySymbol}{totalSpentInUserCurrency.toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
                  <span className="text-muted-foreground font-normal font-sans">
                    / {currencySymbol}{budgetGoal.toLocaleString()}
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {Math.min(100, Math.round((totalSpentInUserCurrency / budgetGoal) * 100))}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-xs bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-xs transition-all duration-300 ${
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

      {/* Filter and Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses, notes, payers..."
            className="pl-8.5 h-9 text-xs rounded-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right controls: [Category Filter Select] -> [+ Log Expense] -> [Export CSV] */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Category Dropdown Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-[170px] text-xs rounded-sm bg-background border-border cursor-pointer">
              <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1.5 shrink-0" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="rounded-sm">
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All Categories ({items.length})
              </SelectItem>
              {Object.entries(CAT_CONFIG).map(([catKey, cfg]) => {
                const count = items.filter((i) => i.category === catKey).length;
                return (
                  <SelectItem key={catKey} value={catKey} className="text-xs cursor-pointer">
                    {cfg.label} ({count})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Log Expense Dialog Trigger */}
          <AddExpenseDialog
            tripId={tripId}
            defaultCurrency={userCurrency}
            trigger={
              <Button size="sm" className="h-9 gap-1.5 text-xs font-semibold rounded-sm cursor-pointer shadow-2xs">
                <Plus className="w-3.5 h-3.5" />
                Log Expense
              </Button>
            }
          />

          {/* Export CSV (last) */}
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="h-9 gap-1.5 text-xs font-medium rounded-sm border-border cursor-pointer hover:bg-muted/80"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Expenses Table (Shifted ABOVE the category card, with set height & sticky header) */}
      {filteredItems.length === 0 ? (
        <Card className="rounded-sm border border-dashed p-8 text-center bg-card/50">
          <p className="text-sm font-semibold text-foreground">No expenses found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {items.length === 0
              ? "Start recording dining, transport, stay, and activity receipts."
              : "Try adjusting your search query or category filter."}
          </p>
        </Card>
      ) : (
        <div className="rounded-sm border border-border bg-card shadow-2xs overflow-hidden">
          <div className="max-h-[460px] overflow-y-auto thin-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-xs border-b border-border shadow-2xs">
                <tr className="text-foreground font-semibold">
                  <th className="py-3 px-4 font-semibold text-foreground">Date</th>
                  <th className="py-3 px-3 font-semibold text-foreground">Expense Title</th>
                  <th className="py-3 px-3 font-semibold text-foreground">Category</th>
                  <th className="py-3 px-3 font-semibold text-foreground">Native Amount</th>
                  <th className="py-3 px-3 font-semibold text-foreground">Converted ({userCurrency})</th>
                  <th className="py-3 px-3 font-semibold text-foreground">Paid By</th>
                  <th className="py-3 px-4 font-semibold text-foreground text-right">Actions</th>
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
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* Date - crisp and visible */}
                      <td className="py-3 px-4 whitespace-nowrap text-foreground font-mono font-medium text-xs">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Title & Notes */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground text-sm">{item.title}</div>
                        {item.notes && (
                          <div className="text-xs text-muted-foreground truncate max-w-sm mt-0.5">
                            {item.notes}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge variant={cfg.badgeVariant} className="text-[11px] font-medium rounded-xs px-2 py-0.5">
                          {cfg.label}
                        </Badge>
                      </td>

                      {/* Native Amount - bold, dark text */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-foreground text-sm">
                        {item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                        <span className="text-xs font-semibold text-muted-foreground">{item.currency}</span>
                      </td>

                      {/* Converted in User Preferred Currency */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-foreground">
                        {isDifferentCurrency ? (
                          <span className="font-bold text-foreground text-sm">
                            ≈ {currencySymbol}{convertedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                            <span className="text-[11px] font-medium text-muted-foreground">{userCurrency}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 font-medium">—</span>
                        )}
                      </td>

                      {/* Paid By - clearly visible */}
                      <td className="py-3 px-3 whitespace-nowrap text-foreground font-medium text-xs">
                        {item.paidBy || "Me"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-xs"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-sm">
                            <DropdownMenuItem
                              onClick={() => setEditingExpense(item)}
                              className="cursor-pointer text-xs"
                            >
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              Edit Expense
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingExpense(item)}
                              className="text-destructive focus:text-destructive cursor-pointer text-xs"
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

      {/* Visual Category Distribution Chart (Shifted to the BOTTOM) */}
      <Card className="rounded-sm border border-border bg-card p-5 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" /> Category Distribution & Spend Analysis
            </span>
            <p className="text-xs text-muted-foreground">
              {categoryTotals.size} active categories • All amounts converted to {userCurrency} ({currencySymbol})
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xs">
            No expenditures recorded yet. Log receipts above to visualize spending by category.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: SVG Ring / Donut Chart with Interactive Hover & Tooltip */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
              <div className="relative flex items-center justify-center w-48 h-48">
                {/* Floating Tooltip Pill */}
                {activeSegment && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-popover/95 backdrop-blur-xs text-popover-foreground border border-border px-2.5 py-1 text-xs font-mono font-medium rounded-xs shadow-md pointer-events-none whitespace-nowrap z-20 transition-all flex items-center gap-1.5 animate-in fade-in-50 zoom-in-95">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: activeSegment.hex }} />
                    <span className="font-sans font-semibold text-foreground">{activeSegment.label}:</span>
                    <span>{currencySymbol}{activeSegment.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-muted-foreground font-sans text-[11px]">({activeSegment.pct.toFixed(1)}%)</span>
                  </div>
                )}

                <svg viewBox="0 0 160 160" className="w-44 h-44 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="16"
                    className="text-muted/40"
                  />
                  {donutSegments.map((seg) => {
                    const isHovered = activeCategory === seg.cat;
                    return (
                      <circle
                        key={seg.cat}
                        cx="80"
                        cy="80"
                        r="64"
                        fill="transparent"
                        stroke={seg.hex}
                        strokeWidth={isHovered ? 22 : 16}
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        className="transition-all duration-300 ease-out cursor-pointer"
                        style={{
                          opacity: activeCategory && !isHovered ? 0.35 : 1,
                        }}
                        onMouseEnter={() => setActiveCategory(seg.cat)}
                        onMouseLeave={() => setActiveCategory(null)}
                      >
                        <title>{`${seg.label}: ${currencySymbol}${seg.amount.toFixed(2)} (${seg.pct.toFixed(1)}%)`}</title>
                      </circle>
                    );
                  })}
                </svg>

                {/* Center Dynamic Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4 transition-all">
                  {activeSegment ? (
                    <>
                      <span className="text-xs font-semibold text-foreground truncate max-w-[110px]">
                        {activeSegment.label}
                      </span>
                      <span className="text-lg font-bold font-mono text-foreground leading-tight mt-0.5">
                        {currencySymbol}{activeSegment.amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-primary mt-0.5">
                        {activeSegment.pct.toFixed(1)}% of total
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-bold font-mono text-foreground leading-tight">
                        {currencySymbol}{totalSpentInUserCurrency.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-0.5">
                        Total Spent
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Horizontal Category Breakdown (Linear / Notion Data-Dense Table) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="border border-border/80 bg-background/40 divide-y divide-border/60 rounded-xs overflow-hidden">
                {sortedCategories.map(([cat, amount]) => {
                  const cfg = CAT_CONFIG[cat] || CAT_CONFIG.OTHER;
                  const Icon = cfg.icon;
                  const pct = totalSpentInUserCurrency > 0 ? (amount / totalSpentInUserCurrency) * 100 : 0;
                  const count = items.filter((i) => i.category === cat).length;
                  const isHovered = activeCategory === cat;

                  return (
                    <div
                      key={cat}
                      onMouseEnter={() => setActiveCategory(cat)}
                      onMouseLeave={() => setActiveCategory(null)}
                      className={`py-2.5 px-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isHovered ? "bg-muted/60" : "hover:bg-muted/30"
                      }`}
                    >
                      {/* Left: Icon & Category Label */}
                      <div className="flex items-center gap-2.5 min-w-[140px] shrink-0">
                        <div
                          className="w-5 h-5 rounded-xs flex items-center justify-center shrink-0 text-white shadow-2xs"
                          style={{ backgroundColor: cfg.hex }}
                        >
                          <Icon className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-foreground block truncate">{cfg.label}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {count} {count === 1 ? "expense" : "expenses"}
                          </span>
                        </div>
                      </div>

                      {/* Center: Horizontal Progress Bar */}
                      <div className="flex-1 hidden sm:block mx-3">
                        <div className="h-1.5 w-full bg-muted rounded-none overflow-hidden">
                          <div
                            className="h-full rounded-none transition-all duration-300"
                            style={{ width: `${pct}%`, backgroundColor: cfg.hex }}
                          />
                        </div>
                      </div>

                      {/* Right: Amount and Share */}
                      <div className="flex items-baseline gap-2 shrink-0 text-right">
                        <span className="text-xs font-bold font-mono text-foreground">
                          {currencySymbol}{amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[11px] font-mono font-medium text-muted-foreground w-12 text-right">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Expense Dialog */}
      {editingExpense && (
        <EditExpenseDialog
          item={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
        />
      )}

      {/* Confirm Delete Dialog */}
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
