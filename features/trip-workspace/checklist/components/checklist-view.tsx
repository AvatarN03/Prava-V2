"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckSquare, Sparkles, Loader2, CheckCircle2, ListFilter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChecklistItem } from "@prisma/client";
import { TaskItem } from "./task-item";
import { AddTaskDialog } from "./add-task-dialog";
import { seedEssentialChecklist } from "../actions";

interface ChecklistViewProps {
  tripId: string;
  items: ChecklistItem[];
}

export function ChecklistView({ tripId, items }: ChecklistViewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");
  const [isSeeding, startSeeding] = useTransition();

  const completedCount = useMemo(() => {
    return items.filter((i) => i.isCompleted).length;
  }, [items]);

  const pendingCount = items.length - completedCount;

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

  const handleSeedEssentials = () => {
    startSeeding(async () => {
      const res = await seedEssentialChecklist(tripId);
      if (res.success) {
        toast.success(`Added ${res.count} essential travel tasks!`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to add starter checklist");
      }
    });
  };

  if (items.length === 0) {
    return (
      <Card className="border-dashed rounded-md">
        <CardHeader className="text-center py-14">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary mb-3">
            <CheckSquare className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-bold">No checklist tasks created</CardTitle>
          <CardDescription className="max-w-md mx-auto text-xs mt-1">
            Stay on track with packing lists, visa applications, bookings, and pre-departure preparation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-14">
          <AddTaskDialog
            tripId={tripId}
            trigger={
              <Button size="sm" className="cursor-pointer gap-1.5">
                <Plus className="w-4 h-4" />
                Add Custom Task
              </Button>
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedEssentials}
            disabled={isSeeding}
            className="cursor-pointer gap-1.5 border-primary/40 hover:bg-primary/5 text-primary"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Add Essential Travel Checklist
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header Card */}
      <Card className="rounded-md border border-border bg-card p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Preparation Progress
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount} of {items.length} tasks completed ({percentage}%)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedEssentials}
              disabled={isSeeding}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary cursor-pointer"
            >
              {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
              <span>+ Travel Essentials</span>
            </Button>

            <AddTaskDialog
              tripId={tripId}
              trigger={
                <Button size="sm" className="h-8 gap-1.5 text-xs cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </Button>
              }
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              percentage === 100
                ? "bg-emerald-500"
                : percentage >= 50
                ? "bg-primary"
                : "bg-sky-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-1 text-xs">
          {[
            { label: "All Tasks", value: "ALL" as const, count: items.length },
            { label: "To Do", value: "PENDING" as const, count: pendingCount },
            { label: "Completed", value: "COMPLETED" as const, count: completedCount },
          ].map(({ label, value, count }) => {
            const isActive = filter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`px-3 py-1 rounded-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Categorized Tasks Groups */}
      <div className="space-y-6">
        {groupedCategories.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground rounded-md border border-dashed p-6">
            No {filter === "PENDING" ? "pending" : "completed"} tasks found in this view.
          </div>
        ) : (
          groupedCategories.map(([category, catItems]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-border/60">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {category} ({catItems.length})
                </h4>
                <span className="text-[11px] text-muted-foreground">
                  {catItems.filter((i) => i.isCompleted).length}/{catItems.length} done
                </span>
              </div>

              <div className="space-y-1.5">
                {catItems.map((item) => (
                  <TaskItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
