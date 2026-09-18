"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarProps {
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
  minDate?: Date | null;
  maxDate?: Date | null;
  disabledDates?: (date: Date) => boolean;
  className?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  disabledDates,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return selected ? new Date(selected) : new Date();
  });

  useEffect(() => {
    if (selected) {
      const d = new Date(selected);
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d);
      }
    }
  }, [selected]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Generate Year options: 15 years back to 10 years forward
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = minDate ? new Date(minDate).getFullYear() : currentYear - 15;
    const endYear = maxDate ? new Date(maxDate).getFullYear() : currentYear + 10;
    const list: number[] = [];
    for (let y = startYear; y <= endYear; y++) {
      list.push(y);
    }
    return list;
  }, [minDate, maxDate]);

  // Get total days in current month and first day of week
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Helper to check if two dates are same day
  const isSameDay = (d1: Date | null | undefined, d2: Date) => {
    if (!d1) return false;
    const date1 = new Date(d1);
    return (
      date1.getFullYear() === d2.getFullYear() &&
      date1.getMonth() === d2.getMonth() &&
      date1.getDate() === d2.getDate()
    );
  };

  const isToday = (d: Date) => {
    return isSameDay(new Date(), d);
  };

  const isDateDisabled = (d: Date) => {
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      const target = new Date(d);
      target.setHours(0, 0, 0, 0);
      if (target < min) return true;
    }
    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(23, 59, 59, 999);
      const target = new Date(d);
      target.setHours(0, 0, 0, 0);
      if (target > max) return true;
    }
    if (disabledDates && disabledDates(d)) {
      return true;
    }
    return false;
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day, 12, 0, 0, 0);
    if (isDateDisabled(date)) return;
    if (onSelect) {
      onSelect(date);
    }
  };

  const handleSelectToday = () => {
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
    if (isDateDisabled(todayDate)) return;
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    if (onSelect) {
      onSelect(todayDate);
    }
  };

  return (
    <div className={cn("p-3 select-none w-[296px]", className)}>
      {/* Month & Year Navigation with Quick Dropdowns */}
      <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-border/60 gap-1">
        <button
          type="button"
          onClick={prevMonth}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 cursor-pointer rounded-xs shrink-0"
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5 flex-1 justify-center">
          {/* Quick Month Select */}
          <select
            value={month}
            onChange={(e) => setCurrentMonth(new Date(year, parseInt(e.target.value, 10), 1))}
            className="h-7 text-xs font-semibold text-foreground bg-background hover:bg-accent border border-border/80 rounded-xs px-1.5 py-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx} className="bg-popover text-popover-foreground">
                {name}
              </option>
            ))}
          </select>

          {/* Quick Year Select */}
          <select
            value={year}
            onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value, 10), month, 1))}
            className="h-7 text-xs font-semibold text-foreground bg-background hover:bg-accent border border-border/80 rounded-xs px-1.5 py-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary font-mono shadow-2xs"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-popover text-popover-foreground">
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 cursor-pointer rounded-xs shrink-0"
          )}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 mb-1 text-center">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-[10px] font-medium text-muted-foreground py-1"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty slots for previous month overflow */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8 w-8" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day, 12, 0, 0, 0);
          const isSelected = isSameDay(selected, date);
          const disabled = isDateDisabled(date);
          const today = isToday(date);

          return (
            <button
              key={`day-${day}`}
              type="button"
              disabled={disabled}
              onClick={() => handleDayClick(day)}
              className={cn(
                "h-8 w-8 p-0 text-xs font-normal rounded-xs transition-colors flex items-center justify-center relative cursor-pointer",
                disabled && "text-muted-foreground/40 opacity-40 cursor-not-allowed hover:bg-transparent",
                !disabled && !isSelected && "hover:bg-primary/10 hover:text-primary text-foreground",
                isSelected && "bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-2xs",
                today && !isSelected && "font-bold text-primary border border-primary/40 bg-primary/5"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Quick Action Footer: 1-Click "Today" and "Clear" */}
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/60 text-xs px-0.5">
        <button
          type="button"
          onClick={handleSelectToday}
          className="text-primary hover:underline font-semibold cursor-pointer py-1 px-1.5 rounded-xs hover:bg-primary/10 transition-colors flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Today
        </button>
        {selected && (
          <button
            type="button"
            onClick={() => {
              if (onSelect) onSelect(null);
            }}
            className="text-muted-foreground hover:text-destructive cursor-pointer py-1 px-1.5 rounded-xs hover:bg-muted transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
