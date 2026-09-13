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
import { Textarea } from "@/components/ui/textarea";
import { updateLink } from "../actions";
import { Link as PrismaLink } from "@prisma/client";

interface EditLinkDialogProps {
  item: PrismaLink;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLinkDialog({ item, open, onOpenChange }: EditLinkDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: item.title,
    url: item.url,
    category: item.category ?? "Guides & Articles",
    description: item.description ?? "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      title: item.title,
      url: item.url,
      category: item.category ?? "Guides & Articles",
      description: item.description ?? "",
    });
    setError(null);
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let finalUrl = formData.url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    startTransition(async () => {
      const res = await updateLink({
        id: item.id,
        tripId: item.tripId!,
        title: formData.title,
        url: finalUrl,
        category: formData.category,
        description: formData.description || null,
      });

      if (res.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to update link");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>
              Update bookmark title, destination URL, or description.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-link-title">Link Title *</Label>
              <Input
                id="edit-link-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-link-url">URL / Web Address *</Label>
              <Input
                id="edit-link-url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-link-category">Category</Label>
              <select
                id="edit-link-category"
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
              <Label htmlFor="edit-link-desc">Description</Label>
              <Textarea
                id="edit-link-desc"
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
