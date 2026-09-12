"use client";

import Link from "next/link";

import { Edit3, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface StoryHeaderActionsProps {
  slug: string;
  isAuthor?: boolean;
}

export function StoryHeaderActions({ slug, isAuthor }: StoryHeaderActionsProps) {
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Story link copied to clipboard!");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="h-8 text-xs gap-1.5 border-border text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>Share</span>
      </Button>

      {isAuthor && (
        <Link href={`/stories/${slug}/edit`}>
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Story</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
