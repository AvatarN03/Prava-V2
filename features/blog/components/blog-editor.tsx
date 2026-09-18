"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Globe,
  Link2,
  Loader2,
  Tag,
  X,
} from "lucide-react";

import { ImageUpload } from "@/components/storage/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createBlogPost, updateBlogPost } from "../actions";
import { generateSlug } from "../schema";

interface BlogEditorProps {
  mode: "create" | "edit";
  postId?: string;
  initialData?: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImageUrl: string | null;
    tags: string[];
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    linkedTripId: string | null;
  };
  userTrips?: { id: string; title: string; destination: string | null }[];
}

export function BlogEditor({ mode, postId, initialData, userTrips = [] }: BlogEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [linkedTripId, setLinkedTripId] = useState(initialData?.linkedTripId || "");
  const [isSaving, startSaving] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleTitleBlur = () => {
    if (!slug && title) {
      setSlug(generateSlug(title));
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSave = (status: "DRAFT" | "PUBLISHED") => {
    setMessage(null);
    startSaving(async () => {
      const data = {
        title,
        slug: slug || generateSlug(title),
        excerpt: excerpt || null,
        content,
        coverImageUrl: coverImageUrl || null,
        tags,
        status,
        linkedTripId: linkedTripId || null,
      };

      const res =
        mode === "create"
          ? await createBlogPost(data)
          : await updateBlogPost(postId!, data);

      if (res.success && res.post) {
        setMessage({
          type: "success",
          text: status === "PUBLISHED" ? "Story published!" : "Draft saved.",
        });
        if (mode === "create") {
          router.push(`/stories/manage`);
        }
      } else {
        setMessage({ type: "error", text: res.error || "Failed to save." });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
      {/* Back Navigation */}
      <Link
        href="/stories"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Stories
      </Link>

      {/* Top Header Banner */}
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <BookOpen className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Travel Stories & Guides
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {mode === "create" ? "Write a Travel Story" : "Edit Story"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share your travel experiences, recommendations, and itinerary insights with the Prava community.
          </p>
        </div>

        {/* Top Quick Actions (Desktop & Mobile) */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 cursor-pointer"
            onClick={() => handleSave("DRAFT")}
            disabled={isSaving || !title.trim() || !content.trim()}
          >
            {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
            Save Draft
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs gap-1.5 shadow-xs cursor-pointer"
            onClick={() => handleSave("PUBLISHED")}
            disabled={isSaving || !title.trim() || !content.trim()}
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Globe className="h-3 w-3" />
            )}
            Publish Story
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-md text-xs ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border border-destructive/20 text-destructive"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout: Left (Details & Markdown) | Right (Cover, Tags, Trip Link) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Details, Description & Markdown Content) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          <Card className="border-border shadow-2xs rounded-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" /> Story Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Title *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 10 Days in Japan: A First-Timer's Complete Guide"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  URL Slug
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-mono select-none">
                    /stories/
                  </span>
                  <Input
                    type="text"
                    placeholder="auto-generated"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                    }
                    className="h-9 pl-16 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Excerpt / Summary
                </label>
                <Textarea
                  placeholder="A short summary that appears in discovery listings (max 500 characters)..."
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  maxLength={500}
                  className="text-xs resize-none leading-relaxed"
                />
                <p className="text-[11px] text-muted-foreground text-right">
                  {excerpt.length}/500
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Content * (Markdown supported)
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {content.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <Textarea
                  placeholder={`# Introduction\n\nWrite your travel story here. You can use **bold**, *italic*, ## headings, and - bullet lists.\n\n## Day 1: Arrival in Tokyo\n...`}
                  rows={18}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="text-xs font-mono resize-y leading-relaxed min-h-[360px]"
                />
                <p className="text-[11px] text-muted-foreground">
                  Markdown formatting is supported. Use ## for sections, - for bullet lists, and **text** for bold.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Cover Image, Tags, Linked Trip, and Actions) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-20">
          {/* Cover Image Upload Card */}
          <Card className="border-border shadow-2xs rounded-md overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Cover Image</CardTitle>
              <CardDescription className="text-xs">
                Visual header that will appear at the top of your story and in feeds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                folder="stories"
                currentImageUrl={coverImageUrl || undefined}
                onUploaded={(url: string) => setCoverImageUrl(url)}
                onRemoved={() => setCoverImageUrl("")}
              />
            </CardContent>
          </Card>

          {/* Tags & Trip Link Card */}
          <Card className="border-border shadow-2xs rounded-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" /> Tags & Trip Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tags</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g. japan, solo-travel"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs px-3 cursor-pointer"
                    onClick={addTag}
                    disabled={tags.length >= 10}
                  >
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[11px] gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      >
                        #{tag} <X className="h-2.5 w-2.5" />
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">
                  {tags.length}/10 tags · Press Enter or click Add
                </p>
              </div>

              {/* Linked Trip */}
              {userTrips.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <Link2 className="h-3 w-3 text-primary" /> Link Workspace Trip
                  </label>
                  <select
                    value={linkedTripId}
                    onChange={(e) => setLinkedTripId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  >
                    <option value="">— No linked trip —</option>
                    {userTrips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                        {t.destination ? ` · ${t.destination}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    Readers can 1-click clone this trip itinerary directly into their workspace.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-border bg-muted/10 p-3 rounded-b-md">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 cursor-pointer"
                onClick={() => handleSave("DRAFT")}
                disabled={isSaving || !title.trim() || !content.trim()}
              >
                {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                Save Draft
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 text-xs gap-1.5 shadow-xs cursor-pointer"
                onClick={() => handleSave("PUBLISHED")}
                disabled={isSaving || !title.trim() || !content.trim()}
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Globe className="h-3 w-3" />
                )}
                Publish Story
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
