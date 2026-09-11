"use client";

import { useState, useRef } from "react";
import { uploadImageAction, updateProfileAvatar } from "@/features/storage/actions";
import { resizeImageToBlob } from "@/lib/utils/image-resize";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
    if (!e.target.files || !e.target.files[0]) return;
    const originalFile = e.target.files[0];

    setIsUploading(true);

    try {
      // Resize 4K or high-res images to moderate resolution (512x512 square crop)
      const optimizedFile = await resizeImageToBlob(originalFile, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.82,
        format: "image/webp",
        squareCrop: true,
      });

      const formData = new FormData();
      formData.append("file", optimizedFile);
      formData.append("folder", "avatars");

      const uploadRes = await uploadImageAction(formData);

      if (uploadRes.success && uploadRes.url) {
        setAvatarUrl(uploadRes.url);
        await updateProfileAvatar(uploadRes.url);
        if (onAvatarUpdated) {
          onAvatarUpdated(uploadRes.url);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("prava-profile-updated"));
        }
        toast.success("Profile photo updated successfully!");
      } else {
        toast.error(uploadRes.error || "Failed to upload avatar image.");
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process image.");
    } finally {
      setIsUploading(false);
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

        {/* Hover Camera Overlay / Uploading Spinner */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity ${isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </div>
      </div>
    </div>
  );
}

