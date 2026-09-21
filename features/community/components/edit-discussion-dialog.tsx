"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Compass, Image as ImageIcon, Loader2, MapPin, Tag } from "lucide-react";
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
import type {
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
  const [showImageUpload, setShowImageUpload] = useState(Boolean(post.coverImageUrl || post.images?.[0]));
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
      const existingImg = post.coverImageUrl || post.images?.[0] || "";
      setImageUrl(existingImg);
      setShowImageUpload(Boolean(existingImg));
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
        tags: splitTags.length > 0 ? splitTags : ["CommunityAdvice"],
        linkedTripId: selectedTripId !== "NONE" ? selectedTripId : null,
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
        coverImageUrl: imageUrl.trim() || undefined,
      });

      if (res.success) {
        toast.success("Discussion updated successfully!");
        onOpenChange(false);
        router.refresh();
        if (onUpdated) {
          onUpdated();
        }
      } else {
        toast.error(res.error || "Failed to update discussion.");
      }
    });
  };

  const selectableCategories = FORUM_CATEGORIES.filter((c) => c.id !== "ALL");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[92vw] sm:w-full sm:max-w-xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-sm sm:rounded-md border border-border bg-card text-card-foreground shadow-xl">
        <DialogHeader className="px-5 py-4 border-b border-border shrink-0 text-left bg-card space-y-1">
          <DialogTitle className="text-base font-semibold text-foreground">
            Edit Discussion
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update your discussion topic, details, destination, or attached trip.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3.5 ultra-thin-scrollbar">
            {/* Title */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
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
                <Label className="text-xs font-semibold text-foreground">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as ForumCategory)}
                  disabled={isPending}
                >
                  <SelectTrigger className="text-xs h-9 rounded-sm bg-background border-border">
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

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  Destination <span className="text-muted-foreground font-normal text-[11px]">(Optional)</span>
                </Label>
                <Input
                  placeholder="e.g., Kyoto, Japan"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="text-xs h-9 rounded-sm bg-background border-border"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Content / Detailed Questions (In the middle as requested!) */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">
                Details & Questions <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={4}
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
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  Tags <span className="text-muted-foreground font-normal text-[11px]">(Optional)</span>
                </Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="text-xs h-9 rounded-sm bg-background border-border"
                  disabled={isPending}
                />
              </div>

              {userTrips.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Compass className="h-3 w-3 text-primary" />
                    Attached Trip <span className="text-muted-foreground font-normal text-[11px]">(Optional)</span>
                  </Label>
                  <Select
                    value={selectedTripId}
                    onValueChange={setSelectedTripId}
                    disabled={isPending}
                  >
                    <SelectTrigger className="text-xs h-9 rounded-sm bg-background border-border">
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
            </div>

            {/* Cover Image Upload (Compact toggleable trigger instead of bulky empty banner) */}
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
