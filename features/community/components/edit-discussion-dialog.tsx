"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Compass, Edit3, Loader2, MapPin, Sparkles, Tag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { ImageUpload } from "@/components/storage/image-upload";
import { updateForumDiscussion } from "@/features/community/forum-actions";
import { FORUM_CATEGORIES } from "@/features/community/forum-data";
import {
  ForumCategory,
  ForumPost,
  UserTripOption,
} from "@/features/community/forum-types";

interface EditDiscussionDialogProps {
  post: ForumPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userTrips?: UserTripOption[];
  onUpdated?: () => void;
}

export function EditDiscussionDialog({
  post,
  open,
  onOpenChange,
  userTrips = [],
  onUpdated,
}: EditDiscussionDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [category, setCategory] = useState<ForumCategory>(post.category);
  const [destination, setDestination] = useState(post.destination || "");
  const [tags, setTags] = useState(post.tags?.join(", ") || "");
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(
    post.coverImageUrl || post.images?.[0] || ""
  );
  const [selectedTripId, setSelectedTripId] = useState<string>(
    post.linkedTrip?.id || "NONE"
  );
  const [isPending, startTransition] = useTransition();

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTitle(post.title);
      setCategory(post.category);
      setDestination(post.destination || "");
      setTags(post.tags?.join(", ") || "");
      setContent(post.content);
      setImageUrl(post.coverImageUrl || post.images?.[0] || "");
      setSelectedTripId(post.linkedTrip?.id || "NONE");
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 5) {
      toast.error("Title must be at least 5 characters.");
      return;
    }
    if (!content.trim() || content.trim().length < 10) {
      toast.error("Please provide at least 10 characters in the description.");
      return;
    }

    const splitTags = tags
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    startTransition(async () => {
      const res = await updateForumDiscussion(post.id, {
        title: title.trim(),
        content: content.trim(),
        category,
        destination: destination.trim() || undefined,
        tags: splitTags,
        linkedTripId: selectedTripId !== "NONE" ? selectedTripId : null,
        coverImageUrl: imageUrl.trim() || undefined,
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
      });

      if (res.success) {
        toast.success("Discussion updated successfully!");
        onOpenChange(false);
        if (onUpdated) onUpdated();
        if (res.slug && res.slug !== post.slug) {
          router.push(`/community/${res.slug}`);
        }
      } else {
        toast.error(res.error || "Failed to update discussion.");
      }
    });
  };

  const selectableCategories = FORUM_CATEGORIES.filter((c) => c.id !== "ALL");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[92vw] sm:w-full sm:max-w-xl h-[80vh] max-h-[80vh] sm:h-auto sm:max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl sm:rounded-lg border-border bg-card text-card-foreground shadow-xl">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 pr-10 border-b border-border shrink-0 text-left bg-card space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Edit3 className="h-4 w-4" />
            </span>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              Edit Discussion
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Update your itinerary question, travel dates, or attached workspace trip.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs h-9 bg-background border-border"
                disabled={isPending}
                required
              />
            </div>

            {/* Category & Destination Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Category
                </Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as ForumCategory)}
                  disabled={isPending}
                >
                  <SelectTrigger className="text-xs h-9 bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {selectableCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs cursor-pointer">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  Destination
                </Label>
                <Input
                  placeholder="e.g., Kyoto, Japan"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="text-xs h-9 bg-background border-border"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Attach Workspace Trip (Real Data) */}
            {userTrips.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-primary" />
                  Attached Trip Workspace
                </Label>
                <Select
                  value={selectedTripId}
                  onValueChange={setSelectedTripId}
                  disabled={isPending}
                >
                  <SelectTrigger className="text-xs h-9 bg-background border-border">
                    <SelectValue placeholder="Choose a trip to link" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="NONE" className="text-xs text-muted-foreground cursor-pointer">
                      No linked trip
                    </SelectItem>
                    {userTrips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id} className="text-xs cursor-pointer">
                        {trip.title} {trip.destination ? `(${trip.destination})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                Tags (Comma-separated)
              </Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="text-xs h-9 bg-background border-border"
                disabled={isPending}
              />
            </div>

            {/* Visual Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Cover / Visual
                </span>
                {imageUrl && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Attached
                  </span>
                )}
              </Label>
              <ImageUpload
                folder="community"
                aspectRatio="banner"
                currentImageUrl={imageUrl || null}
                onUploaded={(url) => setImageUrl(url)}
                onRemoved={() => setImageUrl("")}
                className="w-full"
              />
            </div>

            {/* Content Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Details & Questions <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-xs resize-none bg-background border-border focus-visible:ring-primary"
                disabled={isPending}
                required
              />
            </div>
          </div>

          <DialogFooter className="p-3 sm:px-6 sm:py-3 border-t border-border shrink-0 bg-muted/20 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs cursor-pointer"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
