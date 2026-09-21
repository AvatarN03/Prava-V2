"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Compass,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Sparkles,
  Tag,
} from "lucide-react";
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
import { createForumDiscussion } from "@/features/community/forum-actions";
import { FORUM_CATEGORIES } from "@/features/community/forum-data";
import {
  ForumCategory,
  UserTripOption,
} from "@/features/community/forum-types";

interface NewDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userTrips?: UserTripOption[];
  onDiscussionCreated?: () => void;
}

export function NewDiscussionDialog({
  open,
  onOpenChange,
  userTrips = [],
  onDiscussionCreated,
}: NewDiscussionDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ForumCategory>("ROUTE_ADVICE");
  const [destination, setDestination] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [selectedTripId, setSelectedTripId] = useState<string>("NONE");
  const [imageUrl, setImageUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a discussion title.");
      return;
    }
    if (title.trim().length < 5) {
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
      const res = await createForumDiscussion({
        title: title.trim(),
        content: content.trim(),
        category,
        destination: destination.trim() || undefined,
        tags: splitTags.length > 0 ? splitTags : ["CommunityAdvice"],
        linkedTripId: selectedTripId !== "NONE" ? selectedTripId : null,
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
        coverImageUrl: imageUrl.trim() || undefined,
      });

      if (res.success) {
        toast.success("Discussion topic published to the Community Forum!");
        onOpenChange(false);
        setTitle("");
        setContent("");
        setDestination("");
        setTags("");
        setImageUrl("");
        setSelectedTripId("NONE");

        // Refresh Next.js server components and invoke local callback
        router.refresh();
        if (onDiscussionCreated) {
          onDiscussionCreated();
        }
      } else {
        toast.error(res.error || "Failed to publish discussion. Please sign in.");
      }
    });
  };

  const selectableCategories = FORUM_CATEGORIES.filter((c) => c.id !== "ALL");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-[80vw] sm:w-full sm:max-w-xl h-[80vh] max-h-[80vh] sm:h-auto sm:max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl sm:rounded-lg border-border bg-card text-card-foreground shadow-xl">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 pr-10 border-b border-border shrink-0 text-left bg-card space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <MessageSquare className="h-4 w-4" />
            </span>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              Start a Community Discussion
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Ask for route advice, share hidden culinary gems, get packing feedback, or share live conditions with fellow travelers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="post-title" className="text-xs font-semibold text-foreground">
                Discussion Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="post-title"
                placeholder="e.g., Kyoto 7-Day Route: Is pacing realistic for peak foliage?"
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
                <Label htmlFor="post-category" className="text-xs font-semibold text-foreground">
                  Category
                </Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as ForumCategory)}
                  disabled={isPending}
                >
                  <SelectTrigger id="post-category" className="text-xs h-9 bg-background border-border">
                    <SelectValue placeholder="Select a topic" />
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
                <Label htmlFor="post-dest" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  Destination (Optional)
                </Label>
                <Input
                  id="post-dest"
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
                <Label htmlFor="post-trip" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-primary" />
                  Attach Workspace Trip for Context (Optional)
                </Label>
                <Select
                  value={selectedTripId}
                  onValueChange={setSelectedTripId}
                  disabled={isPending}
                >
                  <SelectTrigger id="post-trip" className="text-xs h-9 bg-background border-border">
                    <SelectValue placeholder="Choose a trip to link" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="NONE" className="text-xs text-muted-foreground cursor-pointer">
                      Do not attach a trip
                    </SelectItem>
                    {userTrips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id} className="text-xs cursor-pointer">
                        {trip.title} {trip.destination ? `(${trip.destination})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Community members will be able to inspect your itinerary stops and offer pacing advice.
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-1.5">
              <Label htmlFor="post-tags" className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                Tags (Comma-separated)
              </Label>
              <Input
                id="post-tags"
                placeholder="e.g., Japan, TrainPass, Autumn, FoodGuide"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="text-xs h-9 bg-background border-border"
                disabled={isPending}
              />
            </div>

            {/* Dedicated Community Image Upload (1 Image Limit) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Discussion Visual (Optional — 1 Image)
                </span>
                {imageUrl && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Uploaded to Community
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
              <Label htmlFor="post-content" className="text-xs font-semibold text-foreground">
                Details & Questions <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="post-content"
                rows={4}
                placeholder="Provide background on your dates, pacing questions, transit concerns, or specific tips you're seeking..."
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
                  Publishing...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Post Discussion
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
