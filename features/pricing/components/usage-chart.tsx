"use client";

import { useMemo, useState } from "react";
import { Sparkles, Compass, Info } from "lucide-react";
import { MonthlyHistoryItem } from "../actions";

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

  // Chart dimensions & layout math
  const width = 640;
  const height = 240;
  const padding = { top: 35, right: 25, bottom: 45, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Max scale calculation: maximum of (quota, max actual credits, 10 trips * ratio)
  const maxCredits = useMemo(() => {
    const highestCredit = Math.max(...chronologicalData.map((d) => d.aiCreditsUsed), quota);
    return Math.ceil(highestCredit * 1.1);
  }, [chronologicalData, quota]);

  const maxTrips = useMemo(() => {
    return Math.max(...chronologicalData.map((d) => d.tripsCreated), 5);
  }, [chronologicalData]);

  // Scale functions
  const getYForCredits = (credits: number) => {
    const ratio = Math.min(1, credits / maxCredits);
    return padding.top + chartH - ratio * chartH;
  };

  const getYForTrips = (trips: number) => {
    const ratio = Math.min(1, trips / maxTrips);
    return padding.top + chartH - ratio * chartH;
  };

  const quotaY = getYForCredits(quota);

  const numItems = chronologicalData.length;
  const slotWidth = chartW / Math.max(1, numItems);
  const barWidth = Math.min(22, slotWidth * 0.28);
  const gap = 4;

  const hoveredItem = hoveredIdx !== null ? chronologicalData[hoveredIdx] : null;

  return (
    <div className="rounded-sm border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              Trip Creation & AI Usage Trend
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Correlation between workspace trips created and monthly AI planning credits consumed
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-muted-foreground select-none">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-primary" />
            <span>AI Credits Used</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-slate-400 dark:bg-slate-600" />
            <span>Trips Created</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 border-t border-dashed border-rose-500/80" />
            <span className="text-rose-600 dark:text-rose-400 font-semibold">{quota} Quota Cap</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Surface */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Horizontal Grid Lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top}
            stroke="currentColor"
            strokeOpacity={0.08}
          />
          <line
            x1={padding.left}
            y1={padding.top + chartH / 2}
            x2={width - padding.right}
            y2={padding.top + chartH / 2}
            stroke="currentColor"
            strokeOpacity={0.08}
          />
          <line
            x1={padding.left}
            y1={padding.top + chartH}
            x2={width - padding.right}
            y2={padding.top + chartH}
            stroke="currentColor"
            strokeOpacity={0.15}
          />

          {/* Quota Limit Dashed Line */}
          <line
            x1={padding.left}
            y1={quotaY}
            x2={width - padding.right}
            y2={quotaY}
            stroke="#f43f5e"
            strokeWidth={1.2}
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />
          <text
            x={width - padding.right}
            y={quotaY - 4}
            fill="#f43f5e"
            fontSize="9"
            fontWeight="bold"
            textAnchor="end"
          >
            {quota} Limit
          </text>

          {/* Y-Axis Labels (Left: AI Credits) */}
          <text
            x={padding.left - 8}
            y={padding.top + 3}
            fill="currentColor"
            fontSize="9"
            opacity={0.5}
            textAnchor="end"
          >
            {maxCredits}
          </text>
          <text
            x={padding.left - 8}
            y={padding.top + chartH / 2 + 3}
            fill="currentColor"
            fontSize="9"
            opacity={0.5}
            textAnchor="end"
          >
            {Math.round(maxCredits / 2)}
          </text>
          <text
            x={padding.left - 8}
            y={padding.top + chartH + 3}
            fill="currentColor"
            fontSize="9"
            opacity={0.5}
            textAnchor="end"
          >
            0
          </text>

          {/* Monthly Columns (Bars & Interactions) */}
          {chronologicalData.map((item, idx) => {
            const slotCenterX = padding.left + idx * slotWidth + slotWidth / 2;
            const creditsBarX = slotCenterX - barWidth - gap / 2;
            const tripsBarX = slotCenterX + gap / 2;

            const creditsY = getYForCredits(item.aiCreditsUsed);
            const creditsBarHeight = Math.max(2, padding.top + chartH - creditsY);

            const tripsY = getYForTrips(item.tripsCreated);
            const tripsBarHeight = Math.max(2, padding.top + chartH - tripsY);

            const isCurrentMonth = idx === chronologicalData.length - 1;
            const isHovered = hoveredIdx === idx;
            const isAtQuota = item.aiCreditsUsed >= quota;

            // Short month label e.g. "Sep"
            const shortMonth = item.month.split(" ")[0].slice(0, 3);

            return (
              <g
                key={item.id}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-opacity"
              >
                {/* Column Hover Highlight Backdrop */}
                <rect
                  x={padding.left + idx * slotWidth + 2}
                  y={padding.top}
                  width={slotWidth - 4}
                  height={chartH}
                  fill="currentColor"
                  opacity={isHovered ? 0.05 : 0}
                  rx={2}
                  className="transition-all duration-150"
                />

                {/* AI Credits Bar */}
                <rect
                  x={creditsBarX}
                  y={creditsY}
                  width={barWidth}
                  height={creditsBarHeight}
                  rx={2}
                  fill={
                    isAtQuota
                      ? isHovered
                        ? "#f43f5e"
                        : "#e11d48"
                      : isHovered
                      ? "#38bdf8"
                      : "#0284c7"
                  }
                  className="transition-all duration-200"
                />

                {/* Trips Created Bar */}
                <rect
                  x={tripsBarX}
                  y={tripsY}
                  width={barWidth}
                  height={tripsBarHeight}
                  rx={2}
                  fill={isHovered ? "#94a3b8" : "#64748b"}
                  className="transition-all duration-200"
                />

                {/* Value on top of credits bar if active */}
                {item.aiCreditsUsed > 0 && (
                  <text
                    x={creditsBarX + barWidth / 2}
                    y={creditsY - 4}
                    fill="currentColor"
                    fontSize="9"
                    fontWeight={isHovered ? "bold" : "normal"}
                    opacity={isHovered ? 1 : 0.75}
                    textAnchor="middle"
                  >
                    {item.aiCreditsUsed}
                  </text>
                )}

                {/* X-Axis Month Label */}
                <text
                  x={slotCenterX}
                  y={padding.top + chartH + 18}
                  fill="currentColor"
                  fontSize="10"
                  fontWeight={isCurrentMonth || isHovered ? "bold" : "normal"}
                  opacity={isCurrentMonth || isHovered ? 1 : 0.6}
                  textAnchor="middle"
                >
                  {shortMonth}
                </text>

                {/* Active month dot */}
                {isCurrentMonth && (
                  <circle
                    cx={slotCenterX}
                    cy={padding.top + chartH + 28}
                    r={2}
                    fill="#0284c7"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredItem && (
          <div
            className="absolute z-20 pointer-events-none rounded-xs border border-border bg-popover/95 p-2.5 text-xs text-popover-foreground shadow-md backdrop-blur-xs space-y-1.5 transition-all"
            style={{
              left: `${Math.min(
                75,
                Math.max(
                  15,
                  ((padding.left + (hoveredIdx ?? 0) * slotWidth + slotWidth / 2) / width) * 100
                )
              )}%`,
              top: "10px",
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-1">
              <span className="font-bold text-foreground text-[11px]">{hoveredItem.month}</span>
              <span
                className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-xs border ${
                  hoveredItem.status === "Active Cycle"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {hoveredItem.status}
              </span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  AI Credits Used:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {hoveredItem.aiCreditsUsed} / {quota}
                  {hoveredItem.aiCreditsUsed >= quota && (
                    <span className="ml-1 text-rose-500 font-semibold">(Limit reached)</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Compass className="h-3 w-3 text-slate-400" />
                  Trips Created:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {hoveredItem.tripsCreated} {hoveredItem.tripsCreated === 1 ? "trip" : "trips"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Insight */}
      <div className="flex items-center gap-2 rounded-xs bg-muted/40 p-2.5 text-[11px] text-muted-foreground border border-border/50">
        <Info className="h-3.5 w-3.5 text-primary shrink-0" />
        <span>
          AI credits recharge automatically on the 1st of every month. Each trip workspace consumes
          credits when generating daily schedules, proposing itinerary updates, and recommending activities.
        </span>
      </div>
    </div>
  );
}
