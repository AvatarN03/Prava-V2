"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateChecklistItem } from "../actions";
import { ChecklistItem } from "@prisma/client";

interface EditTaskDialogProps {
  item: ChecklistItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ item, open, onOpenChange }: EditTaskDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: item.title,
    category: item.category ?? "General",
    dueDate: item.dueDate
      ? new Date(item.dueDate).toISOString().split("T")[0]
      : "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      title: item.title,
      category: item.category ?? "General",
      dueDate: item.dueDate
        ? new Date(item.dueDate).toISOString().split("T")[0]
        : "",
    });
    setError(null);
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await updateChecklistItem({
        id: item.id,
        tripId: item.tripId,
        title: formData.title,
        category: formData.category,
        dueDate: formData.dueDate || null,
        isCompleted: item.isCompleted,
        order: item.order,
      });

      if (res.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to update task");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <DialogHeader>
            <DialogTitle>Edit Checklist Item</DialogTitle>
            <DialogDescription>
              Update task title, category, or due date.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-task-title">Task Title *</Label>
              <Input
                id="edit-task-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-task-cat">Category</Label>
                <select
                  id="edit-task-cat"
                  className="flex h-9 w-full rounded-sm border border-border bg-background px-3 py-1 text-sm shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={isPending}
                >
                  <option value="Packing">Packing</option>
                  <option value="Documents">Documents &amp; Visas</option>
                  <option value="Bookings">Reservations &amp; Tickets</option>
                  <option value="Health">Health &amp; Insurance</option>
                  <option value="General">General To-Do</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-task-due">Due Date</Label>
                <Input
                  id="edit-task-due"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
