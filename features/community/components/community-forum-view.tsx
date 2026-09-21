"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Compass,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Package,
  Plus,
  Radio,
  Route,
  Search,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { NewDiscussionDialog } from "@/features/community/components/new-discussion-dialog";
import {
  getForumDiscussions,
  toggleForumPostUpvote,
  toggleSaveDiscussion,
} from "@/features/community/forum-actions";
import {
  DEFAULT_CATEGORY_IMAGES,
  FORUM_CATEGORIES,
} from "@/features/community/forum-data";
import {
  ForumCategory,
  ForumPost,
  UserTripOption,
} from "@/features/community/forum-types";

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  ALL: LayoutGrid,
  ROUTE_ADVICE: Route,
  RECOMMENDATIONS: Sparkles,
  PACKING_GEAR: Package,
  LIVE_REPORTS: Radio,
  TEMPLATES: BookmarkCheck,
  DISCUSSIONS: MessageSquare,
};

const CATEGORY_THEME_BADGES: Record<string, string> = {
  ROUTE_ADVICE: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  RECOMMENDATIONS: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  PACKING_GEAR: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  LIVE_REPORTS: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  TEMPLATES: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  DISCUSSIONS: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  ALL: "bg-muted text-muted-foreground border-border",
};

interface CommunityForumViewProps {
  initialPosts: ForumPost[];
  userTrips?: UserTripOption[];
}

