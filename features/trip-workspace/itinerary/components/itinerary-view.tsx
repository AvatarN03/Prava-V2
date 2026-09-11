"use client";

import { useMemo, useState } from "react";
import { Plus, Calendar, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ItineraryItem } from "@prisma/client";
import { ItineraryCard } from "./itinerary-card";
import { AddItineraryDialog } from "./add-itinerary-dialog";

interface ItineraryViewProps {
  tripId: string;
  items: ItineraryItem[];
}

export function ItineraryView({ tripId, items }: ItineraryViewProps) {
  const [selectedDay, setSelectedDay] = useState<number | "ALL">("ALL");

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

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">No itinerary activities planned</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            Schedule day-by-day sightseeing, museum visits, reservations, and travel transit.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-12">
          <AddItineraryDialog
            tripId={tripId}
            defaultDayNumber={1}
            trigger={
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Add First Event
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Day Filter & Add Event Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedDay("ALL")}
            className={`px-3.5 py-1.5 text-xs rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer border ${
              selectedDay === "ALL"
                ? "bg-[#2D9BF0] border-[#2D9BF0] text-white shadow-sm shadow-[#2D9BF0]/30"
                : "border-slate-200 text-slate-600 hover:bg-sky-50 hover:border-sky-200"
            }`}
          >
            All Days ({items.length})
          </button>
          {daysList.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 text-xs rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                selectedDay === day
                  ? "bg-[#2D9BF0] border-[#2D9BF0] text-white shadow-sm shadow-[#2D9BF0]/30"
                  : "border-slate-200 text-slate-600 hover:bg-sky-50 hover:border-sky-200"
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>

        <AddItineraryDialog
          tripId={tripId}
          defaultDayNumber={typeof selectedDay === "number" ? selectedDay : 1}
        />
      </div>

      {/* Days Timeline View */}
      <div className="space-y-10">
        {groupedDays
          .filter(([day]) => (selectedDay === "ALL" ? true : day === selectedDay))
          .map(([day, dayItems]) => (
            <div key={day} className="space-y-4">
              {/* Day header badge */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2D9BF0] to-[#1279CE] text-sm font-extrabold text-white shadow-sm shadow-[#2D9BF0]/30 shrink-0">
                  {day}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Day {day}</h3>
                  <span className="text-xs text-slate-500">
                    {dayItems.length} {dayItems.length === 1 ? "activity" : "activities scheduled"}
                  </span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-sky-200/80 to-transparent ml-1" />
                <AddItineraryDialog
                  tripId={tripId}
                  defaultDayNumber={day}
                  trigger={
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-3 text-[11px] font-semibold border-slate-200 hover:bg-sky-50 hover:border-sky-200 gap-1 cursor-pointer rounded-lg shrink-0"
                    >
                      <Plus className="h-3 w-3" />
                      Add to Day {day}
                    </Button>
                  }
                />
              </div>

              {/* Timeline items */}
              <div className="relative space-y-3 pl-12">
                {/* Vertical timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-sky-200 via-slate-200 to-transparent" />

                {dayItems.map((item) => (
                  <ItineraryCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
