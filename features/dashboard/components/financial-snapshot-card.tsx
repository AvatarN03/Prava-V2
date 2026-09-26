import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { getCurrencyConfig } from "@/lib/utils/currency";

import type { UpcomingTripDetails } from "../queries";

interface FinancialSnapshotCardProps {
  trip: UpcomingTripDetails;
}

const CATEGORY_COLORS: Record<string, { bg: string; dot: string; label: string }> = {
  ACCOMMODATION: { bg: "bg-blue-500", dot: "text-blue-500", label: "Stay" },
  TRANSPORT: { bg: "bg-indigo-500", dot: "text-indigo-500", label: "Transit" },
  FLIGHT: { bg: "bg-sky-500", dot: "text-sky-500", label: "Flights" },
  FOOD: { bg: "bg-amber-500", dot: "text-amber-500", label: "Dining" },
  ACTIVITIES: { bg: "bg-emerald-500", dot: "text-emerald-500", label: "Activities" },
  SHOPPING: { bg: "bg-purple-500", dot: "text-purple-500", label: "Shopping" },
  OTHER: { bg: "bg-slate-400", dot: "text-slate-400", label: "Other" },
};

export function FinancialSnapshotCard({ trip }: FinancialSnapshotCardProps) {
  const { financials } = trip;
  const { symbol: currencySymbol, locale } = getCurrencyConfig(financials.currency);

  const formatAmount = (val: number) => {
    return `${currencySymbol}${val.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <Card className="border-border bg-card shadow-xs rounded-md">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 block select-none">
              Financial Snapshot
            </span>
            <h3 className="font-sans text-sm sm:text-base font-semibold tracking-tight text-foreground flex items-center gap-1.5">
              Trip expenses — {trip.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-sans text-xs font-semibold tabular-nums rounded-xs">
              {financials.currency} ({currencySymbol})
            </Badge>
            <Link
              href={`/trips/${trip.id}/expenses`}
              className="font-sans text-xs text-primary font-medium hover:underline inline-flex items-center"
            >
              View ledger <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-1 space-y-5">
        {/* 3-Column Metrics: Total Spent | Allocated Budget | Remaining */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-sm border border-border/70 bg-muted/20">
          <div>
            <div className="font-sans text-[11px] font-medium text-muted-foreground">Total Spent</div>
            <div className="font-sans text-lg sm:text-xl font-semibold tabular-nums text-foreground mt-0.5">
              {formatAmount(financials.totalSpent)}
            </div>
          </div>

          <div>
            <div className="font-sans text-[11px] font-medium text-muted-foreground">Allocated Budget</div>
            <div className="font-sans text-lg sm:text-xl font-semibold tabular-nums text-muted-foreground mt-0.5">
              {formatAmount(financials.allocatedBudget)}
            </div>
          </div>

          <div>
            <div className="font-sans text-[11px] font-medium text-muted-foreground">Remaining</div>
            <div
              className={`font-sans text-lg sm:text-xl font-semibold tabular-nums mt-0.5 ${
                financials.remainingBudget > 0
                  ? "text-primary"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {formatAmount(financials.remainingBudget)}
            </div>
          </div>
        </div>

        {/* Budget Usage Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-sans text-xs">
            <span className="font-medium text-foreground">Budget usage</span>
            <span className="text-muted-foreground tabular-nums">
              {financials.percentUtilized}% utilized
            </span>
          </div>

          {/* If breakdown exists, render multi-segment bar */}
          {financials.categoryBreakdown.length > 0 ? (
            <div className="h-2 w-full flex rounded-full overflow-hidden bg-muted">
              {financials.categoryBreakdown.map((cat) => {
                const config =
                  CATEGORY_COLORS[cat.category.toUpperCase()] || CATEGORY_COLORS.OTHER;
                return (
                  <div
                    key={cat.category}
                    className={`h-full ${config.bg}`}
                    style={{ width: `${Math.max(4, cat.percentage)}%` }}
                    title={`${config.label}: ${formatAmount(cat.amount)} (${cat.percentage}%)`}
                  />
                );
              })}
            </div>
          ) : (
            <Progress value={financials.percentUtilized} className="h-2 rounded-full" />
          )}

          {/* Category Legend Pills */}
          {financials.categoryBreakdown.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 font-sans text-xs">
              {financials.categoryBreakdown.slice(0, 4).map((cat) => {
                const config =
                  CATEGORY_COLORS[cat.category.toUpperCase()] || CATEGORY_COLORS.OTHER;
                return (
                  <div key={cat.category} className="flex items-center gap-1.5 text-muted-foreground">
                    <span className={`w-2 h-2 rounded-full ${config.bg}`} />
                    <span className="font-medium text-foreground tabular-nums">
                      {formatAmount(cat.amount)}
                    </span>
                    <span className="tabular-nums">
                      {config.label} ({cat.percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="font-sans text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span>No logged expenses yet. Add expenses in the trip workspace.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FinancialSnapshotCard;
