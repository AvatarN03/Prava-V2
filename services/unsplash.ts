/**
 * Unsplash API Service for Trip Cover Imagery
 * Server-side only utility that fetches tour-vibe and destination-aware travel photography.
 */

export interface UnsplashImage {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  photographerName: string;
  photographerUrl: string;
}

// Curated high-res tour-vibe fallback images (used if API key is not configured or rate-limited)
const TOUR_VIBE_FALLBACKS: UnsplashImage[] = [
  {
    id: "fb-1",
    url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1080&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80",
    alt: "Traveler overlooking picturesque European canals",
    photographerName: "Francesca Tirico",
    photographerUrl: "https://unsplash.com/@francescatirico",
  },
  {
    id: "fb-2",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80",
    alt: "Tropical turquoise ocean beach getaway",
    photographerName: "Sean Oulashin",
    photographerUrl: "https://unsplash.com/@oulashin",
  },
  {
    id: "fb-3",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80",
    alt: "Majestic scenic mountain peaks under sunrise glow",
    photographerName: "Kalem Morgan",
    photographerUrl: "https://unsplash.com/@kalemmorgandev",
  },
  {
    id: "fb-4",
    url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1080&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80",
    alt: "Traditional lantern lit historic alleyway in Japan",
    photographerName: "Sorasak",
    photographerUrl: "https://unsplash.com/@sorasak",
  },
  {
    id: "fb-5",
    url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1080&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&q=80",
    alt: "Modern city skyline at sunset",
    photographerName: "Aleksandar Pasaric",
    photographerUrl: "https://unsplash.com/@apasaric",
  },
  {
    id: "fb-6",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80",
    alt: "Scenic glacial lake and alpine forest landscape",
    photographerName: "Bailey Zindel",
    photographerUrl: "https://unsplash.com/@baileyzindel",
  },
  {
    id: "fb-7",
    url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1080&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=300&q=80",
    alt: "Whitewashed coastal Greek island village at sunset",
    photographerName: "Constantin Popp",
    photographerUrl: "https://unsplash.com/@constantinpopp",
  },
  {
    id: "fb-8",
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1080&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=300&q=80",
    alt: "Boat gliding through emerald mountain lake",
    photographerName: "Luca Bravo",
    photographerUrl: "https://unsplash.com/@lucabravo",
  },
  {
    id: "fb-9",
    url: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1080&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=300&q=80",
    alt: "Lush tropical rice terraces and palm trees",
    photographerName: "Ales Krivec",
    photographerUrl: "https://unsplash.com/@aleskrivec",
  },
  {
    id: "fb-10",
    url: "https://images.unsplash.com/photo-1508672019048-805b876b67e2?auto=format&fit=crop&w=1080&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1508672019048-805b876b67e2?auto=format&fit=crop&w=300&q=80",
    alt: "Wanderlust backpacker looking at mountain horizon",
    photographerName: "Sylvia Yang",
    photographerUrl: "https://unsplash.com/@sylviayang",
  },
  {
    id: "fb-11",
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1080&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=300&q=80",
    alt: "Eiffel Tower in romantic Paris morning light",
    photographerName: "Chris Karidis",
    photographerUrl: "https://unsplash.com/@chriskaridis",
  },
  {
    id: "fb-12",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1080&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80",
    alt: "Atmospheric Northern lights glowing over icy mountain landscape",
    photographerName: "Vincent Guth",
    photographerUrl: "https://unsplash.com/@vincentguth",
  },
];

const TOUR_VIBE_KEYWORDS = [
  "travel scenic adventure",
  "wanderlust landscape",
  "vacation destination aesthetic",
  "scenic road trip nature",
  "coastal paradise travel",
  "mountain hike explore",
  "vibrant city travel explore",
  "tourist journey aesthetic",
];

/**
 * Fetch 6 tour-vibe images from Unsplash based on destination or tour themes.
 */
export async function searchTourCoverImages(
  destination?: string | null,
  page: number = 1
): Promise<{ success: boolean; images: UnsplashImage[]; source: "unsplash" | "fallback" }> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  // Build query: If destination given, search destination + tour vibe; otherwise pick randomized tour vibe keywords
  const trimmedDest = destination?.trim();
  const randomVibe = TOUR_VIBE_KEYWORDS[(page - 1 + Math.floor(Math.random() * TOUR_VIBE_KEYWORDS.length)) % TOUR_VIBE_KEYWORDS.length];
  const searchQuery = trimmedDest ? `${trimmedDest} travel ${randomVibe.split(" ")[0]}` : randomVibe;

  if (!accessKey) {
    // If no key configured, return shuffled fallback slice
    const startIndex = ((page - 1) * 6) % TOUR_VIBE_FALLBACKS.length;
    let selected = TOUR_VIBE_FALLBACKS.slice(startIndex, startIndex + 6);
    if (selected.length < 6) {
      selected = [...selected, ...TOUR_VIBE_FALLBACKS.slice(0, 6 - selected.length)];
    }
    return { success: true, images: selected, source: "fallback" };
  }

  try {
    const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      searchQuery
    )}&per_page=6&page=${page}&orientation=landscape`;

    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      next: { revalidate: 3600 }, // Cache 1 hour
    });

    if (!res.ok) {
      console.warn(`Unsplash API returned ${res.status}: ${res.statusText}`);
      const startIndex = ((page - 1) * 6) % TOUR_VIBE_FALLBACKS.length;
      let selected = TOUR_VIBE_FALLBACKS.slice(startIndex, startIndex + 6);
      if (selected.length < 6) {
        selected = [...selected, ...TOUR_VIBE_FALLBACKS.slice(0, 6 - selected.length)];
      }
      return { success: true, images: selected, source: "fallback" };
    }

    const data = await res.json();
    const results = data.results || [];

    if (results.length === 0) {
      const startIndex = ((page - 1) * 6) % TOUR_VIBE_FALLBACKS.length;
      return {
        success: true,
        images: TOUR_VIBE_FALLBACKS.slice(startIndex, startIndex + 6),
        source: "fallback",
      };
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
    const startIndex = ((page - 1) * 6) % TOUR_VIBE_FALLBACKS.length;
    return {
      success: true,
      images: TOUR_VIBE_FALLBACKS.slice(startIndex, startIndex + 6),
      source: "fallback",
    };
  }
}
