"use client";

import { useRef, useState } from "react";
import { AlertCircle, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImageAction } from "@/features/storage/actions";
import { resizeImageToBlob } from "@/lib/utils/image-resize";

interface ImageUploadProps {
  folder?: "trips" | "avatars" | "posts" | "community" | "stories";
  currentImageUrl?: string | null;
  onUploaded: (url: string) => void;
  onRemoved?: () => void;
  className?: string;
  aspectRatio?: "video" | "square" | "banner";
  label?: string;
}

export function ImageUpload({
  folder = "trips",
  currentImageUrl,
  onUploaded,
  onRemoved,
  className = "",
  aspectRatio = "video",
  label,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prevImageUrl, setPrevImageUrl] = useState(currentImageUrl);
  if (currentImageUrl !== prevImageUrl) {
    setPrevImageUrl(currentImageUrl);
    setPreview(currentImageUrl || null);
  }

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "banner"
      ? "aspect-[3/1]"
      : "aspect-video";

  const handleFileChange = async (file: File) => {
    if (!file) return;

    setError(null);
    setIsUploading(true);

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      // Client-side optimize large non-GIF images to reduce payload size and speed up upload
      let fileToUpload = file;
      const isGif = file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
      if (!isGif) {
        try {
          const isAvatar = folder === "avatars" || aspectRatio === "square";
          fileToUpload = await resizeImageToBlob(file, {
            maxWidth: isAvatar ? 512 : 1920,
            maxHeight: isAvatar ? 512 : 1080,
            quality: 0.85,
            format: "image/webp",
            squareCrop: isAvatar,
          });
        } catch (resizeErr) {
          console.warn("Client-side image resize skipped, using original file:", resizeErr);
          fileToUpload = file;
        }
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("folder", folder);

      const res = await uploadImageAction(formData);

      if (res.success && res.url) {
        setPreview(res.url);
        onUploaded(res.url);
      } else {
        setError(res.error || "Upload failed");
        setPreview(currentImageUrl || null);
      }
    } catch {
      setError("An unexpected error occurred during upload.");
      setPreview(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemoved) {
      onRemoved();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-xs font-semibold text-foreground">{label}</label>}

      {error && (
        <div className="flex items-center gap-2 rounded-xs bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex ${aspectClass} w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border-2 border-dashed transition-all ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png,.webp,.gif,.avif"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {preview ? (
          <div className="relative h-full w-full group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 text-xs shadow-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Change Image
              </Button>
              {onRemoved && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs shadow-xs"
                  onClick={handleRemove}
                >
                  <X className="h-3 w-3 mr-1" /> Remove
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
            </div>
            <div className="text-xs font-semibold text-foreground">
              {isUploading ? "Uploading image..." : "Click or drag to upload"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              JPEG, PNG, WebP, GIF up to 5MB
            </p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs font-medium text-foreground">Uploading to Supabase...</span>
          </div>
        )}
      </div>
    </div>
  );
}
