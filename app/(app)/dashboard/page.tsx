import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { ActiveTripWorkspaceCard } from "@/features/dashboard/components/active-trip-workspace-card";
import { AiAssistantCard } from "@/features/dashboard/components/ai-assistant-card";
import { DashboardEmptyState } from "@/features/dashboard/components/dashboard-empty-state";
import { DashboardMetrics } from "@/features/dashboard/components/dashboard-metrics";
import { DashboardQuickActions } from "@/features/dashboard/components/dashboard-quick-actions";
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {subGreeting}
          </p>
        </div>

        <div className="flex items-center justify-end self-end sm:self-auto gap-2.5">
          <CreateTripDialog
            trigger={
              <Button className="h-10 sm:h-8.5 px-5 sm:px-3.5 py-2.5 sm:py-1.5 rounded-md sm:rounded-sm text-sm sm:text-xs font-semibold gap-1.5 cursor-pointer shadow-xs hover:shadow transition-all active:scale-[0.99] bg-[#2D9BF0] hover:bg-[#2587D3] text-white">
                <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span>Create trip</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Empty State vs Full Workspace */}
      {metrics.totalTrips === 0 ? (
        <div className="space-y-6">
          <DashboardEmptyState />
          <DashboardQuickActions />
        </div>
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

          {/* Quick Actions & Travel Utilities */}
          <DashboardQuickActions />

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
