"use client";

import { useMemo, useState } from "react";
import { Sparkles, Info } from "lucide-react";
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
  const padding = { top: 35, right: 35, bottom: 45, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Max scale calculation based on highest actual credits or quota
  const maxCredits = useMemo(() => {
    const highestCredit = Math.max(...chronologicalData.map((d) => d.aiCreditsUsed), quota);
    return Math.ceil(highestCredit * 1.15);
  }, [chronologicalData, quota]);

  // Scale function
  const getYForCredits = (credits: number) => {
    const ratio = Math.min(1, credits / maxCredits);
    return padding.top + chartH - ratio * chartH;
  };

  const quotaY = getYForCredits(quota);
  const numItems = chronologicalData.length;

  // Calculate points for line & scatter plot
  const points = useMemo(() => {
    return chronologicalData.map((item, idx) => {
      const x =
        numItems <= 1
          ? padding.left + chartW / 2
          : padding.left + (idx * chartW) / (numItems - 1);
      const y = getYForCredits(item.aiCreditsUsed);
      return {
        x,
        y,
        item,
        idx,
      };
    });
  }, [chronologicalData, numItems, chartW, maxCredits]);

  // SVG Line Path
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");
  }, [points]);

  // SVG Gradient Area Path
  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const bottomY = padding.top + chartH;
    return `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${bottomY} L ${points[0].x.toFixed(1)} ${bottomY} Z`;
  }, [linePath, points, chartH, padding.top]);

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

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
              AI Credits Usage Trend
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Monthly AI assistant credits consumed across recent billing cycles
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-muted-foreground select-none">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#2D9BF0] ring-2 ring-[#2D9BF0]/30" />
            <span>AI Credits Used</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-3.5 border-t border-dashed border-rose-500/80" />
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
          <defs>
            <linearGradient id="creditsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D9BF0" stopOpacity="0.25" />
              <stop offset="80%" stopColor="#2D9BF0" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#2D9BF0" stopOpacity="0.0" />
            </linearGradient>
          </defs>

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
            strokeOpacity={0.75}
          />
          <text
            x={width - padding.right}
            y={quotaY - 5}
            fill="#f43f5e"
            fontSize="9"
            fontWeight="bold"
            textAnchor="end"
          >
            {quota} Quota Cap
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

          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#creditsAreaGradient)"
              className="transition-all duration-300 pointer-events-none"
            />
          )}

          {/* Connected Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#2D9BF0"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300 pointer-events-none"
            />
          )}

          {/* Hover Vertical Guide */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={padding.top}
              x2={hoveredPoint.x}
              y2={padding.top + chartH}
              stroke="#2D9BF0"
              strokeWidth={1}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              className="pointer-events-none transition-all"
            />
          )}

          {/* Scatter Plot Data Points & Interaction Nodes */}
          {points.map((p) => {
            const isCurrentMonth = p.idx === points.length - 1;
            const isHovered = hoveredIdx === p.idx;
            const isAtQuota = p.item.aiCreditsUsed >= quota;
            const shortMonth = p.item.month.split(" ")[0].slice(0, 3);

            return (
              <g
                key={p.item.id}
                onMouseEnter={() => setHoveredIdx(p.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Generous invisible hover hit area */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={18}
                  fill="transparent"
                />

                {/* Outer Glow Halo on Hover */}
                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={10}
                    fill={isAtQuota ? "#f43f5e" : "#2D9BF0"}
                    opacity={0.25}
                    className="transition-all duration-150 animate-pulse"
                  />
                )}

                {/* Primary Scatter Node */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4.5}
                  fill={isAtQuota ? "#f43f5e" : "#2D9BF0"}
                  stroke="white"
                  strokeWidth={2}
                  className="transition-all duration-150 shadow-sm"
                />

                {/* Value Label above scatter node */}
                {p.item.aiCreditsUsed > 0 && (
                  <text
                    x={p.x}
                    y={p.y - 9}
                    fill="currentColor"
                    fontSize="9.5"
                    fontWeight={isHovered ? "bold" : "600"}
                    opacity={isHovered ? 1 : 0.75}
                    textAnchor="middle"
                    className="transition-opacity"
                  >
                    {p.item.aiCreditsUsed}
                  </text>
                )}

                {/* X-Axis Month Label */}
                <text
                  x={p.x}
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
                    cx={p.x}
                    cy={padding.top + chartH + 28}
                    r={2}
                    fill="#2D9BF0"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none rounded-xs border border-border bg-popover/95 p-2.5 text-xs text-popover-foreground shadow-md backdrop-blur-xs space-y-1.5 transition-all"
            style={{
              left: `${Math.min(
                80,
                Math.max(
                  20,
                  (hoveredPoint.x / width) * 100
                )
              )}%`,
              top: "10px",
              transform: "translateX(-50%)",
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-1">
              <span className="font-bold text-foreground text-[11px]">{hoveredPoint.item.month}</span>
              <span
                className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-xs border ${
                  hoveredPoint.item.status === "Active Cycle"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {hoveredPoint.item.status}
              </span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  AI Credits Used:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {hoveredPoint.item.aiCreditsUsed} / {quota}
                  {hoveredPoint.item.aiCreditsUsed >= quota && (
                    <span className="ml-1 text-rose-500 font-semibold">(Limit reached)</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Cycle Utilization:</span>
                <span className="font-mono font-semibold text-foreground">
                  {Math.min(100, Math.round((hoveredPoint.item.aiCreditsUsed / quota) * 100))}%
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
          AI credits recharge automatically on the 1st of every month ({tierName}). Each trip workspace consumes
          credits when generating daily schedules, proposing itinerary updates, and recommending activities.
        </span>
      </div>
    </div>
  );
}
