import Link from "next/link";

import {
  BookOpen,
  CloudSun,
  Compass,
  DollarSign,
  Info,
  Languages,
  Map,
  Plus,
  RotateCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DashboardMetrics } from "@/features/dashboard/components/dashboard-metrics";
import { TripsOperationsTable } from "@/features/dashboard/components/trips-operations-table";
import { UpcomingTripCard } from "@/features/dashboard/components/upcoming-trip-card";
import { UrgentChecklist } from "@/features/dashboard/components/urgent-checklist";
import { getDashboardSummary } from "@/features/dashboard/queries";
import { CreateTripDialog } from "@/features/trips/components/create-trip-dialog";

export const metadata = {
  title: "Dashboard | Prava AI",
  description:
    "Executive operations deck, cross-trip overview, upcoming schedules, and departure readiness.",
};

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const { user, metrics, upcomingTrip, urgentTasks, allTrips } = summary;

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

  const nowFormatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE HEADER (Directly Modeled on Screenshot Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-start gap-3.5">
          {/* 3D-styled Icon Badge */}
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2D9BF0] via-[#43ABF8] to-[#1279CE] text-white shadow-md shadow-[#2D9BF0]/25 p-2">
            <Compass className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Travel Operations Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monitor trip logistics, track live itineraries, manage travel
              readiness, and govern AI actions.
            </p>
          </div>
        </div>

        {/* Right Header Controls: Timestamp & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden md:inline-block">
            Last updated {nowFormatted}
          </span>

          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-semibold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-[#2D9BF0] cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              <span>Sync Data</span>
            </Button>
          </Link>

          <CreateTripDialog
            trigger={
              <Button
                size="sm"
                className="h-9 gap-1.5 text-xs font-semibold bg-[#2D9BF0] hover:bg-[#1D8BE0] text-white shadow-sm shadow-[#2D9BF0]/30 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Trip</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* 2. INFORMATIONAL OPERATIONAL BANNER (Matching Blue Banner in Screenshot) */}
      <div className="flex items-center gap-2.5 rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/40 px-3.5 py-2.5 text-xs text-sky-900 dark:text-sky-300">
        <Info className="h-4 w-4 text-[#2D9BF0] shrink-0" />
        <span className="leading-relaxed">
          <strong className="font-semibold">Workspace-First Operations:</strong>{" "}
          All core trip workflows operate manually with durable PostgreSQL
          persistence. AI assists with governed suggestions and structured mutation
          proposals.
        </span>
      </div>

      {/* 3. EXECUTIVE OPERATIONS DECK (4 Multi-Metric Scenario Panels) */}
      <DashboardMetrics metrics={metrics} />

      {/* 4. OPERATIONS DATA TABLE & FILTER TABS (Matching Screenshot Table) */}
      <TripsOperationsTable trips={allTrips} />

      {/* 5. ACTIVE TRIP DETAILS & URGENT PREPARATIONS (Bottom 2-Column Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Featured Upcoming Trip (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {upcomingTrip ? (
            <UpcomingTripCard trip={upcomingTrip} />
          ) : (
            <Card className="border-border bg-card p-6 text-center text-xs text-muted-foreground">
              No active or upcoming trips scheduled.
            </Card>
          )}

          {/* Travel Essentials Quick Tools */}
          <Card className="border-border bg-card">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <CardTitle className="text-sm font-semibold">
                Travel Essentials & Live Utilities
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
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-[#2D9BF0]/50 hover:bg-sky-50/40 dark:hover:bg-slate-800 transition-colors text-center group cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-[#2D9BF0] mb-1.5 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                        {tool.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Urgent Checklist Items */}
        <div className="space-y-6">
          <UrgentChecklist tasks={urgentTasks} />
        </div>
      </div>
    </div>
  );
}
