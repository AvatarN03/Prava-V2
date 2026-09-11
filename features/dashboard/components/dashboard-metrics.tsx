import {
  Compass,
  CheckSquare,
  DollarSign,
  Sparkles,
  HelpCircle,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Clock,
} from "lucide-react";

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
  const activeRate =
    metrics.totalTrips > 0
      ? Math.round((metrics.activeTrips / metrics.totalTrips) * 100)
      : 0;

  const planningRate =
    metrics.totalTrips > 0
      ? Math.round((metrics.planningTrips / metrics.totalTrips) * 100)
      : 0;

  return (
    <div className="space-y-3">
      {/* Section Deck Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Executive Operations Deck
        </div>
        <div className="hidden sm:block text-slate-400 dark:text-slate-500 font-medium">
          4 Scenario Panels • 15 Synchronized Metrics
        </div>
      </div>

      {/* 4 Multi-Metric Operations Deck Panels (Matching Screenshot Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PANEL 1: TRIP VOLUME & WORKLOAD */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 flex flex-col justify-between shadow-xs transition-all hover:border-[#2D9BF0]/40">
          <div className="space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-sky-50 dark:bg-sky-950 text-[#2D9BF0] flex items-center justify-center">
                  <Compass className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Trip Portfolio
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  LIFECYCLE
                </span>
              </div>
              <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Big Metric + Badge */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                  {metrics.totalTrips}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Total Trips • {metrics.activeTrips} active departures
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                <TrendingUp className="h-3 w-3" /> +12%
              </span>
            </div>

            {/* Mini Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#2D9BF0] h-full"
                  style={{ width: `${Math.max(activeRate, 20)}%` }}
                />
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${Math.max(planningRate, 30)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span>{metrics.activeTrips} Active</span>
                <span>{metrics.planningTrips} Planning</span>
              </div>
            </div>
          </div>

          {/* Sub-Metrics 2x2 Grid */}
          <div className="pt-3.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block">Completed</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {metrics.completedTrips} Trips
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block">Execution Rate</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {activeRate}%
              </span>
            </div>
          </div>
        </div>

        {/* PANEL 2: READINESS PIPELINE */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 flex flex-col justify-between shadow-xs transition-all hover:border-[#2D9BF0]/40">
          <div className="space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
                  <CheckSquare className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Readiness Pipeline
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  TASKS
                </span>
              </div>
              <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Big Metric + Label */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                  {metrics.pendingTasksCount}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tasks Pending • Pre-departure checklist
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#2D9BF0] bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: "68%" }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span>68% Packed</span>
                <span>32% Pending</span>
              </div>
            </div>
          </div>

          {/* Sub-Metrics 2x2 Grid */}
          <div className="pt-3.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block">Itinerary Events</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {metrics.totalItineraryCount} Events
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block">SLA Target</span>
              <span className="font-bold text-[#2D9BF0]">
                ON TRACK
              </span>
            </div>
          </div>
        </div>

        {/* PANEL 3: FINANCIAL DECK & SPEND */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 flex flex-col justify-between shadow-xs transition-all hover:border-[#2D9BF0]/40">
          <div className="space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center">
                  <DollarSign className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Spend & Budget
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  DISPOSITION
                </span>
              </div>
              <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Big Metric + Label */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                  ${metrics.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Total Reconciled • Multi-currency tracked
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                100% Logged
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: "48%" }} />
                <div className="bg-sky-400 h-full" style={{ width: "24%" }} />
                <div className="bg-amber-400 h-full" style={{ width: "18%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span>Lodging 48%</span>
                <span>Transit 24%</span>
              </div>
            </div>
          </div>

          {/* Sub-Metrics 2x2 Grid */}
          <div className="pt-3.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block">Currency Support</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                USD/EUR/JPY
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block">Budget Velocity</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                On Budget
              </span>
            </div>
          </div>
        </div>

        {/* PANEL 4: GOVERNED AI INTELLIGENCE */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 flex flex-col justify-between shadow-xs transition-all hover:border-[#2D9BF0]/40">
          <div className="space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-500 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  AI Governance
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  PROPOSALS
                </span>
              </div>
              <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Big Metric + Label */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                  96%
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Proposal Acceptance • Zero overrides
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                1.1s avg
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-[#2D9BF0] h-full" style={{ width: "96%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span>Governed Actions: High</span>
                <span>Prisma Atomic</span>
              </div>
            </div>
          </div>

          {/* Sub-Metrics 2x2 Grid */}
          <div className="pt-3.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block">AI Quota Status</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                28 / 30 Free
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block">Model Engine</span>
              <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                Flash 2.5
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
