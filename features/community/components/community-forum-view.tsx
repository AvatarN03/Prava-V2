"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Globe,
  MapPin,
  Sparkles,
  Copy,
  Search,
  Plus,
  LayoutGrid,
  Route,
  Package,
  Radio,
  BookmarkCheck,
  Pin,
  ArrowRight,
  Users,
  TrendingUp,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ForumPost, ForumCategory } from "../forum-types";
import { FORUM_CATEGORIES, SEED_FORUM_POSTS } from "../forum-data";
import { ForumThreadDialog } from "./forum-thread-dialog";
import { NewDiscussionDialog } from "./new-discussion-dialog";

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  ALL: LayoutGrid,
  ROUTE_ADVICE: Route,
  RECOMMENDATIONS: Sparkles,
  PACKING_GEAR: Package,
  LIVE_REPORTS: Radio,
  TEMPLATES: BookmarkCheck,
  DISCUSSIONS: MessageSquare,
};

const CATEGORY_COLORS: Record<string, string> = {
  ROUTE_ADVICE: "bg-blue-100 text-blue-800 border-blue-200",
  RECOMMENDATIONS: "bg-amber-100 text-amber-800 border-amber-200",
  PACKING_GEAR: "bg-violet-100 text-violet-800 border-violet-200",
  LIVE_REPORTS: "bg-rose-100 text-rose-800 border-rose-200",
  TEMPLATES: "bg-emerald-100 text-emerald-800 border-emerald-200",
  DISCUSSIONS: "bg-sky-100 text-sky-800 border-sky-200",
  ALL: "bg-slate-100 text-slate-700 border-slate-200",
};

