import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  CheckSquare,
  Compass,
  Wallet,
} from "lucide-react";

import { Expense } from "@prisma/client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TravelFinancialsDialog } from "./travel-financials-dialog";

import { getCurrencyConfig } from "@/lib/utils/currency";

interface DashboardMetricsProps {
  metrics: {
    totalTrips: number;
    activeTrips: number;
    planningTrips: number;
    completedTrips: number;
    totalSpend: number;
    tripSpend?: number;
    generalSpend?: number;
    pendingTasksCount: number;
    totalItineraryCount: number;
  };
  generalExpenses?: Expense[];
  currency?: string;
}

export function DashboardMetrics({
  metrics,
  generalExpenses = [],
  currency = "INR",
}: DashboardMetricsProps) {
  const { symbol, locale } = getCurrencyConfig(currency);

  const formattedSpend = `${symbol}${metrics.totalSpend.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="border-border bg-card shadow-xs rounded-md">
        <CardHeader className="p-4 pb-1">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-medium text-muted-foreground">Trips</span>
            <Compass className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="font-sans text-2xl font-semibold tabular-nums text-foreground">
            {metrics.totalTrips}
          </div>
          <div className="flex items-center justify-between mt-1 font-sans text-[11px] text-muted-foreground">
            <span className="tabular-nums">
              {metrics.activeTrips} active • {metrics.planningTrips} planning
            </span>
            <Link
              href="/trips"
              className="text-primary hover:underline inline-flex items-center font-medium"
            >
              View all <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-xs rounded-md">
        <CardHeader className="p-4 pb-1">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-medium text-muted-foreground">Total Budget Spent</span>
            <Wallet className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="font-sans text-2xl font-semibold tabular-nums text-foreground">
            {formattedSpend}
          </div>
          <div className="mt-1 flex items-center justify-between font-sans text-[11px] text-muted-foreground">
            <TravelFinancialsDialog
              metrics={{
                totalSpend: metrics.totalSpend,
                tripSpend: metrics.tripSpend ?? metrics.totalSpend,
                generalSpend: metrics.generalSpend ?? 0,
              }}
              generalExpenses={generalExpenses}
              currency={currency}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-xs rounded-md">
        <CardHeader className="p-4 pb-1">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-medium text-muted-foreground">Scheduled Activities</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="font-sans text-2xl font-semibold tabular-nums text-foreground">
            {metrics.totalItineraryCount}
          </div>
          <div className="mt-1 font-sans text-[11px] text-muted-foreground">
            Total itinerary events planned
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-xs rounded-md">
        <CardHeader className="p-4 pb-1">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-medium text-muted-foreground">Pending Tasks</span>
            <CheckSquare className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="font-sans text-2xl font-semibold tabular-nums text-foreground">
            {metrics.pendingTasksCount}
          </div>
          <div className="mt-1 font-sans text-[11px] text-muted-foreground">
            Preparation tasks remaining
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardMetrics;
