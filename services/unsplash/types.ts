export interface UnsplashImage {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  photographerName: string;
  photographerUrl: string;
}

export interface UnsplashSearchResult {
  success: boolean;
  images: UnsplashImage[];
  source: "unsplash" | "fallback";
}
