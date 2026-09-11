import Link from "next/link";

import {
  BookOpen,
  CloudSun,
  Compass,
  DollarSign,
  Languages,
  Map,
  Plus,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DashboardMetrics } from "@/features/dashboard/components/dashboard-metrics";
import { RecentTripsList } from "@/features/dashboard/components/recent-trips-list";
import { UpcomingTripCard } from "@/features/dashboard/components/upcoming-trip-card";
import { UrgentChecklist } from "@/features/dashboard/components/urgent-checklist";
import { getDashboardSummary } from "@/features/dashboard/queries";
import { CreateTripDialog } from "@/features/trips/components/create-trip-dialog";

export const metadata = {
  title: "Dashboard | Prava AI",
  description: "Cross-trip overview, upcoming schedules, and departure readiness.",
};

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const { user, metrics, upcomingTrip, recentTrips, urgentTasks } = summary;

  const displayName =
    user?.fullName || (user?.email ? user.email.split("@")[0] : "Traveler");

  const essentialsTools = [
    { title: "Weather", icon: CloudSun, href: "/travel-essentials" },
    { title: "Currency", icon: DollarSign, href: "/travel-essentials" },
    { title: "Maps", icon: Map, href: "/travel-essentials" },
    { title: "Country Guide", icon: BookOpen, href: "/travel-essentials" },
    { title: "Emergency", icon: ShieldAlert, href: "/travel-essentials" },
    { title: "Language", icon: Languages, href: "/travel-essentials" },
  ];

  return (
    <div className="space-y-6 min-h-[300dvh]">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Here&apos;s a snapshot of your journeys, upcoming plans, and urgent tasks.
          </p>
        </div>

        <CreateTripDialog
          trigger={
            <Button size="sm" className="gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>New Trip</span>
            </Button>
          }
        />
      </div>

      {/* Empty State vs Full Workspace */}
      {metrics.totalTrips === 0 ? (
        <Card className="border-border bg-card p-12 text-center">
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
          {/* 4 Travel Workspace Metric Cards */}
          <DashboardMetrics metrics={metrics} />

          {/* 2-Column Split: Active Plan & Tools (Left) | Recent Trips & Checklist (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-6">
              {upcomingTrip && <UpcomingTripCard trip={upcomingTrip} />}

              {/* Travel Essentials Quick Tools */}
              <Card className="border-border bg-card">
                <CardHeader className="p-4 pb-2 border-b border-border/60">
                  <CardTitle className="text-sm font-semibold">
                    Travel Essentials &amp; Live Utilities
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Contextual tools for active travel planning and foreign travel
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {essentialsTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.title}
                          href={tool.href}
                          className="flex flex-col items-center justify-center p-3 rounded-md border border-border bg-background hover:border-primary/40 hover:bg-accent/40 transition-colors text-center group cursor-pointer"
                        >
                          <Icon className="w-4 h-4 text-primary mb-1.5 group-hover:scale-110 transition-transform" />
                          <span className="text-[11px] font-medium text-foreground">
                            {tool.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <RecentTripsList trips={recentTrips} />
              <UrgentChecklist tasks={urgentTasks} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
