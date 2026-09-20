"use client";

import { useState, useRef } from "react";

import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { uploadImageAction, updateProfileAvatar } from "@/features/storage/actions";
import { resizeImageToBlob } from "@/lib/utils/image-resize";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  name?: string | null;
  onAvatarUpdated?: (url: string | null) => void;
  size?: "sm" | "md" | "lg";
}

export function AvatarUpload({
  currentAvatarUrl,
  name,
  onAvatarUpdated,
  size = "md",
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses =
    size === "lg"
      ? "h-20 w-20 text-xl"
      : size === "sm"
        ? "h-9 w-9 text-xs"
        : "h-14 w-14 text-base";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB raw)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    try {
      setIsUploading(true);

      // Client-side downscale avatar to 512x512 square crop WebP/JPEG
      const resizedBlob = await resizeImageToBlob(file, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.85,
        format: "image/webp",
      });

      const formData = new FormData();
      formData.append("file", resizedBlob, "avatar.webp");
      formData.append("folder", "avatars");

      const res = await uploadImageAction(formData);

      if (res.success && res.url) {
        setAvatarUrl(res.url);
        if (onAvatarUpdated) {
          onAvatarUpdated(res.url);
        }

        // Auto-save to profile
        const updateRes = await updateProfileAvatar(res.url);
        if (updateRes.success) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("prava-profile-updated"));
          }
          toast.success("Profile photo updated");
        } else {
          toast.error("Failed to sync photo with profile record");
        }
      } else {
        toast.error(res.error || "Failed to upload image");
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Error processing image file");
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be picked again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getInitials = (n?: string | null) => {
    if (!n) return "U";
    return n
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative inline-block group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative ${sizeClasses} rounded-full overflow-hidden border border-border bg-muted/60 flex items-center justify-center font-bold text-foreground cursor-pointer shadow-xs`}
        title="Change profile photo"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name || "User Avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}

        {/* Hover Camera Overlay / Uploading Spinner (Desktop) */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity ${
            isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Mobile-only Camera Edit Badge: visible only on small screens without needing hover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!isUploading) fileInputRef.current?.click();
        }}
        disabled={isUploading}
        aria-label="Change profile photo"
        className={`sm:hidden absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-xs cursor-pointer active:scale-95 transition-transform ${
          size === "sm" ? "h-4.5 w-4.5" : "h-6 w-6"
        }`}
      >
        {isUploading ? (
          <Loader2 className={size === "sm" ? "h-2 w-2 animate-spin" : "h-2.5 w-2.5 animate-spin"} />
        ) : (
          <Camera className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
        )}
      </button>
    </div>
  );
}
