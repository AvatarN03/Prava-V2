"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateTripCoverImage } from "@/features/storage/actions";
import { ImageUpload } from "./image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Camera,
  ImageIcon,
  MapPin,
  Trash2,
  Loader2,
} from "lucide-react";

interface CoverImageProps {
  tripId?: string;
  coverImageUrl?: string | null;
  title: string;
  destination?: string | null;
  isEditable?: boolean;
  className?: string;
}

export function CoverImage({
  tripId,
  coverImageUrl: initialCoverImageUrl,
  title,
  destination,
  isEditable = false,
  className = "",
}: CoverImageProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverImageUrl || null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleUploaded = async (url: string) => {
    setCoverUrl(url);
    if (tripId) {
      await updateTripCoverImage(tripId, url);
    }
    setIsDialogOpen(false);
  };

  const handleRemove = async () => {
    if (!tripId) return;
    setIsRemoving(true);
    try {
      await updateTripCoverImage(tripId, null);
      setCoverUrl(null);
      setIsDialogOpen(false);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <div
        className={`relative w-full overflow-hidden rounded-md border border-border bg-muted/40 ${className}`}
      >
        {coverUrl ? (
          <div className="relative h-44 sm:h-56 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          </div>
        ) : (
          <div className="relative h-32 sm:h-40 w-full bg-gradient-to-r from-sky-100 via-sky-50 to-slate-100 dark:from-sky-950 dark:via-background dark:to-slate-900 flex items-center justify-between px-6">
            <div className="space-y-1">
              {destination && (
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{destination}</span>
                </div>
              )}
              <h2 className="text-lg font-bold text-foreground tracking-tight line-clamp-1">
                {title}
              </h2>
            </div>
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-background/60 text-primary/70">
              <ImageIcon className="h-6 w-6" />
            </div>
          </div>
        )}

        {/* Change Cover Button (if editable) */}
        {isEditable && tripId && (
          <div className="absolute right-3 top-3 z-10">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="h-7 gap-1.5 bg-background/80 hover:bg-background backdrop-blur-xs text-xs font-medium shadow-xs border border-border/80"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{coverUrl ? "Change Cover" : "Add Cover"}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      {isEditable && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Trip Cover Image
              </DialogTitle>
              <DialogDescription className="text-xs">
                Upload a cover banner for {title} to display in your workspace and community.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <ImageUpload
                folder="trips"
                currentImageUrl={coverUrl}
                aspectRatio="banner"
                onUploaded={handleUploaded}
                onRemoved={coverUrl ? handleRemove : undefined}
              />
            </div>

            {coverUrl && (
              <div className="flex justify-end pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10"
                >
                  {isRemoving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                  )}
                  Remove Cover Image
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
