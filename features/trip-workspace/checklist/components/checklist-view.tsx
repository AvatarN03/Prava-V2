"use client";

import { useMemo, useState } from "react";
import { Plus, CheckSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChecklistItem } from "@prisma/client";
import { TaskItem } from "./task-item";
import { AddTaskDialog } from "./add-task-dialog";

interface ChecklistViewProps {
  tripId: string;
  items: ChecklistItem[];
}

export function ChecklistView({ tripId, items }: ChecklistViewProps) {
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

  const completedCount = useMemo(() => {
    return items.filter((i) => i.isCompleted).length;
  }, [items]);

  const percentage = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.round((completedCount / items.length) * 100);
  }, [items, completedCount]);

  const groupedCategories = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>();

    const filtered = items.filter((item) => {
      if (filter === "PENDING") return !item.isCompleted;
      if (filter === "COMPLETED") return item.isCompleted;
      return true;
    });

    filtered.forEach((item) => {
      const cat = item.category || "General";
      const list = map.get(cat) || [];
      list.push(item);
      map.set(cat, list);
    });

    return Array.from(map.entries());
  }, [items, filter]);

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <CheckSquare className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">No checklist tasks created</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            Stay on track with packing lists, visa applications, bookings, and pre-departure preparation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-12">
          <AddTaskDialog
            tripId={tripId}
            trigger={
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Add First Task
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border-border bg-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Preparation Progress
            </h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {items.length} tasks completed ({percentage}%)
            </p>
          </div>

          <div className="flex items-center gap-1">
            {(["ALL", "PENDING", "COMPLETED"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 text-xs rounded-sm font-medium transition-colors cursor-pointer ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {f === "ALL" ? "All" : f === "PENDING" ? "To-Do" : "Done"}
              </button>
            ))}
            <AddTaskDialog tripId={tripId} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </Card>

      {/* Grouped Categories */}
      {groupedCategories.length === 0 ? (
        <div className="text-center py-8 rounded-sm border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">No tasks matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupedCategories.map(([category, catItems]) => (
            <div
              key={category}
              className="rounded-sm border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {category} ({catItems.length})
                </h4>
                <AddTaskDialog
                  tripId={tripId}
                  defaultCategory={category}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  }
                />
              </div>

              <div className="space-y-1.5">
                {catItems.map((item) => (
                  <TaskItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
