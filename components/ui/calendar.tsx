"use client";

import * as React from "react";
import { useState } from "react";
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

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

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

  return (
    <div className={cn("p-3 select-none w-[280px]", className)}>
      {/* Month & Year Navigation */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-border/60">
        <button
          type="button"
          onClick={prevMonth}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 cursor-pointer"
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-xs font-semibold text-foreground">
          {MONTH_NAMES[month]} {year}
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 cursor-pointer"
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
                "h-8 w-8 p-0 text-xs font-normal rounded-md transition-colors flex items-center justify-center relative cursor-pointer",
                disabled && "text-muted-foreground/40 opacity-40 cursor-not-allowed hover:bg-transparent",
                !disabled && !isSelected && "hover:bg-sky-50 hover:text-[#2D9BF0] text-foreground",
                isSelected && "bg-[#2D9BF0] text-white font-semibold hover:bg-[#1279CE] shadow-xs",
                today && !isSelected && "font-bold text-[#2D9BF0] border border-sky-300/80 bg-sky-50/50"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
