/**
 * Client-side Image Resizing & Optimization Utility.
 * Converts large/4K images down to moderate resolution (e.g., 512x512 for avatars)
 * before uploading to Supabase Storage, saving bandwidth and preventing file size limit errors.
 */

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1 (default 0.82)
  format?: "image/webp" | "image/jpeg" | "image/png";
  squareCrop?: boolean; // Center-crop to 1:1 aspect ratio for avatars
}

/**
 * Resizes an image File or Blob to moderate resolution on an HTML Canvas.
 * Returns a new optimized File object.
 */
export async function resizeImageToBlob(
  file: File,
  options: ResizeOptions = {}
): Promise<File> {
  const {
    maxWidth = 512,
    maxHeight = 512,
    quality = 0.82,
    format = "image/webp",
    squareCrop = true,
  } = options;

  return new Promise((resolve, reject) => {
    // Check if running in browser
    if (typeof window === "undefined" || typeof document === "undefined") {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image."));

      img.onload = () => {
        let srcX = 0;
        let srcY = 0;
        let srcWidth = img.naturalWidth || img.width;
        let srcHeight = img.naturalHeight || img.height;

        let destWidth = srcWidth;
        let destHeight = srcHeight;

        if (squareCrop) {
          // Center crop to 1:1 ratio
          const minDim = Math.min(srcWidth, srcHeight);
          srcX = (srcWidth - minDim) / 2;
          srcY = (srcHeight - minDim) / 2;
          srcWidth = minDim;
          srcHeight = minDim;

          destWidth = Math.min(minDim, maxWidth);
          destHeight = Math.min(minDim, maxHeight);
        } else {
          // Proportional scaling
          if (destWidth > maxWidth) {
            destHeight = Math.round((destHeight * maxWidth) / destWidth);
            destWidth = maxWidth;
          }
          if (destHeight > maxHeight) {
            destWidth = Math.round((destWidth * maxHeight) / destHeight);
            destHeight = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = destWidth;
        canvas.height = destHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Canvas 2D context not available."));
        }

        // Apply high quality bicubic/bilinear smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
          img,
          srcX,
          srcY,
          srcWidth,
          srcHeight,
          0,
          0,
          destWidth,
          destHeight
        );

        // Determine output mime type (fallback to image/jpeg if webp not supported)
        const targetMime =
          format === "image/webp" && canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0
            ? "image/webp"
            : "image/jpeg";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Failed to compress image canvas."));
            }

            const ext = targetMime === "image/webp" ? "webp" : "jpg";
            const originalBaseName = file.name.replace(/\.[^/.]+$/, "");
            const newFilename = `${originalBaseName}-optimized.${ext}`;

            const resizedFile = new File([blob], newFilename, {
              type: targetMime,
              lastModified: Date.now(),
            });

            resolve(resizedFile);
          },
          targetMime,
          quality
        );
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
