import {
  Compass,
  LayoutDashboard,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { ActiveTripWorkspaceCard } from "@/features/dashboard/components/active-trip-workspace-card";
import { AiAssistantCard } from "@/features/dashboard/components/ai-assistant-card";
import { DashboardMetrics } from "@/features/dashboard/components/dashboard-metrics";
import { FinancialSnapshotCard } from "@/features/dashboard/components/financial-snapshot-card";
import { RecentTripsList } from "@/features/dashboard/components/recent-trips-list";
import { TravelEssentialsGrid } from "@/features/dashboard/components/travel-essentials-grid";
import { UpcomingTripCard } from "@/features/dashboard/components/upcoming-trip-card";
import { UrgentChecklist } from "@/features/dashboard/components/urgent-checklist";
import { getDashboardSummary } from "@/features/dashboard/queries";
import { CreateTripDialog } from "@/features/trips/components/create-trip-dialog";

export const metadata = {
  title: "Prava Dashboard",
  description: "Cross-trip overview, upcoming schedules, and departure readiness.",
};

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const { user, metrics, upcomingTrip, recentTrips, urgentTasks, generalExpenses } = summary;

  const displayName =
    user?.fullName || (user?.email ? user.email.split("@")[0] : "Traveler");
  const firstName = displayName.split(" ")[0];

  // Dynamic time-aware greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Dynamic journey subtitle
  const subGreeting =
    upcomingTrip && upcomingTrip.countdownDays !== null
      ? `Ready for your next journey? 1 trip starting in ${
          upcomingTrip.countdownDays > 0
            ? `${upcomingTrip.countdownDays} days.`
            : upcomingTrip.countdownDays === 0
            ? "today."
            : `${Math.abs(upcomingTrip.countdownDays)} days ago.`
        }`
      : metrics.totalTrips > 0
      ? `Ready for your next journey? You have ${metrics.totalTrips} ${
          metrics.totalTrips === 1 ? "trip" : "trips"
        } saved in your workspace.`
      : "Ready for your next journey? Start planning your first travel experience.";

  return (
    <div className="space-y-6 pb-10">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <LayoutDashboard className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Prava Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {subGreeting}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <CreateTripDialog
            trigger={
              <Button size="sm" className="gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Create trip</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Empty State vs Full Workspace */}
      {metrics.totalTrips === 0 ? (
        <Card className="border-border bg-card p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Compass className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Trips Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto mb-6">
            Start planning your first travel adventure. Track itineraries, stays, expenses, and notes in one place.
          </p>
          <CreateTripDialog
            trigger={
              <Button className="gap-2 cursor-pointer">
                <Plus className="w-4 h-4" /> Create Your First Trip
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* Hero Section: Upcoming Trip Card (Full Width) */}
          {upcomingTrip && <UpcomingTripCard trip={upcomingTrip} />}

          {/* Main 2-Column Grid (Linear / Notion Productivity Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: My Trips & Financials (7 Columns on desktop) */}
            <div className="lg:col-span-7 space-y-6">
              <RecentTripsList trips={recentTrips} />

              {upcomingTrip && <FinancialSnapshotCard trip={upcomingTrip} />}

              {urgentTasks.length > 0 && <UrgentChecklist tasks={urgentTasks} />}
            </div>

            {/* Right Column: Active Trip Context, Essentials & AI Assist (5 Columns on desktop) */}
            <div className="lg:col-span-5 space-y-6">
              {upcomingTrip && <ActiveTripWorkspaceCard trip={upcomingTrip} />}

              <TravelEssentialsGrid />

              <AiAssistantCard />
            </div>
          </div>

          {/* Bottom Section: Cross-Trip Metrics Overview */}
          <div className="pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Cross-Trip Workspace Overview
            </div>
            <DashboardMetrics
              metrics={metrics}
              generalExpenses={generalExpenses || []}
              currency={user?.defaultCurrency || "INR"}
            />
          </div>
        </>
      )}
    </div>
  );
}
