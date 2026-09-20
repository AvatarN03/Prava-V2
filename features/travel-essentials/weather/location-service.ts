"use client";

import type { WeatherData } from "../types";

const WEATHER_CACHE_KEY = "prava_cached_weather";
const LOCATION_CACHE_KEY = "prava_detected_location";
const WEATHER_UPDATE_EVENT = "prava-weather-updated";

export interface DetectedLocation {
  city: string;
  country?: string;
  lat?: number;
  lon?: number;
  source: "ip" | "gps" | "default";
}

/**
 * Maps WMO weather code (0-99) or OpenWeather code to OpenWeather standard icon string.
 */
export function mapWeatherToIconCode(weatherCode?: number, weatherIcon?: string): string {
  if (weatherIcon && weatherIcon.length >= 2) {
    return weatherIcon;
  }

  if (weatherCode === undefined || weatherCode === null) {
    return "01d";
  }

  // WMO Code mapping
  switch (weatherCode) {
    case 0:
      return "01d"; // Clear sky
    case 1:
      return "02d"; // Mainly clear / few clouds
    case 2:
      return "03d"; // Partly cloudy
    case 3:
      return "04d"; // Overcast
    case 45:
    case 48:
      return "50d"; // Fog
    case 51:
    case 53:
    case 55:
      return "09d"; // Drizzle
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return "10d"; // Rain
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return "13d"; // Snow
    case 95:
    case 96:
    case 99:
      return "11d"; // Thunderstorm
    default:
      return "02d";
  }
}

/**
 * Returns high-resolution OpenWeather CDN cloud-theme icon URL
 */
export function getWeatherIconUrl(weatherIcon?: string, weatherCode?: number): string {
  const code = mapWeatherToIconCode(weatherCode, weatherIcon);
  return `https://openweathermap.org/img/wn/${code}@2x.png`;
}

/**
 * Silently detects user's location via Network IP lookup (zero browser permissions required).
 * Caches result in localStorage for 2 hours to avoid redundant requests.
 */
export async function detectLocationViaIP(): Promise<DetectedLocation> {
  if (typeof window === "undefined") {
    return { city: "Mumbai", country: "India", source: "default" };
  }

  // 1. Check local cache
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const isFresh = Date.now() - (parsed.timestamp || 0) < 2 * 60 * 60 * 1000; // 2 hours
      if (isFresh && parsed.city) {
        return {
          city: parsed.city,
          country: parsed.country,
          lat: parsed.lat,
          lon: parsed.lon,
          source: "ip",
        };
      }
    }
  } catch {
    // Ignore cache parse errors
  }

  // 2. Perform silent IP-to-City lookup
  try {
    // ipwho.is is a free, high-limit, SSL-secured IP geolocation API with no registration required
    const res = await fetch("https://ipwho.is/", {
      signal: AbortSignal.timeout(3500),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.city) {
        const result: DetectedLocation = {
          city: data.city,
          country: data.country || "India",
          lat: data.latitude,
          lon: data.longitude,
          source: "ip",
        };

        try {
          localStorage.setItem(
            LOCATION_CACHE_KEY,
            JSON.stringify({ ...result, timestamp: Date.now() })
          );
        } catch {
          // Ignore storage errors
        }

        return result;
      }
    }
  } catch (err) {
    console.warn("Silent IP location lookup skipped or timed out, trying fallback:", err);
  }

  // 3. Fallback: Deduce from client's browser timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Kolkata") || tz.includes("Calcutta")) {
      return { city: "Mumbai", country: "India", source: "default" };
    }
    if (tz.includes("London")) {
      return { city: "London", country: "United Kingdom", source: "default" };
    }
    if (tz.includes("New_York")) {
      return { city: "New York", country: "United States", source: "default" };
    }
    if (tz.includes("Tokyo")) {
      return { city: "Tokyo", country: "Japan", source: "default" };
    }
    if (tz.includes("Dubai")) {
      return { city: "Dubai", country: "United Arab Emirates", source: "default" };
    }
  } catch {
    // Ignore timezone detection error
  }

  return { city: "Mumbai", country: "India", source: "default" };
}

/**
 * On-demand device GPS detection via HTML5 navigator.geolocation (prompts user for permission).
 */
export async function detectLocationViaGPS(): Promise<{ lat: number; lon: number } | null> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Geolocation prompt rejected or failed:", error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Broadcasts weather updates across the workspace (TopBar header, Weather View, etc.)
 */
export function broadcastWeatherUpdate(data: WeatherData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // Ignore storage errors
  }

  window.dispatchEvent(
    new CustomEvent(WEATHER_UPDATE_EVENT, { detail: data })
  );
}

/**
 * Subscribes to app-wide weather updates
 */
export function listenWeatherUpdate(handler: (data: WeatherData) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<WeatherData>;
    if (customEvent.detail) {
      handler(customEvent.detail);
    }
  };

  window.addEventListener(WEATHER_UPDATE_EVENT, listener);
  return () => window.removeEventListener(WEATHER_UPDATE_EVENT, listener);
}

/**
 * Retrieves cached weather from localStorage (valid for up to 45 minutes)
 */
export function getCachedWeather(): WeatherData | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    const isFresh = Date.now() - (parsed.timestamp || 0) < 45 * 60 * 1000; // 45 minutes
    return isFresh && parsed.data ? parsed.data : null;
  } catch {
    return null;
  }
}
