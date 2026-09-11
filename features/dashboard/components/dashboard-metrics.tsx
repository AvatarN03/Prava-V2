import Link from "next/link";

import {
  ArrowUpRight,
  Calendar,
  CheckSquare,
  Compass,
  DollarSign,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DashboardMetricsProps {
  metrics: {
    totalTrips: number;
    activeTrips: number;
    planningTrips: number;
    completedTrips: number;
    totalSpend: number;
    pendingTasksCount: number;
    totalItineraryCount: number;
  };
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Trips</span>
            <Compass className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="text-2xl font-bold text-foreground">
            {metrics.totalTrips}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
            <span>
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

      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Budget Spent</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="text-2xl font-bold font-mono text-foreground">
            ${metrics.totalSpend.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Across all travel workspaces
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Scheduled Activities</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="text-2xl font-bold text-foreground">
            {metrics.totalItineraryCount}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Total itinerary events planned
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending Tasks</span>
            <CheckSquare className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="text-2xl font-bold text-foreground">
            {metrics.pendingTasksCount}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Preparation tasks remaining
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
