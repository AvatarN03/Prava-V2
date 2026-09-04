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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function ExpenseTracker({ tripId, items }: ExpenseTrackerProps) {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const totalSpent = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.amount, 0);
  }, [items]);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      map.set(item.category, (map.get(item.category) || 0) + item.amount);
    });
    return map;
  }, [items]);

  const topCategory = useMemo(() => {
    let top = "None";
    let max = 0;
    categoryTotals.forEach((val, cat) => {
      if (val > max) {
        max = val;
        top = cat;
      }
    });
    return top;
  }, [categoryTotals]);

  const filteredItems = useMemo(() => {
    if (categoryFilter === "ALL") return items;
    return items.filter((i) => i.category === categoryFilter);
  }, [items, categoryFilter]);

  const handleDelete = async () => {
    if (!deletingExpense) return;
    const res = await deleteExpense({ id: deletingExpense.id, tripId });
    if (res.success) {
      toast.success("Expense deleted.");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete expense.");
    }
  };

  const getCategoryBadge = (cat: string) => {
    const cfg = CAT_CONFIG[cat] || CAT_CONFIG.OTHER;
    return <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>;
  };

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-muted text-muted-foreground mb-3">
            <Receipt className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">No expenses recorded yet</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            Log transportation, dining, tickets, flights, and shopping expenses to monitor your travel budget.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-12">
          <AddExpenseDialog
            tripId={tripId}
            trigger={
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Add First Expense
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-border bg-card">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Total Spent</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-mono text-foreground">
              ${totalSpent.toFixed(2)}
            </div>
            <span className="text-[11px] text-muted-foreground">
              Across {items.length} {items.length === 1 ? "transaction" : "transactions"}
            </span>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Top Spending Category</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-base font-semibold text-foreground truncate">
              {CAT_CONFIG[topCategory]?.label || topCategory}
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              ${(categoryTotals.get(topCategory) || 0).toFixed(2)} total
            </span>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Active Categories</span>
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-base font-semibold text-foreground">
              {categoryTotals.size} of {Object.keys(CAT_CONFIG).length}
            </div>
            <span className="text-[11px] text-muted-foreground">
              Budget distribution active
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Visual Category Breakdown Card */}
      {totalSpent > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="p-4 pb-2 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <PieChart className="w-3.5 h-3.5 text-primary" />
                Spending Breakdown by Category
              </CardTitle>
              <span className="text-[11px] font-mono text-muted-foreground">
                ${totalSpent.toFixed(2)} USD
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {/* Stacked proportion bar */}
            <div className="flex h-2.5 rounded-sm overflow-hidden gap-0.5 bg-muted">
              {Array.from(categoryTotals.entries())
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => {
                  const pct = (amount / totalSpent) * 100;
                  const cfg = CAT_CONFIG[cat] || CAT_CONFIG.OTHER;
                  return (
                    <div
                      key={cat}
                      className={`h-full ${cfg.color} transition-all`}
                      style={{ width: `${pct}%` }}
                      title={`${cfg.label}: $${amount.toFixed(2)} (${pct.toFixed(1)}%)`}
                    />
                  );
                })}
            </div>
            {/* Legend pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {Array.from(categoryTotals.entries())
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => {
                  const cfg = CAT_CONFIG[cat] || CAT_CONFIG.OTHER;
                  const pct = ((amount / totalSpent) * 100).toFixed(1);
                  return (
                    <div
                      key={cat}
                      className="flex items-center gap-1.5 rounded-sm border border-border bg-background px-2.5 py-1 text-[11px] text-foreground font-medium"
                    >
                      <span className={`h-2 w-2 rounded-xs ${cfg.color}`} />
                      <span>{cfg.label}:</span>
                      <span className="font-mono font-semibold">${amount.toFixed(2)}</span>
                      <span className="text-muted-foreground text-[10px]">({pct}%)</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Add Expense Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "FOOD", "TRANSPORT", "ACCOMMODATION", "FLIGHT", "ACTIVITIES", "SHOPPING", "OTHER"] as const).map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs rounded-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            )
          )}
        </div>

        <AddExpenseDialog tripId={tripId} />
      </div>

      {/* Expenses Table Card */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border font-medium">
              <tr>
                <th className="py-2.5 px-3.5">Title</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5">Date</th>
                <th className="py-2.5 px-3.5">Paid By</th>
                <th className="py-2.5 px-3.5 text-right">Amount</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No expenses match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-foreground">{item.title}</div>
                      {item.notes && (
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3.5">{getCategoryBadge(item.category)}</td>
                    <td className="py-3 px-3.5 text-muted-foreground whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-3.5 text-muted-foreground">
                      {item.paidBy || "—"}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                      ${item.amount.toFixed(2)} {item.currency}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editingExpense && (
        <EditExpenseDialog
          item={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => {
            if (!open) setEditingExpense(null);
          }}
        />
      )}

      {deletingExpense && (
        <ConfirmDeleteDialog
          open={!!deletingExpense}
          onOpenChange={(open) => {
            if (!open) setDeletingExpense(null);
          }}
          title="Delete this expense?"
          description={`"${deletingExpense.title}" ($${deletingExpense.amount.toFixed(2)} ${deletingExpense.currency}) will be permanently removed.`}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
