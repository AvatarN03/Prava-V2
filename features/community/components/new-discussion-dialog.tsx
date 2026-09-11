"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MessageSquare, Sparkles, MapPin, Tag, Plus } from "lucide-react";
import { ForumCategory, ForumPost } from "../forum-types";
import { FORUM_CATEGORIES } from "../forum-data";

interface NewDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (newPost: ForumPost) => void;
}

export function NewDiscussionDialog({
  open,
  onOpenChange,
  onCreated,
}: NewDiscussionDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ForumCategory>("ROUTE_ADVICE");
  const [destination, setDestination] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please enter a discussion title and content.");
      return;
    }

    const catObj = FORUM_CATEGORIES.find((c) => c.id === category);
    const splitTags = tags
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const newPost: ForumPost = {
      id: `forum-post-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category,
      categoryLabel: catObj ? catObj.label : "Discussions",
      tags: splitTags.length > 0 ? splitTags : ["CommunityAdvice"],
      destination: destination.trim() || undefined,
      authorName: "You (Traveler)",
      authorUsername: "my_workspace",
      isCreatorPublic: true,
      authorBio: "Traveler & trip architect on Prava AI.",
      createdAt: "Just now",
      upvotes: 1,
      views: 1,
      repliesCount: 0,
      replies: [],
    };

    onCreated(newPost);
    toast.success("Discussion topic posted to Community Forum!");
    onOpenChange(false);
    setTitle("");
    setContent("");
    setDestination("");
    setTags("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 rounded-2xl border-slate-200 shadow-xl">
        <DialogHeader className="space-y-1 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-[#2D9BF0]">
              <MessageSquare className="h-4 w-4" />
            </span>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Start a Community Discussion
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Ask for route advice, share hidden gems, discuss packing strategies, or post live travel reports.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Topic Title</Label>
            <Input
              placeholder="e.g. 10-day itinerary review for Switzerland in Autumn..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Discussion Channel</Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as ForumCategory)}
              >
                <SelectTrigger className="h-9 text-xs rounded-xl cursor-pointer">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROUTE_ADVICE" className="cursor-pointer">
                    🗺️ Route & Itinerary Advice
                  </SelectItem>
                  <SelectItem value="RECOMMENDATIONS" className="cursor-pointer">
                    ✨ Hidden Gems & Food
                  </SelectItem>
                  <SelectItem value="PACKING_GEAR" className="cursor-pointer">
                    🎒 Gear & Packing
                  </SelectItem>
                  <SelectItem value="LIVE_REPORTS" className="cursor-pointer">
                    ⚡ Live Trip Reports
                  </SelectItem>
                  <SelectItem value="DISCUSSIONS" className="cursor-pointer">
                    💬 General Travel Q&A
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Destination (Optional)</Label>
              <Input
                placeholder="e.g. Kyoto, Japan or Amalfi, Italy"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Tags (Comma-separated)</Label>
            <Input
              placeholder="e.g. Japan, SoloTravel, Food, Autumn"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Discussion Details & Questions</Label>
            <Textarea
              placeholder="Describe your itinerary, questions, or tips in detail..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="text-xs min-h-[120px] rounded-xl"
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Post Discussion</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
