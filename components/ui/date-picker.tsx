"use client";

import * as React from "react";
import { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  date?: Date | null;
  onDateChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date | null;
  maxDate?: Date | null;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSelect = (selectedDate: Date | null) => {
    if (onDateChange) {
      onDateChange(selectedDate);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDateChange) {
      onDateChange(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full h-10 justify-start text-left font-normal border-input bg-background hover:bg-slate-50 hover:text-foreground text-sm cursor-pointer",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
          <span className="truncate flex-1">
            {date ? formatDate(new Date(date)) : placeholder}
          </span>
          {date && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="ml-1 p-0.5 rounded-full hover:bg-slate-200 text-muted-foreground hover:text-foreground"
              title="Clear date"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-white" align="start">
        <Calendar
          selected={date}
          onSelect={handleSelect}
          minDate={minDate}
          maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  );
}
