"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBlogPost, updateBlogPost } from "../actions";
import { generateSlug } from "../schema";
import { CoverImage } from "@/components/storage/cover-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe,
  FileText,
  Tag,
  X,
  Link2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "create" ? "Write a Travel Story" : "Edit Story"}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Share your travel experiences, tips, and itinerary insights with the Prava community.
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-sm text-xs ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-destructive/10 border border-destructive/20 text-destructive"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Cover Image */}
      <Card className="border-border shadow-2xs overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Cover Image</CardTitle>
          <CardDescription className="text-xs">
            A compelling cover image will appear at the top of your story.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coverImageUrl ? (
            <div className="relative rounded-sm overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt="Cover"
                className="w-full h-40 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-background/90"
                  onClick={() => setCoverImageUrl("")}
                >
                  <X className="h-3 w-3 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-border h-32 flex items-center justify-center text-xs text-muted-foreground bg-muted/20">
              <div className="text-center space-y-1">
                <p>No cover image set.</p>
                <p className="text-[11px]">Upload an image using the URL field below.</p>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <Input
              type="url"
              placeholder="Or paste an image URL..."
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Core Fields */}
      <Card className="border-border shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" /> Story Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Title *</label>
            <Input
              type="text"
              placeholder="e.g. 10 Days in Japan: A First-Timer's Complete Guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">URL Slug</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-mono select-none">
                /stories/
              </span>
              <Input
                type="text"
                placeholder="auto-generated"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                className="h-9 pl-16 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Excerpt / Summary</label>
            <Textarea
              placeholder="A short summary that appears in discovery listings (max 500 characters)..."
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={500}
              className="text-xs resize-none"
            />
            <p className="text-[11px] text-muted-foreground text-right">{excerpt.length}/500</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Content * (Markdown supported)</label>
            <Textarea
              placeholder={`# Introduction\n\nWrite your travel story here. You can use **bold**, *italic*, ## headings, and - bullet lists.\n\n## Day 1: Arrival\n...`}
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="text-xs font-mono resize-y leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground">
              {content.split(/\s+/).filter(Boolean).length} words · Markdown formatting supported
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tags & Linked Trip */}
      <Card className="border-border shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-primary" /> Tags & Trip Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Tags</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a tag (e.g. japan, solo-travel)"
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
                className="h-8 text-xs px-3"
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
            <p className="text-[11px] text-muted-foreground">{tags.length}/10 tags · Press Enter or click Add</p>
          </div>

          {/* Linked Trip */}
          {userTrips.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <Link2 className="h-3 w-3 text-primary" /> Link to a Trip
              </label>
              <select
                value={linkedTripId}
                onChange={(e) => setLinkedTripId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— No linked trip —</option>
                {userTrips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}{t.destination ? ` · ${t.destination}` : ""}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Link your story to a specific trip itinerary for readers to clone.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-2 border-t border-border bg-muted/10 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => handleSave("DRAFT")}
            disabled={isSaving || !title.trim() || !content.trim()}
          >
            {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
            Save Draft
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs gap-1.5 shadow-xs"
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
  );
}
