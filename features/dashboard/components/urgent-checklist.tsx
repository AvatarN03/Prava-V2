import Link from "next/link";
import { CheckSquare, Calendar, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChecklistItem } from "@prisma/client";

interface UrgentChecklistProps {
  tasks: (ChecklistItem & { tripTitle: string })[];
}

export function UrgentChecklist({ tasks }: UrgentChecklistProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-primary" />
            Preparation Tasks
          </CardTitle>
          <CardDescription className="text-xs">
            Pending tasks across your upcoming trips
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            All checklist items are completed or none created.
          </div>
        ) : (
          tasks.map((task) => (
            <Link
              key={task.id}
              href={`/trips/${task.tripId}/checklist`}
              className="flex items-center justify-between gap-3 p-2.5 rounded-sm border border-border bg-background hover:border-primary/40 hover:bg-accent/30 transition-colors text-xs group"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {task.title}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                  <span className="truncate max-w-[140px] text-foreground/80 font-medium">
                    {task.tripTitle}
                  </span>
                  <span>•</span>
                  <span className="bg-muted px-1.5 py-0.2 rounded-2xs text-[10px]">
                    {task.category}
                  </span>
                </div>
              </div>

              {task.dueDate && (
                <span className="inline-flex items-center text-[10px] text-muted-foreground font-mono shrink-0">
                  <Calendar className="w-3 h-3 mr-1 text-muted-foreground/70" />
                  {new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
