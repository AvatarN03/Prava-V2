"use client";

import { useMemo, useState } from "react";
import { Plus, Calendar, Compass, Clock, DollarSign, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ItineraryCard } from "./itinerary-card";
import { AddItineraryDialog } from "./add-itinerary-dialog";

import { useWorkspaceAi } from "@/features/trip-workspace/context/workspace-ai-context";

import type { ItineraryItem } from "@prisma/client";

interface ItineraryViewProps {
  tripId: string;
  items: ItineraryItem[];
  tripTitle?: string;
  destination?: string | null;
  tripStartDate?: Date | string | null;
  tripEndDate?: Date | string | null;
}

export function ItineraryView({
  tripId,
  items,
  tripTitle,
  destination,
  tripStartDate,
  tripEndDate,
}: ItineraryViewProps) {
  const [selectedDay, setSelectedDay] = useState<number | "ALL">("ALL");
  const { sendAiPrompt } = useWorkspaceAi();

  // Compute total trip days if dates are present
  const tripDurationDays = useMemo(() => {
    if (!tripStartDate || !tripEndDate) return null;
    try {
      const start = new Date(tripStartDate);
      const end = new Date(tripEndDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return null;
    }
  }, [tripStartDate, tripEndDate]);

  const handleKickstartWithAi = () => {
    const dest = destination || tripTitle || "my destination";
    const daysCount = tripDurationDays || 3;
    const prompt = `Please propose a comprehensive, day-by-day starter itinerary for my ${daysCount}-day trip to ${dest}. Organize 2 to 3 well-timed activities per day (morning, afternoon, evening) with estimated start times, recommended durations, and locations. Provide this as a structured itinerary proposal so I can review and add it to my workspace.`;
    sendAiPrompt(prompt);
  };

  // Helper to format date for a day number
  const getDayDateLabel = (dayNum: number) => {
    if (!tripStartDate) return null;
    try {
      const baseDate = new Date(tripStartDate);
      if (isNaN(baseDate.getTime())) return null;
      const targetDate = new Date(baseDate);
      targetDate.setDate(baseDate.getDate() + (dayNum - 1));
      return targetDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  // Group items by day number
  const groupedDays = useMemo(() => {
    const map = new Map<number, ItineraryItem[]>();

    items.forEach((item) => {
      const day = item.dayNumber || 1;
      const list = map.get(day) || [];
      list.push(item);
      map.set(day, list);
    });

    // Sort days
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [items]);

  const daysList = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.dayNumber || 1))).sort((a, b) => a - b);
  }, [items]);

  // Compute daily cost totals
  const dayCosts = useMemo(() => {
    const map = new Map<number, number>();
    items.forEach((item) => {
      if (item.cost && item.cost > 0) {
        const d = item.dayNumber || 1;
        map.set(d, (map.get(d) || 0) + item.cost);
      }
    });
    return map;
  }, [items]);

  const totalCost = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.cost || 0), 0);
  }, [items]);

  if (items.length === 0) {
    const destName = destination || tripTitle || "your destination";

    return (
      <Card className="border-dashed rounded-md bg-card/50">
        <CardHeader className="text-center pt-12 pb-6 px-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 border border-primary/20 shadow-xs">
            <Compass className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            Ready to plan your trip to {destName}?
          </CardTitle>
          <CardDescription className="max-w-md mx-auto text-xs sm:text-sm mt-1.5 text-muted-foreground leading-relaxed">
            Your itinerary is currently empty. You can kickstart a full{" "}
            {tripDurationDays ? `${tripDurationDays}-day ` : ""}day-by-day draft with Ichinose AI, or craft your schedule manually from scratch.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pb-12 px-4 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center">
            <Button
              size="default"
              onClick={handleKickstartWithAi}
              className="w-full sm:w-auto cursor-pointer gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm font-medium transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>
                Kickstart {tripDurationDays ? `${tripDurationDays}-Day ` : ""}with AI
              </span>
            </Button>

            <AddItineraryDialog
              tripId={tripId}
              defaultDayNumber={1}
              trigger={
                <Button
                  variant="outline"
                  size="default"
                  className="w-full sm:w-auto cursor-pointer gap-1.5 hover:bg-accent"
                >
                  <Plus className="w-4 h-4" />
                  <span>Plan Manually</span>
                </Button>
              }
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal border-primary/30 text-primary">
              AI Proposal
            </Badge>
            <span>Generates a structured review proposal • Consumes 1 AI credit</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Day Filter & Add Event Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        {/* Day Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedDay("ALL")}
            className={`px-3 py-1 text-xs rounded-sm font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedDay === "ALL"
                ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <span>All Days</span>
            <span className="text-[10px] opacity-80">({items.length})</span>
          </button>

          {daysList.map((day) => {
            const dateLabel = getDayDateLabel(day);
            const isSelected = selectedDay === day;
            const dayCount = items.filter((i) => (i.dayNumber || 1) === day).length;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1 text-xs rounded-sm font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                    : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span>Day {day}</span>
                {dateLabel && (
                  <span className="text-[10px] opacity-80">• {dateLabel}</span>
                )}
                <span className="text-[10px] opacity-75">({dayCount})</span>
              </button>
            );
          })}
        </div>

        {/* Action Button & Total Cost Chip */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {totalCost > 0 && (
            <div className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-sm border border-border/50">
              <span>Estimated Total:</span>
              <strong className="text-foreground font-mono font-semibold">
                ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </strong>
            </div>
          )}

          <AddItineraryDialog
            tripId={tripId}
            defaultDayNumber={typeof selectedDay === "number" ? selectedDay : 1}
            trigger={
              <Button size="sm" className="h-8 gap-1.5 text-xs font-medium cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                Add Activity
              </Button>
            }
          />
        </div>
      </div>

      {/* Timeline Section by Day */}
      <div className="space-y-8">
        {groupedDays
          .filter(([day]) => selectedDay === "ALL" || selectedDay === day)
          .map(([day, dayItems]) => {
            const dateLabel = getDayDateLabel(day);
            const costForDay = dayCosts.get(day) || 0;

            return (
              <div key={day} className="space-y-3">
                {/* Day Header with Date & Subtotal */}
                <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-xs bg-primary/10 text-primary text-xs font-bold">
                      {day}
                    </span>
                    <h3 className="text-sm font-bold text-foreground">
                      Day {day}
                      {dateLabel && (
                        <span className="font-normal text-muted-foreground ml-2 text-xs">
                          {dateLabel}
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {costForDay > 0 && (
                      <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-xs border border-emerald-500/20">
                        ${costForDay.toFixed(2)} est.
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {dayItems.length} {dayItems.length === 1 ? "activity" : "activities"}
                    </span>
                  </div>
                </div>

                {/* Day Items Timeline List */}
                <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
                  {dayItems.map((item) => (
                    <ItineraryCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
