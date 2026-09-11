"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Globe,
  MapPin,
  Sparkles,
  Copy,
  Send,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ForumPost, ForumReply } from "../forum-types";
import { cloneTripTemplate } from "../actions";

interface ForumThreadDialogProps {
  post: ForumPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdate?: (updatedPost: ForumPost) => void;
}

export function ForumThreadDialog({
  post,
  open,
  onOpenChange,
  onPostUpdate,
}: ForumThreadDialogProps) {
  const [upvotes, setUpvotes] = useState(post?.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [replies, setReplies] = useState<ForumReply[]>(post?.replies || []);
  const [newReplyText, setNewReplyText] = useState("");
  const [isCloningTrip, setIsCloningTrip] = useState(false);

  if (!post) return null;

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes((prev) => prev - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes((prev) => prev + 1);
      setHasUpvoted(true);
      toast.success("Upvoted discussion!");
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim()) return;

    const newReply: ForumReply = {
      id: `reply-${Date.now()}`,
      authorName: "You (Traveler)",
      content: newReplyText.trim(),
      createdAt: "Just now",
      upvotes: 1,
    };

    const updated = [...replies, newReply];
    setReplies(updated);
    setNewReplyText("");
    toast.success("Reply posted to community thread!");

    if (onPostUpdate) {
      onPostUpdate({
        ...post,
        upvotes: hasUpvoted ? upvotes : upvotes,
        repliesCount: updated.length,
        replies: updated,
      });
    }
  };

  const handleCloneLinkedTrip = async () => {
    if (!post.linkedTrip) return;
    setIsCloningTrip(true);
    try {
      const res = await cloneTripTemplate(post.linkedTrip.id);
      if (res.success && res.tripId) {
        toast.success(`Cloned "${post.linkedTrip.title}" to your workspace!`);
      } else {
        toast.error(res.error || "Failed to clone trip. Please sign in.");
      }
    } catch {
      toast.error("Failed to clone trip.");
    } finally {
      setIsCloningTrip(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-slate-200 shadow-xl">
        {/* Thread Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-sky-50/50 via-white to-white space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-sky-100 text-sky-800 border-sky-200 text-xs font-semibold">
              {post.categoryLabel}
            </Badge>
            {post.destination && (
              <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <MapPin className="h-3.5 w-3.5 text-[#2D9BF0]" />
                {post.destination}
              </span>
            )}
            <span className="text-xs text-slate-400 ml-auto">{post.createdAt}</span>
          </div>

          <DialogTitle className="text-xl font-bold text-slate-900 leading-snug">
            {post.title}
          </DialogTitle>

          {/* Author info row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-sky-200 shadow-2xs">
                {post.authorAvatarUrl && (
                  <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} />
                )}
                <AvatarFallback className="bg-gradient-to-tr from-[#2D9BF0] to-[#55B8FF] text-white font-bold text-xs">
                  {post.authorName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900">{post.authorName}</span>
                  {post.isCreatorPublic && (
                    <span className="flex items-center gap-0.5 rounded-full bg-sky-100 px-2 py-0.2 text-[10px] font-bold text-sky-800">
                      <Globe className="h-2.5 w-2.5" />
                      Creator
                    </span>
                  )}
                </div>
                {post.authorUsername && (
                  <Link
                    href={`/u/${post.authorUsername}`}
                    className="text-xs text-[#2D9BF0] hover:underline"
                  >
                    @{post.authorUsername}
                  </Link>
                )}
              </div>
            </div>

            {/* Upvote & Share Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant={hasUpvoted ? "default" : "outline"}
                size="sm"
                className={`gap-1.5 rounded-xl text-xs h-9 px-3.5 cursor-pointer ${
                  hasUpvoted
                    ? "bg-[#2D9BF0] hover:bg-[#1A82D2] text-white shadow-sm shadow-[#2D9BF0]/30"
                    : "border-slate-200 hover:bg-sky-50 text-slate-700"
                }`}
                onClick={handleUpvote}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{upvotes} Upvotes</span>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Thread Body */}
        <div className="p-6 space-y-6">
          {/* Post Content */}
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {post.content}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Linked Itinerary Attachment Card */}
          {post.linkedTrip && (
            <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50/70 via-white to-sky-50/40 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-950">
                  <Sparkles className="h-4 w-4 text-[#2D9BF0]" />
                  <span>Attached Trip Workspace Itinerary</span>
                </div>
                <Badge variant="secondary" className="bg-sky-100 text-sky-800 border-sky-200 text-[10px]">
                  {post.linkedTrip.durationDays} Days
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{post.linkedTrip.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-[#2D9BF0]" />
                    {post.linkedTrip.destination} • {post.linkedTrip.activityCount} planned activities
                  </p>
                </div>

                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] text-white text-xs font-semibold h-9 px-4 rounded-xl shadow-xs gap-1.5 cursor-pointer shrink-0"
                  onClick={handleCloneLinkedTrip}
                  disabled={isCloningTrip}
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Clone to Workspace</span>
                </Button>
              </div>
            </div>
          )}

          <Separator className="bg-slate-100" />

          {/* Replies Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#2D9BF0]" />
              <span>Community Replies ({replies.length})</span>
            </h3>

            {/* Replies List */}
            <div className="space-y-3">
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 border border-sky-200">
                        {reply.authorAvatarUrl && (
                          <AvatarImage src={reply.authorAvatarUrl} alt={reply.authorName} />
                        )}
                        <AvatarFallback className="bg-sky-100 text-sky-800 text-[10px] font-bold">
                          {reply.authorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold text-slate-900">{reply.authorName}</span>
                      {reply.isHelpful && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Top Tip
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{reply.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed pl-9">{reply.content}</p>
                </div>
              ))}
            </div>

            {/* Post a Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-3">
              <Textarea
                placeholder="Share your travel advice or answer this discussion..."
                value={newReplyText}
                onChange={(e) => setNewReplyText(e.target.value)}
                className="text-xs min-h-[80px] rounded-xl border-slate-200"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] text-white text-xs font-semibold h-9 px-4 rounded-xl shadow-xs gap-1.5 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Post Reply</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
