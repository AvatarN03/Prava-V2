import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKET = "prava-media";
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Normalizes browser-supplied MIME types and file extensions into standard IANA MIME types
 * supported by Supabase Storage bucket configurations (e.g. image/jpg -> image/jpeg).
 */
export function normalizeMimeType(mimeType: string, filename?: string): string {
  const lowerMime = (mimeType || "").toLowerCase().trim();
  const lowerName = (filename || "").toLowerCase().trim();

  if (
    lowerMime === "image/jpeg" ||
    lowerMime === "image/jpg" ||
    lowerMime === "image/pjpeg" ||
    lowerMime === "image/jfif" ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg")
  ) {
    return "image/jpeg";
  }

  if (
    lowerMime === "image/png" ||
    lowerMime === "image/x-png" ||
    lowerName.endsWith(".png")
  ) {
    return "image/png";
  }

  if (lowerMime === "image/webp" || lowerName.endsWith(".webp")) {
    return "image/webp";
  }

  if (lowerMime === "image/gif" || lowerName.endsWith(".gif")) {
    return "image/gif";
  }

  if (lowerMime === "image/avif" || lowerName.endsWith(".avif")) {
    return "image/avif";
  }

  return lowerMime || "image/jpeg";
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Helper to obtain the best Supabase client for storage operations.
 * Prefers SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY if available to ensure bucket creation and RLS bypass for verified server actions.
 */
async function getStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && secretKey) {
    return createSupabaseClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return await createServerSupabase();
}

/**
 * Ensures the target bucket exists, attempting to create it as public if missing.
 */
async function ensureBucketExists(supabase: SupabaseClient, bucketName: string): Promise<string> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (buckets && buckets.some((b) => b.name === bucketName)) {
      return bucketName;
    }

    // Try creating the requested bucket
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE_BYTES,
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
    });

    if (!createError) {
      return bucketName;
    }

    // If bucket creation failed (e.g., non-admin permissions), check if any public bucket exists
    if (buckets && buckets.length > 0) {
      const publicBucket = buckets.find((b) => b.public) || buckets[0];
      return publicBucket.name;
    }
  } catch (err) {
    console.warn("Bucket verification warning:", err);
  }

  return bucketName;
}

/**
 * Upload an image file buffer to Supabase Storage.
 * Generates a public URL and enforces folder ownership scoping.
 */
export async function uploadImageToStorage(
  file: File | Blob,
  folder: "trips" | "avatars" | "posts" | "community" | "stories",
  userId: string,
  customFilename?: string
): Promise<UploadResult> {
  try {
    const supabase = await getStorageClient();

    // Determine extension and normalize MIME type
    const rawMime = file.type || "";
    const rawName = file instanceof File ? file.name : (customFilename || "");
    const normalizedMime = normalizeMimeType(rawMime, rawName);

    if (!ALLOWED_IMAGE_TYPES.includes(normalizedMime)) {
      return {
        success: false,
        error: "Invalid file type. Allowed formats: JPEG, PNG, WebP, GIF, AVIF.",
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: "File size exceeds the 5MB limit.",
      };
    }

    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/avif": "avif",
    };
    const extension = extMap[normalizedMime] || "jpg";
    const filename = customFilename || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const storagePath = `${folder}/${userId}/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const targetBucket = await ensureBucketExists(supabase, STORAGE_BUCKET);

    const { data, error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(storagePath, buffer, {
        contentType: normalizedMime,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);

      // Fallback: If upload fails on primary bucket, try 'avatars' or fallback bucket
      if (targetBucket !== "avatars" && folder === "avatars") {
        const fallbackBucket = await ensureBucketExists(supabase, "avatars");
        const { data: fbData, error: fbError } = await supabase.storage
          .from(fallbackBucket)
          .upload(storagePath, buffer, {
            contentType: normalizedMime,
            upsert: true,
          });

        if (!fbError && fbData) {
          const { data: publicUrlData } = supabase.storage
            .from(fallbackBucket)
            .getPublicUrl(fbData.path);

          return {
            success: true,
            url: publicUrlData.publicUrl,
            path: fbData.path,
          };
        }
      }

      return {
        success: false,
        error: `Storage upload failed: ${uploadError.message}`,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Unexpected storage error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

/**
 * Delete an image from Supabase Storage by path.
 * Verifies that the path belongs to the given user before deletion.
 */
export async function deleteImageFromStorage(
  storagePath: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getStorageClient();

    // Security check: ensure path belongs to the authenticated user's folder
    const pathParts = storagePath.split("/");
    if (pathParts.length < 2 || pathParts[1] !== userId) {
      return { success: false, error: "Unauthorized path deletion" };
    }

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.error("Supabase Storage delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected storage deletion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete image",
    };
  }
}

