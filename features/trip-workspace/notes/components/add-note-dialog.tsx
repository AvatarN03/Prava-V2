"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createNote } from "../actions";

interface AddNoteDialogProps {
  tripId: string;
  trigger?: React.ReactNode;
}

export function AddNoteDialog({ tripId, trigger }: AddNoteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    isPinned: false,
  });

  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "General",
      isPinned: false,
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createNote({
        tripId,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        isPinned: formData.isPinned,
      });

      if (res.success) {
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        setError(res.error || "Failed to create note");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Note
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <DialogHeader>
            <DialogTitle>Create Travel Note</DialogTitle>
            <DialogDescription>
              Jot down recommendations, itineraries ideas, reservation codes, or memos.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="note-title">Title *</Label>
              <Input
                id="note-title"
                placeholder="e.g. Recommended Ramen Shops in Shinjuku"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="note-cat">Category</Label>
                <select
                  id="note-cat"
                  className="flex h-9 w-full rounded-sm border border-border bg-background px-3 py-1 text-sm shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={isPending}
                >
                  <option value="General">General</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Emergency / Medical">Emergency / Medical</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="note-pinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="h-4 w-4 rounded-xs border-border text-primary focus:ring-primary cursor-pointer"
                  disabled={isPending}
                />
                <Label htmlFor="note-pinned" className="cursor-pointer">
                  Pin Note to Top
                </Label>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="note-content">Note Content *</Label>
              <Textarea
                id="note-content"
                placeholder="Write your note, tips, contact details..."
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Save Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