export function CommunityForumView({
  initialPosts = [],
  userTrips = [],
}: CommunityForumViewProps) {
  const [activeCategory, setActiveCategory] = useState<ForumCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  const [newDiscussionOpen, setNewDiscussionOpen] = useState(false);
  const [, startTransition] = useTransition();

  const [prevInitialPosts, setPrevInitialPosts] = useState(initialPosts);
  if (prevInitialPosts !== initialPosts) {
    setPrevInitialPosts(initialPosts);
    setPosts(initialPosts);
  }

  const bookmarkedCount = useMemo(() => {
    return posts.filter((p) => p.hasSaved).length;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (showBookmarkedOnly) {
        if (!post.hasSaved) return false;
      } else {
        const matchesCategory =
          activeCategory === "ALL" || post.category === activeCategory;
        if (!matchesCategory) return false;
      }
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(q))) ||
        (post.destination && post.destination.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [posts, activeCategory, searchQuery, showBookmarkedOnly]);

  const refreshPosts = () => {
    startTransition(async () => {
      // Reset filter so newly published post is immediately visible at the top
      setActiveCategory("ALL");
      setShowBookmarkedOnly(false);
      setSearchQuery("");
      const fresh = await getForumDiscussions();
      setPosts(fresh);
    });
  };

  const handleCardUpvote = async (e: React.MouseEvent, post: ForumPost) => {
    e.preventDefault();
    e.stopPropagation();

    const prevUpvoted = post.hasUpvoted;
    const prevCount = post.upvotes;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              hasUpvoted: !prevUpvoted,
              upvotes: prevUpvoted ? Math.max(0, prevCount - 1) : prevCount + 1,
            }
          : p
      )
    );

    const res = await toggleForumPostUpvote(post.id);
    if (!res.success) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, hasUpvoted: prevUpvoted, upvotes: prevCount }
            : p
        )
      );
      toast.error(res.error || "Please sign in to upvote.");
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent, post: ForumPost) => {
    e.preventDefault();
    e.stopPropagation();

    const prevSaved = post.hasSaved;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, hasSaved: !prevSaved } : p
      )
    );

    const res = await toggleSaveDiscussion(post.id);
    if (!res.success) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, hasSaved: prevSaved } : p
        )
      );
      toast.error(res.error || "Please sign in to bookmark.");
    } else {
      toast.success(prevSaved ? "Removed bookmark" : "Discussion bookmarked!");
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
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Traveler Forum
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Ask for route advice, share secret viewpoints and culinary spots, discuss gear packing, or inspect fellow travelers&apos; itineraries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search topics, destinations..."
              className="pl-8.5 h-9 text-xs bg-background border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            size="sm"
            onClick={() => setNewDiscussionOpen(true)}
            className="h-9 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Start Discussion</span>
            <span className="xs:hidden">New Topic</span>
          </Button>
        </div>
      </div>

      {/* Mobile Filter Controls: Category Select Dropdown + Separate Bookmark Button */}
      <div className="flex sm:hidden items-center gap-2 w-full">
        <div className="flex-1 min-w-0">
          <Select
            value={activeCategory}
            onValueChange={(val) => {
              setActiveCategory(val as ForumCategory);
              setShowBookmarkedOnly(false);
            }}
          >
            <SelectTrigger className="h-9 text-xs bg-card border-border w-full flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2 truncate">
                {(() => {
                  const ActiveIcon = CATEGORY_ICON_MAP[activeCategory] || MessageSquare;
                  return <ActiveIcon className="h-3.5 w-3.5 text-primary shrink-0" />;
                })()}
                <span className="truncate">
                  {FORUM_CATEGORIES.find((c) => c.id === activeCategory)?.label || "Category"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {FORUM_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICON_MAP[cat.id] || MessageSquare;
                return (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Separate Bookmark Filter Button along the side of Category Selection */}
        <Button
          type="button"
          variant={showBookmarkedOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowBookmarkedOnly((prev) => !prev)}
          className={`h-9 px-3 gap-1.5 text-xs shrink-0 cursor-pointer font-medium ${
            showBookmarkedOnly
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
          }`}
          title="Filter saved and bookmarked discussions"
        >
          <Bookmark className={`h-3.5 w-3.5 ${showBookmarkedOnly ? "fill-current" : ""}`} />
          <span>Saved</span>
          {bookmarkedCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                showBookmarkedOnly
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {bookmarkedCount}
            </span>
          )}
        </Button>
      </div>

      {/* Desktop Category Pills Strip & Quick Filters */}
      <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FORUM_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICON_MAP[cat.id] || MessageSquare;
          const isActive = activeCategory === cat.id && !showBookmarkedOnly;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setShowBookmarkedOnly(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}

        {/* 1-Click Separate Bookmarked Filter Button */}
        <button
          type="button"
          onClick={() => setShowBookmarkedOnly((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ml-auto sm:ml-0 ${
            showBookmarkedOnly
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
          }`}
          title="Filter saved and bookmarked discussions"
        >
          <Bookmark className={`h-3.5 w-3.5 ${showBookmarkedOnly ? "fill-current" : ""}`} />
          <span>Bookmarked</span>
          {bookmarkedCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                showBookmarkedOnly
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {bookmarkedCount}
            </span>
          )}
        </button>
      </div>

      {/* Results Meta */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing <strong className="text-foreground">{filteredPosts.length}</strong>{" "}
          {filteredPosts.length === 1 ? "discussion" : "discussions"}
          {showBookmarkedOnly
            ? " (Bookmarked only)"
            : activeCategory !== "ALL"
            ? ` in ${FORUM_CATEGORIES.find((c) => c.id === activeCategory)?.label}`
            : ""}
        </span>
        {(searchQuery || activeCategory !== "ALL" || showBookmarkedOnly) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("ALL");
              setShowBookmarkedOnly(false);
            }}
            className="h-7 text-xs text-primary hover:text-primary/80 cursor-pointer"
          >
            Reset filters
          </Button>
        )}
      </div>

      {/* Discussions Grid Layout (2–3 Columns) */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/40 p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {showBookmarkedOnly ? (
              <Bookmark className="h-6 w-6" />
            ) : (
              <MessageSquare className="h-6 w-6" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              {showBookmarkedOnly
                ? "No bookmarked discussions yet"
                : "No discussions yet in this topic"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {showBookmarkedOnly
                ? "Click the bookmark icon on any discussion card to quickly save it for later review."
                : "Be the first traveler to start a conversation, ask for pacing advice, or share hidden gems!"}
            </p>
          </div>
          {showBookmarkedOnly ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBookmarkedOnly(false)}
              className="text-xs cursor-pointer shadow-xs rounded-md"
            >
              View All Discussions
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setNewDiscussionOpen(true)}
              className="gap-1.5 text-xs bg-primary text-primary-foreground cursor-pointer shadow-xs rounded-md"
            >
              <Plus className="h-3.5 w-3.5" />
              Start First Discussion
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const badgeStyle =
              CATEGORY_THEME_BADGES[post.category] ||
              CATEGORY_THEME_BADGES.DISCUSSIONS;

            const postHref = `/forum/${post.slug || post.id}`;
            const coverImage =
              post.coverImageUrl ||
              DEFAULT_CATEGORY_IMAGES[post.category] ||
              DEFAULT_CATEGORY_IMAGES.ALL;

            return (
              <Card
                key={post.id}
                className="group flex flex-col justify-between border border-border bg-card hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-xs rounded-md overflow-hidden"
              >
                {/* Cover Visual Thumbnail with Default Fallback */}
                <div className="relative h-32 w-full overflow-hidden border-b border-border bg-muted/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt={post.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {/* Header Row: Category Badge, Destination & Bookmark */}
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] font-semibold py-0.5 ${badgeStyle}`}>
                          {post.categoryLabel}
                        </Badge>
                        {post.destination && (
                          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground truncate max-w-[120px]">
                            <MapPin className="h-3 w-3 text-primary shrink-0" />
                            <span className="truncate">{post.destination}</span>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(e, post)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          post.hasSaved
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        title={post.hasSaved ? "Remove Bookmark" : "Bookmark Discussion"}
                      >
                        <Bookmark className={`h-3.5 w-3.5 ${post.hasSaved ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Title */}
                    <Link href={postHref} className="block">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Content Excerpt */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Attached Workspace Trip Badge */}
                    {post.linkedTrip && (
                      <div className="flex items-center gap-1.5 rounded-md bg-muted/40 border border-border px-2 py-1 text-[11px] text-foreground">
                        <Compass className="h-3 w-3 text-primary shrink-0" />
                        <span className="font-semibold text-primary truncate max-w-[140px]">
                          {post.linkedTrip.title}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground text-[10px]">
                          {post.linkedTrip.durationDays}d
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Metas & View Thread CTA */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      {/* Author */}
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5 border border-border">
                          {post.authorAvatarUrl && (
                            <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} />
                          )}
                          <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
                            {getAuthorInitials(post.authorName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] font-medium text-foreground truncate max-w-[100px]">
                          {post.authorName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground">{post.createdAt}</span>
                      </div>

                      {/* Social Stats */}
                      <div className="flex items-center gap-2">
                        {/* Upvotes */}
                        <button
                          type="button"
                          onClick={(e) => handleCardUpvote(e, post)}
                          className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                            post.hasUpvoted
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <ThumbsUp className={`h-3 w-3 ${post.hasUpvoted ? "fill-current" : ""}`} />
                          <span>{post.upvotes}</span>
                        </button>

                        {/* Replies */}
                        <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                          <MessageSquare className="h-3 w-3" />
                          <span>{post.repliesCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* View Thread CTA - positioned at bottom right */}
                    <div className="flex items-center justify-end pt-1">
                      <Link
                        href={postHref}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>View Thread</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Start New Discussion Modal */}
      <NewDiscussionDialog
        open={newDiscussionOpen}
        onOpenChange={setNewDiscussionOpen}
        userTrips={userTrips}
        onDiscussionCreated={refreshPosts}
      />
    </div>
  );
}
