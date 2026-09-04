"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, Pencil, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { ChecklistItem } from "@prisma/client";
import { toggleChecklistItem, deleteChecklistItem } from "../actions";
import { EditTaskDialog } from "./edit-task-dialog";
import { toast } from "sonner";

interface TaskItemProps {
  item: ChecklistItem;
}

export function TaskItem({ item }: TaskItemProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(item.isCompleted);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    startTransition(async () => {
      const res = await toggleChecklistItem({
        id: item.id,
        tripId: item.tripId,
        isCompleted: nextState,
      });
      if (!res.success) {
        setIsCompleted(!nextState); // rollback on error
      } else {
        router.refresh();
      }
    });
  };

  const handleDelete = async () => {
    const res = await deleteChecklistItem({ id: item.id, tripId: item.tripId });
    if (res.success) {
      toast.success("Task deleted.");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete task.");
    }
  };

  return (
    <>
      <div
        className={`group flex items-center justify-between gap-3 p-2.5 rounded-sm border transition-colors ${
          isCompleted
            ? "border-border/50 bg-muted/20 text-muted-foreground"
            : "border-border bg-card hover:border-primary/40 text-foreground"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-xs border transition-colors cursor-pointer ${
              isCompleted
                ? "bg-primary border-primary text-primary-foreground"
                : "border-border bg-background hover:border-primary/60"
            }`}
            aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
          >
            {isCompleted && <Check className="h-3 w-3 stroke-[2.5]" />}
          </button>

          <div className="space-y-0.5 min-w-0">
            <span
              className={`text-xs font-medium leading-normal block ${
                isCompleted ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {item.title}
            </span>

            {item.dueDate && (
              <span className="inline-flex items-center text-[10px] text-muted-foreground">
                <Calendar className="w-2.5 h-2.5 mr-1 text-muted-foreground/70" />
                Due:{" "}
                {new Date(item.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground/50 hover:text-foreground"
            onClick={() => setIsEditOpen(true)}
            title="Edit task"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground/50 hover:text-destructive"
            onClick={() => setIsDeleteOpen(true)}
            title="Delete task"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <EditTaskDialog
        item={item}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete this task?"
        description={`"${item.title}" will be permanently removed. This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </>
  );
}
