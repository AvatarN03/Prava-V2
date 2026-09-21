"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Compass,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
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
import type {
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
  const [showImageUpload, setShowImageUpload] = useState(false);
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
        setShowImageUpload(false);
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
      <DialogContent className="w-[92vw] max-w-[92vw] sm:w-full sm:max-w-xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-sm sm:rounded-md border border-border bg-card text-card-foreground shadow-xl">
        <DialogHeader className="px-5 py-4 border-b border-border shrink-0 text-left bg-card space-y-1">
          <DialogTitle className="text-base font-semibold text-foreground">
            Start Discussion
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ask for route advice, local recommendations, or discuss travel plans with fellow members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3.5 ultra-thin-scrollbar">
            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="post-title" className="text-xs font-semibold text-foreground">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="post-title"
                placeholder="e.g., Kyoto 7-Day Route: Is pacing realistic for peak foliage?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs h-9 rounded-sm bg-background border-border"
                disabled={isPending}
                required
              />
            </div>

            {/* Category & Destination Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="post-category" className="text-xs font-semibold text-foreground">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as ForumCategory)}
                  disabled={isPending}
                >
                  <SelectTrigger id="post-category" className="text-xs h-9 rounded-sm bg-background border-border">
                    <SelectValue placeholder="Select topic" />
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

              <div className="space-y-1">
                <Label htmlFor="post-dest" className="text-xs font-semibold text-foreground">
                  Destination <span className="text-muted-foreground font-normal text-[11px]">(Optional)</span>
                </Label>
                <Input
                  id="post-dest"
                  placeholder="e.g., Kyoto, Japan"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="text-xs h-9 rounded-sm bg-background border-border"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Content Description */}
            <div className="space-y-1">
              <Label htmlFor="post-content" className="text-xs font-semibold text-foreground">
                Details & Questions <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="post-content"
                rows={4}
                placeholder="Provide background on your dates, pacing questions, transit concerns, or specific tips you're seeking..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-xs resize-none rounded-sm bg-background border-border focus-visible:ring-primary leading-relaxed"
                disabled={isPending}
                required
              />
            </div>

            {/* Optional Attachments: Tags & Attach Workspace Trip */}
            <div className={`grid grid-cols-1 ${userTrips.length > 0 ? "sm:grid-cols-2" : ""} gap-3 pt-0.5`}>
              <div className="space-y-1">
                <Label htmlFor="post-tags" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  Tags <span className="text-muted-foreground font-normal text-[11px]">(Optional)</span>
                </Label>
                <Input
                  id="post-tags"
                  placeholder="Japan, TrainPass, Autumn"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="text-xs h-9 rounded-sm bg-background border-border"
                  disabled={isPending}
                />
              </div>

              {userTrips.length > 0 && (
                <div className="space-y-1">
                  <Label htmlFor="post-trip" className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Compass className="h-3 w-3 text-primary" />
                    Attach Trip <span className="text-muted-foreground font-normal text-[11px]">(Optional)</span>
                  </Label>
                  <Select
                    value={selectedTripId}
                    onValueChange={setSelectedTripId}
                    disabled={isPending}
                  >
                    <SelectTrigger id="post-trip" className="text-xs h-9 rounded-sm bg-background border-border">
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
                </div>
              )}
            </div>

            {/* Optional Cover Image (Compact toggleable trigger instead of bulky empty banner) */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Cover Photo <span className="text-muted-foreground font-normal text-[11px]">(Optional)</span>
                </Label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      setShowImageUpload(false);
                    }}
                    className="text-[11px] text-destructive hover:underline cursor-pointer"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              {showImageUpload || imageUrl ? (
                <ImageUpload
                  folder="community"
                  aspectRatio="banner"
                  currentImageUrl={imageUrl || null}
                  onUploaded={(url) => setImageUrl(url)}
                  onRemoved={() => {
                    setImageUrl("");
                    setShowImageUpload(false);
                  }}
                  className="w-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowImageUpload(true)}
                  className="w-full h-8.5 text-xs border border-dashed border-border rounded-sm bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Add optional cover photo</span>
                </button>
              )}
            </div>
          </div>

          <DialogFooter className="px-5 py-3 border-t border-border shrink-0 bg-muted/20 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs rounded-sm cursor-pointer"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-8 text-xs rounded-sm gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs cursor-pointer"
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
