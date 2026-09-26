"use client";

import { useMemo, useState } from "react";

import { BarChart3, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { MonthlyHistoryItem } from "../actions";

interface UsageChartProps {
  history: MonthlyHistoryItem[];
  quota: number;
  tierName: string;
}

export function UsageChart({ history, quota, tierName }: UsageChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Chronological order (oldest to newest: left to right)
  const chronologicalData = useMemo(() => {
    return [...history].reverse();
  }, [history]);

  // Aggregate stats across the 6-month window
  const stats = useMemo(() => {
    const totalCredits = chronologicalData.reduce(
      (sum, d) => sum + (d.aiCreditsUsed || 0),
      0
    );
    const avgCredits = Math.round(totalCredits / (chronologicalData.length || 1));
    return { totalCredits, avgCredits };
  }, [chronologicalData]);

  return (
    <div className="rounded-md border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-4 font-sans">
      {/* ── Header & KPI Summaries ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            <h3 className="font-sans text-sm sm:text-base font-semibold tracking-tight text-foreground">
              AI Credit Expense (6 Months)
            </h3>
          </div>
          <p className="font-sans text-[11px] text-muted-foreground mt-0.5">
            Credit consumption and quota utilization across your recent 6 billing cycles
          </p>
        </div>

        {/* Aggregate KPI Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-muted/60 border border-border/80 text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">6-Mo Total:</span>
            <span className="font-sans font-semibold tabular-nums text-foreground">
              {stats.totalCredits} Credits
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-muted/60 border border-border/80 text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Monthly Avg:</span>
            <span className="font-sans font-semibold tabular-nums text-foreground">
              {stats.avgCredits} / mo
            </span>
          </div>
        </div>
      </div>

      {/* ── 6-Month Discrete Bar Chart ── */}
      <div className="relative pt-2 pb-1">
        <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-40 sm:h-44 px-1 sm:px-3">
          {chronologicalData.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const isCurrentCycle = item.status === "Active Cycle";
            const isProCycle = item.plan.toLowerCase().includes("pro");
            const used = item.aiCreditsUsed;
            const cycleQuota = item.aiCreditsQuota || 30;
            const pct = Math.min(100, Math.round((used / cycleQuota) * 100));

            // Extract readable short month: e.g. "Sep" from "Sep 2026" or "Sep 15"
            const shortMonth = item.month.split(" ")[0].slice(0, 3);

            // Bar fill height (minimum 3% or 4px so 0 credits still shows a clean grounded baseline indicator)
            const fillHeightPct = used === 0 ? 0 : Math.max(8, pct);

            return (
              <div
                key={item.id}
                className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Value Label above Bar */}
                <div className="mb-1.5 text-center">
                  <span
                    className={`font-sans text-xs tabular-nums transition-colors ${
                      isHovered
                        ? "font-bold text-primary"
                        : isCurrentCycle
                          ? "font-semibold text-foreground"
                          : "font-medium text-muted-foreground"
                    }`}
                  >
                    {used}
                  </span>
                  <span className="hidden sm:inline text-[10px] text-muted-foreground/60 block -mt-0.5 tabular-nums">
                    / {cycleQuota}
                  </span>
                </div>

                {/* Vertical Bar Track Container */}
                <div
                  className={`w-full max-w-[38px] sm:max-w-[48px] h-24 sm:h-28 rounded-xs bg-muted/40 border transition-all duration-200 relative overflow-hidden flex flex-col justify-end ${
                    isHovered
                      ? "border-primary/60 bg-muted/70 ring-2 ring-primary/20 shadow-xs"
                      : isCurrentCycle
                        ? "border-primary/40 bg-muted/50"
                        : "border-border/60 hover:border-border"
                  }`}
                >
                  {/* Quota Reference Line (at 100% capacity) */}
                  <div className="absolute top-0 inset-x-0 h-px bg-border/80 border-t border-dashed border-border/80" />

                  {/* Dynamic Progress Bar Fill */}
                  <div
                    className={`w-full transition-all duration-300 rounded-t-2xs ${
                      used === 0
                        ? "h-1 bg-muted-foreground/20"
                        : pct >= 100
                          ? "bg-rose-600"
                          : pct > 75
                            ? "bg-amber-500"
                            : isCurrentCycle
                              ? "bg-[#2D9BF0]"
                              : "bg-[#2D9BF0]/80 dark:bg-[#2D9BF0]/70"
                    } ${isHovered ? "brightness-110" : ""}`}
                    style={{ height: used === 0 ? "3px" : `${fillHeightPct}%` }}
                  />
                </div>

                {/* Month Label & Active Indicator */}
                <div className="mt-2 text-center flex flex-col items-center gap-0.5">
                  <span
                    className={`text-[11px] transition-colors ${
                      isCurrentCycle
                        ? "font-semibold text-foreground"
                        : isHovered
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {shortMonth}
                  </span>
                  {isCurrentCycle ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-primary uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[9px] text-muted-foreground/60 hidden sm:inline">
                      {isProCycle ? "Pro" : "Free"}
                    </span>
                  )}
                </div>

                {/* Floating Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-16 z-30 pointer-events-none rounded-sm border border-border/80 bg-popover/98 p-2.5 text-xs text-popover-foreground shadow-lg backdrop-blur-xs whitespace-nowrap min-w-[140px] text-left animate-in fade-in-50 zoom-in-95 font-sans">
                    <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-1 mb-1">
                      <span className="font-semibold text-[11px] text-foreground">
                        {item.month}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1 py-0 h-4 rounded-xs ${
                          isProCycle
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 font-semibold"
                            : "border-border/80 text-muted-foreground font-normal"
                        }`}
                      >
                        {isProCycle ? "Pro" : "Free"}
                      </Badge>
                    </div>
                    <div className="space-y-0.5 text-[10px]">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Period:</span>
                        <span className="font-medium text-foreground tabular-nums">{item.period}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Credits Used:</span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {used} / {cycleQuota} ({pct}%)
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Remaining:</span>
                        <span className="font-medium tabular-nums text-foreground">
                          {item.aiCreditsRemaining}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer Insight & Legend ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-sm bg-muted/40 p-2.5 text-[11px] text-muted-foreground border border-border/60">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>
            Discrete AI credit expenses across recent 6 monthly cycles. Current tier:{" "}
            <strong className="text-foreground font-semibold">{tierName}</strong> ({quota} credits/mo).
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 select-none text-[10px]">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-2xs bg-[#2D9BF0]" />
            <span>Used</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-2xs bg-muted-foreground/30 border border-border/80" />
            <span>Capacity</span>
          </div>
        </div>
      </div>
    </div>
  );
}

