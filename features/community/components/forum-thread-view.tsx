"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Bookmark,
  Compass,
  Copy,
  Edit3,
  Eye,
  Loader2,
  MapPin,
  MessageSquare,
  MoreVertical,
  Send,
  Share2,
  Sparkles,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

import { cloneTripTemplate } from "@/features/community/actions";
import { EditDiscussionDialog } from "@/features/community/components/edit-discussion-dialog";
import { SaveTipDialog } from "@/features/community/components/save-tip-dialog";
import {
  deleteForumDiscussion,
  deleteForumReply,
  getForumPostBySlug,
  postForumReply,
  toggleForumPostUpvote,
  toggleSaveDiscussion,
  updateForumReply,
} from "@/features/community/forum-actions";
import {
  ForumPost,
  ForumReply,
  UserTripOption,
} from "@/features/community/forum-types";

interface ForumThreadViewProps {
  initialPost: ForumPost;
  userTrips: UserTripOption[];
}

export function ForumThreadView({
  initialPost,
  userTrips = [],
}: ForumThreadViewProps) {
  const router = useRouter();
  const [post, setPost] = useState<ForumPost>(initialPost);
  const [upvotes, setUpvotes] = useState(initialPost.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(Boolean(initialPost.hasUpvoted));
  const [hasSaved, setHasSaved] = useState(Boolean(initialPost.hasSaved));
  const [replies, setReplies] = useState<ForumReply[]>(initialPost.replies || []);
  const [newReplyText, setNewReplyText] = useState("");
  const [isSubmittingReply, startSubmitReply] = useTransition();

  // Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saveTipDialogOpen, setSaveTipDialogOpen] = useState(false);
  const [activeTipToSave, setActiveTipToSave] = useState<{
    content: string;
    author: string;
  }>({ content: "", author: "" });

  // Inline comment editing
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState("");
  const [isCloningTrip, setIsCloningTrip] = useState(false);

  const refreshThread = useCallback(async () => {
    const fresh = await getForumPostBySlug(post.slug);
    if (fresh) {
      setPost(fresh);
      setUpvotes(fresh.upvotes);
      setHasUpvoted(Boolean(fresh.hasUpvoted));
      setHasSaved(Boolean(fresh.hasSaved));
      setReplies(fresh.replies || []);
    }
  }, [post.slug]);

  // Background polling every 30s to keep comments and votes live
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "visible" &&
        !editingReplyId &&
        !isSubmittingReply
      ) {
        refreshThread();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshThread, editingReplyId, isSubmittingReply]);

  const handleUpvote = async () => {
    const prevUpvoted = hasUpvoted;
    const prevCount = upvotes;

    setUpvotes(prevUpvoted ? Math.max(0, prevCount - 1) : prevCount + 1);
    setHasUpvoted(!prevUpvoted);

    const res = await toggleForumPostUpvote(post.id);
    if (!res.success) {
      setUpvotes(prevCount);
      setHasUpvoted(prevUpvoted);
      toast.error(res.error || "Please sign in to upvote.");
    }
  };

  const handleToggleBookmark = async () => {
    const prevSaved = hasSaved;
    setHasSaved(!prevSaved);

    const res = await toggleSaveDiscussion(post.id);
    if (!res.success) {
      setHasSaved(prevSaved);
      toast.error(res.error || "Please sign in to bookmark.");
    } else {
      toast.success(prevSaved ? "Removed from bookmarks" : "Bookmarked discussion!");
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this discussion?")) return;
    const res = await deleteForumDiscussion(post.id);
    if (res.success) {
      toast.success("Discussion deleted.");
      router.push("/forum");
    } else {
      toast.error(res.error || "Failed to delete discussion.");
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim()) return;

    startSubmitReply(async () => {
      const res = await postForumReply(post.id, newReplyText.trim());
      if (res.success) {
        toast.success("Reply added to discussion!");
        setNewReplyText("");
        await refreshThread();
      } else {
        toast.error(res.error || "Failed to post reply. Please sign in.");
      }
    });
  };

  const handleSaveReplyEdit = async (replyId: string) => {
    if (!editingReplyContent.trim()) return;
    const res = await updateForumReply(replyId, editingReplyContent.trim());
    if (res.success) {
      toast.success("Reply updated.");
      setEditingReplyId(null);
      await refreshThread();
    } else {
      toast.error(res.error || "Failed to update reply.");
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("Delete this reply?")) return;
    const res = await deleteForumReply(replyId);
    if (res.success) {
      toast.success("Reply deleted.");
      await refreshThread();
    } else {
      toast.error(res.error || "Failed to delete reply.");
    }
  };

  const handleCloneLinkedTrip = async () => {
    if (!post.linkedTrip) return;
    setIsCloningTrip(true);
    try {
      const res = await cloneTripTemplate(post.linkedTrip.id);
      if (res.success && res.tripId) {
        toast.success(`Cloned "${post.linkedTrip.title}" to your workspace!`);
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

  const handleOpenSaveTip = (content: string, author: string) => {
    setActiveTipToSave({ content, author });
    setSaveTipDialogOpen(true);
  };

  const getAuthorInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const attachedVisual = post.coverImageUrl || (post.images && post.images[0]) || null;

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Link href="/forum">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer -ml-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Discussions
            </Button>
          </Link>
          <span className="text-muted-foreground/40 text-xs">/</span>
          <Badge variant="secondary" className="text-[11px] font-medium py-0.5">
            {post.categoryLabel}
          </Badge>
          {post.destination && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 text-primary" />
              {post.destination}
            </span>
          )}
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={hasUpvoted ? "default" : "outline"}
            size="sm"
            onClick={handleUpvote}
            className={`h-8 text-xs gap-1.5 cursor-pointer ${
              hasUpvoted
                ? "bg-primary text-primary-foreground font-semibold"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${hasUpvoted ? "fill-current" : ""}`} />
            <span>{upvotes}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleBookmark}
            className={`h-8 text-xs gap-1.5 cursor-pointer border-border ${
              hasSaved
                ? "text-primary border-primary/40 bg-primary/5 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${hasSaved ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">{hasSaved ? "Saved" : "Save"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenSaveTip(post.content, post.authorName)}
            className="h-8 text-xs gap-1.5 border-border text-muted-foreground hover:text-foreground cursor-pointer"
            title="Save tip to your trip notes"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Save to Trip</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Discussion link copied to clipboard!");
            }}
            className="h-8 text-xs gap-1.5 border-border text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          {post.isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 cursor-pointer border-border text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border text-xs">
                <DropdownMenuItem
                  onClick={() => setEditDialogOpen(true)}
                  className="gap-2 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Discussion
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeletePost}
                  className="gap-2 text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Discussion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Asymmetrical Desktop Two-Column Layout (Post on Left, Advice/Comments on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section: Main Post & Workspace Context (Cols 7/12) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          <Card className="border border-border bg-card shadow-2xs rounded-md overflow-hidden">
            <CardContent className="p-5 sm:p-6 space-y-5">
              {/* Post Title */}
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                {post.title}
              </h1>

              {/* Author & Timestamp Bar */}
              <div className="flex items-center justify-between gap-3 pt-1 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 border border-border">
                    {post.authorAvatarUrl && (
                      <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} />
                    )}
                    <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                      {getAuthorInitials(post.authorName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-semibold text-foreground">
                      {post.authorName}
                    </span>
                    {post.authorUsername && (
                      <Link
                        href={`/u/${post.authorUsername}`}
                        className="text-primary hover:underline font-medium"
                      >
                        @{post.authorUsername}
                      </Link>
                    )}
                    {post.isCreatorPublic && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1 text-muted-foreground rounded-sm">
                        Verified
                      </Badge>
                    )}
                    <span className="text-muted-foreground/60">•</span>
                    <span className="text-muted-foreground">{post.createdAt}</span>
                    {post.isEdited && (
                      <span className="text-[11px] text-muted-foreground italic">(edited)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground/70" />
                    {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/70" />
                    {replies.length}
                  </span>
                </div>
              </div>

              {/* Discussion Body Content */}
              <div className="text-sm sm:text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line font-normal">
                {post.content}
              </div>

              {/* Single Dedicated Attached Visual (Uploaded to Supabase) */}
              {attachedVisual && (
                <div className="relative rounded-md overflow-hidden border border-border bg-muted/20 my-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachedVisual}
                    alt={post.title}
                    className="w-full max-h-[460px] object-cover rounded-md"
                  />
                </div>
              )}

              {/* Attached Workspace Trip Card */}
              {post.linkedTrip && (
                <div className="rounded-md border border-border bg-muted/20 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5" />
                      Attached Workspace Itinerary
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCloneLinkedTrip}
                      disabled={isCloningTrip}
                      className="h-7 text-xs gap-1.5 border-border hover:bg-muted cursor-pointer rounded-md"
                    >
                      {isCloningTrip ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      Clone to My Trips
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                        {post.linkedTrip.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3 text-primary" />
                          {post.linkedTrip.destination}
                        </span>
                        <span>•</span>
                        <span>{post.linkedTrip.durationDays} Days</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags Strip */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[11px] font-normal border-border bg-muted/30 text-muted-foreground rounded-sm"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Comments & Travel Advice Stream (Cols 5/12) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4 lg:sticky lg:top-16">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Traveler Advice & Comments
            </h2>
            <Badge variant="secondary" className="text-xs font-semibold px-2 rounded-sm">
              {replies.length}
            </Badge>
          </div>

          {/* Quick Reply Composer */}
          <Card className="border border-border bg-card shadow-2xs rounded-md p-3.5 space-y-2.5">
            <form onSubmit={handleSendReply} className="space-y-2.5">
              <Textarea
                rows={3}
                placeholder="Share your advice, route recommendations, or answer this question..."
                value={newReplyText}
                onChange={(e) => setNewReplyText(e.target.value)}
                className="text-xs resize-none bg-background border-border focus-visible:ring-primary rounded-md"
                disabled={isSubmittingReply}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Be supportive & constructive
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingReply || !newReplyText.trim()}
                  className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs cursor-pointer rounded-md"
                >
                  {isSubmittingReply ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  Post Advice
                </Button>
              </div>
            </form>
          </Card>

          {/* Single Parent Card for Advice Stream (No repetitive cards or borders) */}
          <Card className="border border-border bg-card shadow-2xs rounded-md overflow-hidden">
            {replies.length === 0 ? (
              <div className="text-center py-8 p-4 space-y-1">
                <p className="text-xs font-semibold text-foreground">No advice posted yet</p>
                <p className="text-[11px] text-muted-foreground">
                  Be the first traveler to help out with route advice or recommendations!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60 max-h-[calc(100vh-260px)] overflow-y-auto pr-0.5 scrollbar-thin">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-3.5 space-y-2 hover:bg-muted/15 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-border">
                          {reply.authorAvatarUrl && (
                            <AvatarImage src={reply.authorAvatarUrl} alt={reply.authorName} />
                          )}
                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                            {getAuthorInitials(reply.authorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-semibold text-foreground text-[11px] sm:text-xs">
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
                          {reply.authorId === post.authorId && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary/30 text-primary rounded-sm">
                              Author
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground shrink-0">
                        {reply.isEdited && <span className="italic">(edited)</span>}
                        <span>{reply.createdAt}</span>

                        {/* 3-Dot Options Dropdown for EVERY comment */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground"
                              title="Comment options"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border text-xs rounded-md shadow-md">
                            <DropdownMenuItem
                              onClick={() => handleOpenSaveTip(reply.content, reply.authorName)}
                              className="gap-2 cursor-pointer"
                            >
                              <Bookmark className="h-3.5 w-3.5 text-primary" />
                              Save Tip to Trip
                            </DropdownMenuItem>

                            {reply.isAuthor && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingReplyId(reply.id);
                                    setEditingReplyContent(reply.content);
                                  }}
                                  className="gap-2 cursor-pointer"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                  Edit Reply
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteReply(reply.id)}
                                  className="gap-2 text-destructive cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete Reply
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Reply Content or Inline Editor */}
                    {editingReplyId === reply.id ? (
                      <div className="space-y-2 pt-1 pl-8">
                        <Textarea
                          rows={3}
                          value={editingReplyContent}
                          onChange={(e) => setEditingReplyContent(e.target.value)}
                          className="text-xs bg-background border-border rounded-md"
                        />
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingReplyId(null)}
                            className="text-xs h-6 px-2 rounded-md"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveReplyEdit(reply.id)}
                            className="text-xs h-6 px-2.5 bg-primary text-primary-foreground rounded-md"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line pl-8">
                        {reply.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Discussion Modal */}
      <EditDiscussionDialog
        post={post}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        userTrips={userTrips}
        onUpdated={refreshThread}
      />

      {/* Save Tip to Workspace Note Modal */}
      <SaveTipDialog
        open={saveTipDialogOpen}
        onOpenChange={setSaveTipDialogOpen}
        tipContent={activeTipToSave.content}
        sourceTitle={post.title}
        authorName={activeTipToSave.author}
        userTrips={userTrips}
      />
    </div>
  );
}
