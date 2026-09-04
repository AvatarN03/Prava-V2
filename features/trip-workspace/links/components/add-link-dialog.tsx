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
import { createLink } from "../actions";

interface AddLinkDialogProps {
  tripId: string;
  trigger?: React.ReactNode;
}

export function AddLinkDialog({ tripId, trigger }: AddLinkDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    category: "Guides & Articles",
    description: "",
  });

  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
      category: "Guides & Articles",
      description: "",
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let finalUrl = formData.url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    startTransition(async () => {
      const res = await createLink({
        tripId,
        title: formData.title,
        url: finalUrl,
        category: formData.category,
        description: formData.description || null,
      });

      if (res.success) {
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        setError(res.error || "Failed to add bookmark");
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
            Add Link
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <DialogHeader>
            <DialogTitle>Add Bookmark Link</DialogTitle>
            <DialogDescription>
              Save helpful blog posts, Google Maps pins, tickets, or travel guides.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="link-title">Link Title *</Label>
              <Input
                id="link-title"
                placeholder="e.g. Kyoto 3-Day Walking Guide"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="link-url">URL / Web Address *</Label>
              <Input
                id="link-url"
                placeholder="https://example.com/guide..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="link-category">Category</Label>
              <select
                id="link-category"
                className="flex h-9 w-full rounded-sm border border-border bg-background px-3 py-1 text-sm shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={isPending}
              >
                <option value="Guides & Articles">Guides & Articles</option>
                <option value="Booking & Tickets">Booking & Tickets</option>
                <option value="Maps & Transit">Maps & Transit</option>
                <option value="Food & Reviews">Food & Reviews</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="link-desc">Description (Optional)</Label>
              <Textarea
                id="link-desc"
                placeholder="Key takeaways or why you saved this..."
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Save Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
