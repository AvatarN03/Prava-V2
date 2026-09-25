import { TOUR_VIBES, TOUR_VIBE_FALLBACKS } from "./constants";
import type { UnsplashImage, UnsplashSearchResult } from "./types";

export * from "./constants";
export * from "./types";

/**
 * Returns a 6-item slice of tour-vibe fallbacks for the given page.
 */
export function getFallbackCoverImages(page: number = 1): UnsplashImage[] {
  const startIndex = ((page - 1) * 6) % TOUR_VIBE_FALLBACKS.length;
  const slice = TOUR_VIBE_FALLBACKS.slice(startIndex, startIndex + 6);
  return slice.length < 6 ? [...slice, ...TOUR_VIBE_FALLBACKS.slice(0, 6 - slice.length)] : slice;
}

/**
 * Fetch 6 tour-vibe images from Unsplash based on destination or tour themes.
 */
export async function searchTourCoverImages(
  destination?: string | null,
  page: number = 1
): Promise<UnsplashSearchResult> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const trimmedDest = destination?.trim();

  // If no destination or no access key configured, return instant curated fallbacks
  if (!trimmedDest || !accessKey) {
    return { success: true, images: getFallbackCoverImages(page), source: "fallback" };
  }

  const vibe = TOUR_VIBES[(page - 1) % TOUR_VIBES.length];
  const searchQuery = `${trimmedDest} ${vibe}`;

  try {
    const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      searchQuery
    )}&per_page=6&page=${page}&orientation=landscape`;

    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`Unsplash API returned ${res.status}: ${res.statusText}`);
      return { success: true, images: getFallbackCoverImages(page), source: "fallback" };
    }

    const data = await res.json();
    const results = data.results || [];

    if (results.length === 0) {
      return { success: true, images: getFallbackCoverImages(page), source: "fallback" };
    }

    const formattedImages: UnsplashImage[] = results.map((item: any) => ({
      id: item.id,
      url: `${item.urls.raw}&auto=format&fit=crop&w=1080&q=80`,
      thumbUrl: `${item.urls.raw}&auto=format&fit=crop&w=360&q=80`,
      alt: item.alt_description || item.description || "Travel trip cover photography",
      photographerName: item.user?.name || "Unsplash Creator",
      photographerUrl: item.user?.links?.html || "https://unsplash.com",
    }));

    return { success: true, images: formattedImages, source: "unsplash" };
  } catch (error) {
    console.error("Error fetching Unsplash photos:", error);
    return { success: true, images: getFallbackCoverImages(page), source: "fallback" };
  }
}
