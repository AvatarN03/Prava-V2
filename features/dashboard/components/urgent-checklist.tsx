import Link from "next/link";
import { Calendar, CheckSquare } from "lucide-react";

import { ChecklistItem } from "@prisma/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UrgentChecklistProps {
  tasks: (ChecklistItem & { tripTitle: string })[];
}

export function UrgentChecklist({ tasks }: UrgentChecklistProps) {
  return (
    <Card className="border-border bg-card shadow-xs rounded-md">
      <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-sans text-sm font-semibold flex items-center gap-1.5 text-foreground">
            <CheckSquare className="w-4 h-4 text-primary" />
            Preparation Tasks
          </CardTitle>
          <CardDescription className="font-sans text-xs text-muted-foreground">
            Pending tasks across your upcoming trips
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-6 font-sans text-xs text-muted-foreground">
            All checklist items are completed or none created.
          </div>
        ) : (
          tasks.map((task) => (
            <Link
              key={task.id}
              href={`/trips/${task.tripId}/checklist`}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xs border border-border bg-background hover:border-primary/40 hover:bg-accent/30 transition-colors text-xs group cursor-pointer"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="font-sans font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {task.title}
                </div>
                <div className="font-sans text-[11px] text-muted-foreground flex items-center gap-2">
                  <span className="font-serif italic truncate max-w-[140px] text-foreground/80 font-normal">
                    {task.tripTitle}
                  </span>
                  <span>•</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded-2xs text-[10px] font-medium text-foreground/70">
                    {task.category}
                  </span>
                </div>
              </div>

              {task.dueDate && (
                <span className="inline-flex items-center font-sans text-[10px] text-muted-foreground tabular-nums shrink-0">
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

export default UrgentChecklist;