export function CommunityForumView() {
  const [activeCategory, setActiveCategory] = useState<ForumCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<ForumPost[]>(SEED_FORUM_POSTS);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [newDiscussionOpen, setNewDiscussionOpen] = useState(false);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "ALL" || post.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        (post.destination && post.destination.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  const openThread = (post: ForumPost) => {
    setSelectedPost(post);
    setThreadOpen(true);
  };

  const handlePostUpdate = (updated: ForumPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPost(updated);
  };

  const handleNewPost = (newPost: ForumPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <>
      <div className="space-y-6 pb-16">
        {/* ── Hero Header ── */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1279CE] via-[#2D9BF0] to-[#55B8FF] p-7 shadow-md shadow-[#2D9BF0]/30">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 left-24 h-36 w-36 rounded-full bg-white/5 blur-xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-xs">
                  <Users className="h-4 w-4 text-white" />
                </span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-sky-100">
                  Prava Community Forum
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Travel Together. Plan Smarter.
              </h1>
              <p className="text-sm text-sky-100/90 max-w-xl leading-relaxed">
                Ask for route advice, share hidden gems, discover live trip reports, clone
                community itineraries, and connect with verified travel creators.
              </p>

              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {posts.length} Active Discussions
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  {posts.filter((p) => p.linkedTrip).length} Itineraries Shared
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  <Globe className="h-3.5 w-3.5" />
                  Verified Creators
                </div>
              </div>
            </div>

            <Button
              onClick={() => setNewDiscussionOpen(true)}
              className="bg-white hover:bg-sky-50 text-[#1279CE] font-bold text-sm h-11 px-6 rounded-xl shadow-lg gap-2 cursor-pointer shrink-0 transition-all"
            >
              <Plus className="h-4 w-4" />
              Start a Discussion
            </Button>
          </div>
        </div>

        {/* ── Category Filter Pills ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {FORUM_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat.id];
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as ForumCategory)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#2D9BF0] border-[#2D9BF0] text-white shadow-sm shadow-[#2D9BF0]/30"
                    : `${CATEGORY_COLORS[cat.id]} hover:opacity-80`
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Search Bar ── */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search discussions, destinations, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl border-slate-200 text-sm bg-white"
          />
        </div>

        {/* ── Forum Posts Grid ── */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-slate-500">
            <MessageSquare className="h-10 w-10 mx-auto text-slate-300" />
            <p className="font-semibold">No discussions found</p>
            <p className="text-xs text-slate-400">Try a different search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPosts.map((post) => {
              const catColor =
                CATEGORY_COLORS[post.category] || CATEGORY_COLORS.ALL;

              return (
                <article
                  key={post.id}
                  className="group relative bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-sky-300 hover:shadow-sm transition-all duration-200 overflow-hidden"
                >
                  {post.isPinned && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                      <Pin className="h-3 w-3" /> Pinned
                    </div>
                  )}

                  {/* Cover image */}
                  {post.coverImageUrl && (
                    <div className="h-32 w-full overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-bold border ${catColor} shadow-xs`}
                        >
                          {post.categoryLabel}
                        </Badge>
                        {post.destination && (
                          <span className="flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-white">
                            <MapPin className="h-3 w-3 text-sky-300" />
                            {post.destination}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    {/* Top metadata row (no cover image only) */}
                    {!post.coverImageUrl && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-bold border ${catColor}`}
                        >
                          {post.categoryLabel}
                        </Badge>
                        {post.destination && (
                          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <MapPin className="h-3 w-3 text-[#2D9BF0]" />
                            {post.destination}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h2
                      className="text-base font-bold text-slate-900 group-hover:text-[#2D9BF0] transition-colors leading-snug line-clamp-2 cursor-pointer"
                      onClick={() => openThread(post)}
                    >
                      {post.title}
                    </h2>

                    {/* Snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {post.content.slice(0, 200)}
                      {post.content.length > 200 && "..."}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Linked Trip teaser */}
                    {post.linkedTrip && (
                      <div className="rounded-xl border border-sky-200/80 bg-gradient-to-r from-sky-50/60 to-white p-3 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Sparkles className="h-3.5 w-3.5 text-[#2D9BF0] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-extrabold text-sky-900 truncate">
                              {post.linkedTrip.title}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {post.linkedTrip.durationDays}d •{" "}
                              {post.linkedTrip.activityCount} activities
                              {post.linkedTrip.estimatedBudget &&
                                ` • ${post.linkedTrip.estimatedBudget}`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openThread(post)}
                          className="shrink-0 flex items-center gap-1 rounded-lg bg-[#2D9BF0] hover:bg-[#1A82D2] px-3 py-1.5 text-[10px] font-bold text-white transition-all cursor-pointer"
                        >
                          <Copy className="h-3 w-3" />
                          Clone
                        </button>
                      </div>
                    )}

                    <Separator className="bg-slate-100" />

                    {/* Footer: Author + Stats */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      {/* Author */}
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-7 w-7 border border-sky-100 shadow-2xs">
                          {post.authorAvatarUrl && (
                            <AvatarImage
                              src={post.authorAvatarUrl}
                              alt={post.authorName}
                            />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-[#2D9BF0] to-[#55B8FF] text-white text-[10px] font-bold">
                            {post.authorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {post.authorName}
                            </span>
                            {post.isCreatorPublic && (
                              <span className="flex items-center gap-0.5 rounded-full bg-sky-50 border border-sky-200 px-1.5 py-0.2 text-[9px] font-bold text-sky-700">
                                <CheckCircle2 className="h-2.5 w-2.5 text-sky-600" />
                                Creator
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">{post.createdAt}</p>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 text-slate-500 shrink-0">
                        <span className="flex items-center gap-1 text-xs font-semibold">
                          <ThumbsUp className="h-3.5 w-3.5 text-[#2D9BF0]" />
                          {post.upvotes}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold">
                          <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                          {post.repliesCount}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold">
                          <Eye className="h-3.5 w-3.5 text-slate-300" />
                          {post.views}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openThread(post)}
                          className="h-8 rounded-xl text-xs font-semibold text-[#2D9BF0] hover:bg-sky-50 gap-1 cursor-pointer px-2.5"
                        >
                          View Thread
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Forum Thread Dialog */}
      <ForumThreadDialog
        post={selectedPost}
        open={threadOpen}
        onOpenChange={setThreadOpen}
        onPostUpdate={handlePostUpdate}
      />

      {/* New Discussion Dialog */}
      <NewDiscussionDialog
        open={newDiscussionOpen}
        onOpenChange={setNewDiscussionOpen}
        onCreated={handleNewPost}
      />
    </>
  );
}
