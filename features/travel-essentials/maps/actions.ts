"use server";

import type { EssentialCategory, NearbyEssentialPOI } from "../types";
import {
  type NearbyEssentialsQueryParams,
  nearbyEssentialsQuerySchema,
} from "./schema";

// In-memory cache on the server to prevent redundant Overpass queries
const serverPoiCache = new Map<string, { data: NearbyEssentialPOI[]; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Calculate distance in meters using Haversine formula
 */
function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Builds Overpass QL query string based on requested category and radius
 */
function buildOverpassQuery(
  lat: number,
  lon: number,
  category: EssentialCategory | "all",
  radius: number
): string {
  const r = Math.min(radius, 3500);
  let clauses = "";

  if (category === "atm" || category === "all") {
    clauses += `
      node["amenity"="atm"](around:${r},${lat},${lon});
      node["amenity"="bank"](around:${r},${lat},${lon});
      way["amenity"="bank"](around:${r},${lat},${lon});
    `;
  }

  if (category === "pharmacy" || category === "all") {
    clauses += `
      node["amenity"="pharmacy"](around:${r},${lat},${lon});
      node["amenity"="hospital"](around:${r},${lat},${lon});
      way["amenity"="hospital"](around:${r},${lat},${lon});
      node["amenity"="clinic"](around:${r},${lat},${lon});
    `;
  }

  if (category === "hotel" || category === "all") {
    clauses += `
      node["tourism"="hotel"](around:${r},${lat},${lon});
      way["tourism"="hotel"](around:${r},${lat},${lon});
      node["tourism"="guest_house"](around:${r},${lat},${lon});
      node["tourism"="hostel"](around:${r},${lat},${lon});
    `;
  }

  if (category === "transit" || category === "all") {
    clauses += `
      node["railway"="station"](around:${r},${lat},${lon});
      way["railway"="station"](around:${r},${lat},${lon});
      node["railway"="subway_entrance"](around:${r},${lat},${lon});
      node["amenity"="bus_station"](around:${r},${lat},${lon});
    `;
  }

  if (category === "supermarket" || category === "all") {
    clauses += `
      node["shop"="supermarket"](around:${r},${lat},${lon});
      way["shop"="supermarket"](around:${r},${lat},${lon});
      node["shop"="convenience"](around:${r},${lat},${lon});
    `;
  }

  const limit = category === "all" ? 60 : 35;
  return `[out:json][timeout:7];(${clauses});out center ${limit};`;
}

/**
 * Server Action: Queries nearby travel essentials via spatial Overpass or Google Places
 */
export async function getNearbyEssentialsAction(
  params: NearbyEssentialsQueryParams
): Promise<{ success: boolean; data: NearbyEssentialPOI[]; error?: string }> {
  const validated = nearbyEssentialsQuerySchema.safeParse(params);
  if (!validated.success) {
    return { success: false, data: [], error: "Invalid coordinates or query parameters" };
  }

  const { lat, lon, category, radiusMeters } = validated.data;
  const cacheKey = `${lat.toFixed(3)}_${lon.toFixed(3)}_${category}_${radiusMeters}`;

  // Check cache
  const cached = serverPoiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { success: true, data: cached.data };
  }

  // Future Google Places API Slot (if user configures GOOGLE_MAPS_API_KEY in .env)
  if (process.env.GOOGLE_MAPS_API_KEY) {
    try {
      const googleResults = await fetchGooglePlacesNearby(lat, lon, category, radiusMeters);
      if (googleResults.length > 0) {
        serverPoiCache.set(cacheKey, { data: googleResults, timestamp: Date.now() });
        return { success: true, data: googleResults };
      }
    } catch (err) {
      console.warn("Google Places API error, falling back to OpenStreetMap Overpass:", err);
    }
  }

  // Primary Free Engine: OpenStreetMap Overpass Spatial Radius
  const overpassQuery = buildOverpassQuery(lat, lon, category, radiusMeters);

  const mirrorEndpoints: {
    url: string;
    method: "GET" | "POST";
    headers: Record<string, string>;
    body?: string;
  }[] = [
    {
      url: "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
      method: "POST",
      body: "data=" + encodeURIComponent(overpassQuery),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "PravaTravelCompanion/2.0",
      },
    },
    {
      url: `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`,
      method: "GET",
      headers: {
        "User-Agent": "PravaTravelCompanion/2.0",
      },
    },
  ];

  for (const endpoint of mirrorEndpoints) {
    try {
      const res = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: endpoint.headers,
        body: endpoint.method === "POST" ? endpoint.body : undefined,
        signal: AbortSignal.timeout(6500),
      });

      if (!res.ok) continue;

      const raw = await res.json();
      if (!Array.isArray(raw.elements)) continue;

      const pois: NearbyEssentialPOI[] = raw.elements
        .filter((el: any) => (el.lat || el.center?.lat) && (el.lon || el.center?.lon))
        .map((el: any) => {
          const itemLat = el.lat || el.center.lat;
          const itemLon = el.lon || el.center.lon;
          const tags = el.tags || {};

          let itemCategory: EssentialCategory = "supermarket";
          let categoryLabel = "General Store";

          if (tags.amenity === "atm" || tags.amenity === "bank") {
            itemCategory = "atm";
            categoryLabel = tags.amenity === "atm" ? "24/7 ATM" : "Bank & ATM";
          } else if (
            tags.amenity === "hospital" ||
            tags.amenity === "pharmacy" ||
            tags.amenity === "clinic"
          ) {
            itemCategory = "pharmacy";
            categoryLabel =
              tags.amenity === "hospital"
                ? "Hospital"
                : tags.amenity === "pharmacy"
                ? "Chemist / Pharmacy"
                : "Medical Clinic";
          } else if (
            tags.tourism === "hotel" ||
            tags.tourism === "guest_house" ||
            tags.tourism === "hostel"
          ) {
            itemCategory = "hotel";
            categoryLabel = tags.tourism === "hotel" ? "Hotel" : "Guesthouse / Stay";
          } else if (
            tags.railway === "station" ||
            tags.railway === "subway_entrance" ||
            tags.amenity === "bus_station"
          ) {
            itemCategory = "transit";
            categoryLabel =
              tags.railway === "station"
                ? "Railway Station"
                : tags.railway === "subway_entrance"
                ? "Metro Station"
                : "Bus Station";
          }

          const rawName =
            tags.name ||
            tags.operator ||
            tags.brand ||
            tags["addr:housename"] ||
            `${categoryLabel} Near Location`;

          const addressParts = [
            tags["addr:housenumber"],
            tags["addr:street"],
            tags["addr:suburb"],
            tags["addr:city"],
          ].filter(Boolean);

          const address = addressParts.length > 0 ? addressParts.join(", ") : undefined;
          const distanceMeters = calculateDistanceMeters(lat, lon, itemLat, itemLon);
          const walkingMinutes = Math.max(1, Math.round(distanceMeters / 80));

          return {
            id: `osm-${el.id || Math.random().toString(36).substring(2, 9)}`,
            name: rawName,
            category: itemCategory,
            categoryLabel,
            lat: itemLat,
            lon: itemLon,
            distanceMeters,
            walkingMinutes,
            address,
            openingHours: tags.opening_hours || (tags.amenity === "atm" ? "24 Hours" : undefined),
            phone: tags.phone || tags["contact:phone"] || undefined,
          };
        });

      // Filter by requested category if not "all"
      const filtered = category === "all" ? pois : pois.filter((p) => p.category === category);
      filtered.sort((a, b) => a.distanceMeters - b.distanceMeters);

      if (filtered.length > 0) {
        serverPoiCache.set(cacheKey, { data: filtered, timestamp: Date.now() });
        return { success: true, data: filtered };
      }
    } catch {
      // Try next mirror
    }
  }

  return { success: false, data: [], error: "No nearby amenities found via Overpass" };
}

