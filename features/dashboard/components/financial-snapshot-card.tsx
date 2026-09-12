import Link from "next/link";

import { ArrowUpRight, DollarSign, PieChart, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

const getCurrencyConfig = (currency: string = "INR") => {
  const code = currency.toUpperCase();
  switch (code) {
    case "INR":
      return { symbol: "₹", locale: "en-IN" };
    case "EUR":
      return { symbol: "€", locale: "de-DE" };
    case "GBP":
      return { symbol: "£", locale: "en-GB" };
    case "JPY":
      return { symbol: "¥", locale: "ja-JP" };
    case "AED":
      return { symbol: "AED ", locale: "en-AE" };
    case "SGD":
      return { symbol: "S$", locale: "en-SG" };
    case "CAD":
      return { symbol: "C$", locale: "en-CA" };
    case "AUD":
      return { symbol: "A$", locale: "en-AU" };
    case "USD":
    default:
      return { symbol: "$", locale: "en-US" };
  }
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
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Financial Snapshot
            </span>
            <h3 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-1.5">
              Trip expenses — {trip.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              {financials.currency} ({currencySymbol})
            </Badge>
            <Link
              href={`/trips/${trip.id}/expenses`}
              className="text-xs text-primary font-medium hover:underline inline-flex items-center"
            >
              View ledger <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-1 space-y-5">
        {/* 3-Column Metrics: Total Spent | Allocated Budget | Remaining */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-md border border-border/70 bg-muted/20">
          <div>
            <div className="text-[11px] font-medium text-muted-foreground">Total Spent</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground mt-0.5">
              {formatAmount(financials.totalSpent)}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-muted-foreground">Allocated Budget</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-muted-foreground mt-0.5">
              {formatAmount(financials.allocatedBudget)}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-muted-foreground">Remaining</div>
            <div
              className={`text-lg sm:text-xl font-bold font-mono mt-0.5 ${
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
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Budget usage</span>
            <span className="text-muted-foreground font-mono">
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs">
              {financials.categoryBreakdown.slice(0, 4).map((cat) => {
                const config =
                  CATEGORY_COLORS[cat.category.toUpperCase()] || CATEGORY_COLORS.OTHER;
                return (
                  <div key={cat.category} className="flex items-center gap-1.5 text-muted-foreground">
                    <span className={`w-2 h-2 rounded-full ${config.bg}`} />
                    <span className="font-medium text-foreground">
                      {formatAmount(cat.amount)}
                    </span>
                    <span>
                      {config.label} ({cat.percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span>No logged expenses yet. Add expenses in the trip workspace.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
