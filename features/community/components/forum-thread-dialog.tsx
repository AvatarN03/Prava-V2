"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Calendar,
  CheckCircle2,
  Compass,
  Copy,
  Globe,
  Loader2,
  MapPin,
  MessageSquare,
  Send,
  Share2,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { cloneTripTemplate } from "@/features/community/actions";
import {
  getForumThread,
  postForumReply,
  toggleForumPostUpvote,
} from "@/features/community/forum-actions";
import { ForumPost, ForumReply } from "@/features/community/forum-types";

interface ForumThreadDialogProps {
  post: ForumPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThreadUpdated?: () => void;
}

export function ForumThreadDialog({
  post,
  open,
  onOpenChange,
  onThreadUpdated,
}: ForumThreadDialogProps) {
  const router = useRouter();
  const [thread, setThread] = useState<ForumPost | null>(post);
  const [replies, setReplies] = useState<ForumReply[]>(post?.replies || []);
  const [upvotes, setUpvotes] = useState(post?.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(Boolean(post?.hasUpvoted));
  const [newReplyText, setNewReplyText] = useState("");
  const [isSubmittingReply, startSubmitReply] = useTransition();
  const [isCloningTrip, setIsCloningTrip] = useState(false);

  // Sync state when post changes or dialog opens
  useEffect(() => {
    if (post && open) {
      setThread(post);
      setUpvotes(post.upvotes);
      setHasUpvoted(Boolean(post.hasUpvoted));
      setReplies(post.replies || []);

      // Fetch fresh thread with latest replies
      getForumThread(post.id).then((fresh) => {
        if (fresh) {
          setThread(fresh);
          setUpvotes(fresh.upvotes);
          setHasUpvoted(Boolean(fresh.hasUpvoted));
          setReplies(fresh.replies || []);
        }
      });
    }
  }, [post, open]);

  if (!thread) return null;

  const handleUpvote = async () => {
    const prevUpvoted = hasUpvoted;
    const prevCount = upvotes;

    // Optimistic UI update
    setUpvotes(prevUpvoted ? Math.max(0, prevCount - 1) : prevCount + 1);
    setHasUpvoted(!prevUpvoted);

    const res = await toggleForumPostUpvote(thread.id);
    if (!res.success) {
      // Rollback
      setUpvotes(prevCount);
      setHasUpvoted(prevUpvoted);
      toast.error(res.error || "Failed to update upvote. Please sign in.");
    } else {
      if (onThreadUpdated) onThreadUpdated();
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim()) return;

    startSubmitReply(async () => {
      const res = await postForumReply(thread.id, newReplyText.trim());
      if (res.success) {
        toast.success("Reply added to discussion!");
        setNewReplyText("");
        // Reload replies
        const fresh = await getForumThread(thread.id);
        if (fresh) {
          setReplies(fresh.replies || []);
        }
        if (onThreadUpdated) onThreadUpdated();
      } else {
        toast.error(res.error || "Failed to post reply. Please sign in.");
      }
    });
  };

  const handleCloneLinkedTrip = async () => {
    if (!thread.linkedTrip) return;
    setIsCloningTrip(true);
    try {
      const res = await cloneTripTemplate(thread.linkedTrip.id);
      if (res.success && res.tripId) {
        toast.success(`Cloned "${thread.linkedTrip.title}" to your workspace!`);
        router.push(`/trips/${res.tripId}/overview`);
      } else {
        toast.error(res.error || "Failed to clone attached trip.");
      }
    } catch {
      toast.error("An error occurred while cloning.");
    } finally {
      setIsCloningTrip(false);
    }
  };

  const getAuthorInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-border bg-card text-card-foreground shadow-2xl">
        <DialogHeader className="space-y-3 pb-2 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-semibold">
                {thread.categoryLabel}
              </Badge>
              {thread.destination && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 text-primary" />
                  {thread.destination}
                </span>
              )}
            </div>

            <span className="text-[11px] text-muted-foreground">{thread.createdAt}</span>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground leading-snug">
            {thread.title}
          </DialogTitle>

          {/* Author Attribution */}
          <div className="flex items-center gap-3 pt-1">
            <Avatar className="h-9 w-9 border border-border">
              {thread.authorAvatarUrl && (
                <AvatarImage src={thread.authorAvatarUrl} alt={thread.authorName} />
              )}
              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                {getAuthorInitials(thread.authorName)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">
                  {thread.authorName}
                </span>
                {thread.authorUsername && (
                  <Link
                    href={`/u/${thread.authorUsername}`}
                    className="text-xs text-primary hover:underline"
                  >
                    @{thread.authorUsername}
                  </Link>
                )}
                {thread.isCreatorPublic && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1 text-muted-foreground">
                    Creator
                  </Badge>
                )}
              </div>
              {thread.authorBio && (
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {thread.authorBio}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Post Main Body */}
        <div className="space-y-4 py-3">
          <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
            {thread.content}
          </div>

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {thread.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] font-normal border-border bg-muted/40 text-muted-foreground"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Attached Workspace Trip */}
          {thread.linkedTrip && (
            <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Compass className="h-4 w-4" />
                  Attached Workspace Trip
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCloneLinkedTrip}
                  disabled={isCloningTrip}
                  className="h-7 text-xs gap-1.5 border-border hover:bg-muted"
                >
                  {isCloningTrip ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Clone Trip
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {thread.linkedTrip.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {thread.linkedTrip.destination}
                  </span>
                  <span>•</span>
                  <span>{thread.linkedTrip.durationDays} Days</span>
                </div>
              </div>
            </div>
          )}

          {/* Upvote & Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Button
                variant={hasUpvoted ? "default" : "outline"}
                size="sm"
                onClick={handleUpvote}
                className={`h-8 text-xs gap-1.5 cursor-pointer ${
                  hasUpvoted ? "bg-primary text-primary-foreground" : "border-border text-foreground"
                }`}
              >
                <ThumbsUp className={`h-3.5 w-3.5 ${hasUpvoted ? "fill-current" : ""}`} />
                <span>{upvotes}</span>
                <span className="hidden sm:inline">Upvotes</span>
              </Button>

              <span className="text-xs text-muted-foreground ml-2">
                {thread.views} views
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{replies.length} replies</span>
            </div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="space-y-4 pt-2 border-t border-border">
          <h3 className="text-sm font-bold text-foreground">
            Replies & Advice ({replies.length})
          </h3>

          {replies.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-border rounded-xl bg-muted/20 space-y-1">
              <p className="text-xs font-medium text-foreground">No replies yet</p>
              <p className="text-[11px] text-muted-foreground">
                Be the first to offer route advice or answers!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className="rounded-xl border border-border bg-card p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-border">
                        {reply.authorAvatarUrl && (
                          <AvatarImage src={reply.authorAvatarUrl} alt={reply.authorName} />
                        )}
                        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                          {getAuthorInitials(reply.authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold text-foreground">
                        {reply.authorName}
                      </span>
                      {reply.authorUsername && (
                        <Link
                          href={`/u/${reply.authorUsername}`}
                          className="text-[11px] text-primary hover:underline"
                        >
                          @{reply.authorUsername}
                        </Link>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {reply.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line pl-8">
                    {reply.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* New Reply Form */}
          <form onSubmit={handleSendReply} className="space-y-2 pt-2">
            <Textarea
              rows={2}
              placeholder="Write a helpful response, recommend an alternative route, or share your experience..."
              value={newReplyText}
              onChange={(e) => setNewReplyText(e.target.value)}
              className="text-xs resize-none bg-background border-border"
              disabled={isSubmittingReply}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingReply || !newReplyText.trim()}
                className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
              >
                {isSubmittingReply ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Post Reply
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