/**
 * Placeholder helper for Google Places API (New) Nearby Search
 */
async function fetchGooglePlacesNearby(
  lat: number,
  lon: number,
  category: EssentialCategory | "all",
  radius: number
): Promise<NearbyEssentialPOI[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  // Google Place type mapping
  let type = "point_of_interest";
  if (category === "atm") type = "atm";
  if (category === "pharmacy") type = "pharmacy";
  if (category === "hotel") type = "lodging";
  if (category === "transit") type = "transit_station";
  if (category === "supermarket") type = "supermarket";

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${type}&key=${apiKey}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return [];

  const data = await res.json();
  if (!Array.isArray(data.results)) return [];

  return data.results.map((place: any, index: number) => {
    const pLat = place.geometry.location.lat;
    const pLon = place.geometry.location.lng;
    const distanceMeters = calculateDistanceMeters(lat, lon, pLat, pLon);
    const walkingMinutes = Math.max(1, Math.round(distanceMeters / 80));

    return {
      id: `google-${place.place_id || index}`,
      name: place.name,
      category: category === "all" ? "hotel" : category,
      categoryLabel: place.types?.[0]?.replace(/_/g, " ") || "Amenity",
      lat: pLat,
      lon: pLon,
      distanceMeters,
      walkingMinutes,
      address: place.vicinity,
      rating: place.rating,
      openingHours: place.opening_hours?.open_now ? "Open Now" : undefined,
    };
  });
}
