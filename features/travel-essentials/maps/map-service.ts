import { getNearbyEssentialsAction } from "./actions";

import type {
  EssentialCategory,
  MapLocationSuggestion,
  NearbyEssentialPOI,
} from "../types";

export type { EssentialCategory, MapLocationSuggestion, NearbyEssentialPOI };

// In-memory caches to reduce network calls and prevent memory leaks
const suggestionsCache = new Map<string, { data: MapLocationSuggestion[]; timestamp: number }>();
const nearbyCache = new Map<string, { data: NearbyEssentialPOI[]; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Calculate distance between two coordinates in meters using the Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
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
 * Format meters to human readable distance (e.g., 250 m or 1.2 km)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Fetch debounced location autocomplete suggestions from OpenStreetMap Nominatim
 * Prioritizes Indian cities and regions
 */
export async function fetchMapLocationSuggestions(
  query: string
): Promise<MapLocationSuggestion[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length < 3) return [];

  // Check cache
  const cached = suggestionsCache.get(cleanQuery);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cleanQuery
    )}&format=json&addressdetails=1&countrycodes=in&limit=8`;

    let res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "PravaTravelCompanion/2.0",
      },
    });

    let data = res.ok ? await res.json() : [];

    // If no Indian results found or query is global, query without countrycodes constraint
    if (!Array.isArray(data) || data.length === 0) {
      const globalUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        cleanQuery
      )}&format=json&addressdetails=1&limit=6`;
      res = await fetch(globalUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": "PravaTravelCompanion/2.0",
        },
      });
      data = res.ok ? await res.json() : [];
    }

    if (!Array.isArray(data) || data.length === 0) {
      return getFallbackSuggestions(cleanQuery);
    }

    const suggestions: MapLocationSuggestion[] = data.map((item: any) => {
      const parts = (item.display_name || "").split(",");
      const shortName = parts[0]?.trim() || item.name || cleanQuery;
      const secondaryText = parts.slice(1, 3).map((p: string) => p.trim()).join(", ");

      return {
        displayName: item.display_name,
        shortName,
        secondaryText,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type || item.class || "place",
      };
    });

    suggestionsCache.set(cleanQuery, { data: suggestions, timestamp: Date.now() });
    return suggestions;
  } catch (error) {
    console.error("Error fetching map suggestions:", error);
    return getFallbackSuggestions(cleanQuery);
  }
}

/**
 * Reverse geocode GPS coordinates to a friendly location name
 */
export async function reverseGeocodeLocation(
  lat: number,
  lon: number
): Promise<{ shortName: string; fullName: string }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "PravaTravelCompanion/2.0",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const parts = (data.display_name || "").split(",");
      const short = parts.slice(0, 2).map((s: string) => s.trim()).join(", ");
      return {
        shortName: short || "My Location",
        fullName: data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      };
    }
  } catch (err) {
    console.error("Error reverse geocoding:", err);
  }

  return {
    shortName: "My Device Location",
    fullName: `Coordinates: ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`,
  };
}

/**
 * Curated authentic Indian landmark POIs for major travel hubs
 */
const VERIFIED_INDIAN_POIS: Record<string, NearbyEssentialPOI[]> = {
  mumbai: [
    {
      id: "mum-hotel-taj",
      name: "The Taj Mahal Palace",
      category: "hotel",
      categoryLabel: "Heritage Luxury Hotel",
      lat: 18.9217,
      lon: 72.8332,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Apollo Bunder, Colaba, Mumbai",
      openingHours: "24/7 Front Desk & Concierge",
      phone: "+91 22 6665 3366",
    },
    {
      id: "mum-hotel-oberoi",
      name: "The Oberoi Mumbai",
      category: "hotel",
      categoryLabel: "5-Star Hotel",
      lat: 18.9272,
      lon: 72.8205,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Nariman Point, Marine Drive, Mumbai",
      openingHours: "24/7 Check-in",
      phone: "+91 22 6632 5757",
    },
    {
      id: "mum-hotel-trident",
      name: "Trident Hotel Bandra Kurla",
      category: "hotel",
      categoryLabel: "Business Hotel",
      lat: 19.0664,
      lon: 72.8687,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "C-56, G Block, BKC, Bandra East, Mumbai",
      openingHours: "24/7 Front Desk",
    },
    {
      id: "mum-hotel-jw",
      name: "JW Marriott Mumbai Juhu",
      category: "hotel",
      categoryLabel: "Beachfront Resort Hotel",
      lat: 19.1026,
      lon: 72.8263,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Juhu Tara Road, Juhu, Mumbai",
      openingHours: "24/7 Check-in",
    },
    {
      id: "mum-med-lilavati",
      name: "Lilavati Hospital & Research Centre",
      category: "pharmacy",
      categoryLabel: "Multi-Speciality Hospital",
      lat: 19.0514,
      lon: 72.8290,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "A-791, Bandra Reclamation, Bandra West, Mumbai",
      openingHours: "24/7 Emergency & Casualty",
      phone: "+91 22 2675 1000",
    },
    {
      id: "mum-med-breachcandy",
      name: "Breach Candy Hospital",
      category: "pharmacy",
      categoryLabel: "Premier Medical Centre",
      lat: 18.9715,
      lon: 72.8055,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "60 A, Bhulabhai Desai Road, Mumbai",
      openingHours: "24/7 Emergency Services",
      phone: "+91 22 2366 7788",
    },
    {
      id: "mum-med-kem",
      name: "KEM Hospital & Medical College",
      category: "pharmacy",
      categoryLabel: "Government Super-Speciality Hospital",
      lat: 19.0028,
      lon: 72.8432,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Acharya Donde Marg, Parel, Mumbai",
      openingHours: "24/7 Trauma & Emergency",
    },
    {
      id: "mum-med-chemist",
      name: "Apollo Pharmacy 24/7",
      category: "pharmacy",
      categoryLabel: "24-Hour Chemist",
      lat: 19.0178,
      lon: 72.8478,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Dr. Ambedkar Road, Dadar TT, Mumbai",
      openingHours: "Open 24 Hours",
    },
    {
      id: "mum-tran-csmt",
      name: "Chhatrapati Shivaji Maharaj Terminus (CSMT)",
      category: "transit",
      categoryLabel: "UNESCO World Heritage Rail Terminal",
      lat: 18.9401,
      lon: 72.8354,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Fort, Mumbai",
      openingHours: "24/7 Suburban & Express Rail Services",
    },
    {
      id: "mum-tran-churchgate",
      name: "Churchgate Railway Station",
      category: "transit",
      categoryLabel: "Western Railway Terminus",
      lat: 18.9322,
      lon: 72.8267,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Maharshi Karve Road, Churchgate, Mumbai",
      openingHours: "4:00 AM - 1:30 AM",
    },
    {
      id: "mum-tran-dadar",
      name: "Dadar Railway Junction",
      category: "transit",
      categoryLabel: "Central & Western Interchange",
      lat: 19.0178,
      lon: 72.8430,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Dadar West, Mumbai",
      openingHours: "24/7 Rail Services",
    },
    {
      id: "mum-tran-airport",
      name: "CSM International Airport Terminal 2 (BOM)",
      category: "transit",
      categoryLabel: "International Airport",
      lat: 19.0886,
      lon: 72.8679,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Sahar, Andheri East, Mumbai",
      openingHours: "24/7 Flight Operations",
    },
    {
      id: "mum-atm-sbi",
      name: "State Bank of India (SBI) Main Branch & ATM",
      category: "atm",
      categoryLabel: "National Bank & 24/7 ATM",
      lat: 18.9320,
      lon: 72.8335,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Samachar Marg, Fort, Mumbai",
      openingHours: "24/7 ATM Services",
    },
    {
      id: "mum-atm-hdfc",
      name: "HDFC Bank ATM Hub",
      category: "atm",
      categoryLabel: "24/7 ATM & Cash Deposit",
      lat: 19.0585,
      lon: 72.8320,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Hill Road, Bandra West, Mumbai",
      openingHours: "24/7 Cash Access",
    },
    {
      id: "mum-shop-naturesbasket",
      name: "Nature's Basket Gourmet Store",
      category: "supermarket",
      categoryLabel: "Gourmet Supermarket",
      lat: 19.0610,
      lon: 72.8315,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Turner Road, Bandra West, Mumbai",
      openingHours: "8:00 AM - 10:30 PM",
    },
    {
      id: "mum-shop-dmart",
      name: "D-Mart Ready Supermarket",
      category: "supermarket",
      categoryLabel: "Daily Essentials Store",
      lat: 19.0200,
      lon: 72.8440,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Gokhale Road, Dadar West, Mumbai",
      openingHours: "8:00 AM - 10:00 PM",
    },
  ],
  delhi: [
    {
      id: "del-hotel-imperial",
      name: "The Imperial New Delhi",
      category: "hotel",
      categoryLabel: "Heritage Luxury Hotel",
      lat: 28.6238,
      lon: 77.2185,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Janpath, Connaught Place, New Delhi",
      openingHours: "24/7 Check-in",
    },
    {
      id: "del-med-aiims",
      name: "AIIMS New Delhi",
      category: "pharmacy",
      categoryLabel: "Apex Medical Hospital",
      lat: 28.5672,
      lon: 77.2100,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi",
      openingHours: "24/7 Emergency & Trauma",
    },
    {
      id: "del-tran-ndls",
      name: "New Delhi Railway Station (NDLS)",
      category: "transit",
      categoryLabel: "Central Rail Terminal & Airport Express",
      lat: 28.6427,
      lon: 77.2195,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Bhavbhuti Marg, Ratan Lal Market, New Delhi",
      openingHours: "24/7 Rail & Metro",
    },
    {
      id: "del-tran-cp",
      name: "Rajiv Chowk Metro Station",
      category: "transit",
      categoryLabel: "Delhi Metro Interchange Hub",
      lat: 28.6328,
      lon: 77.2197,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "Connaught Place, New Delhi",
      openingHours: "5:30 AM - 11:30 PM",
    },
    {
      id: "del-atm-sbi",
      name: "State Bank of India Parliament Street",
      category: "atm",
      categoryLabel: "Bank & 24/7 ATM",
      lat: 28.6250,
      lon: 77.2140,
      distanceMeters: 0,
      walkingMinutes: 1,
      address: "11 Parliament Street, New Delhi",
      openingHours: "24/7 ATM",
    },
  ],
};

/**
 * Fetch nearby travel essentials (Hotels, Hospitals/Medical, Transit, ATMs, Stores)
 * Queries server-side spatial Overpass engine (or Google Places if configured)
 * with graceful fallback to closest verified landmarks.
 */
export async function fetchNearbyTravelEssentials(
  lat: number,
  lon: number,
  category: EssentialCategory | "all" = "all",
  radiusMeters: number = 2500
): Promise<NearbyEssentialPOI[]> {
  const cacheKey = `${lat.toFixed(3)}_${lon.toFixed(3)}_${category}`;
  const cached = nearbyCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 1. Query server action with spatial radius queries across fast mirrors
  try {
    const res = await getNearbyEssentialsAction({
      lat,
      lon,
      category,
      radiusMeters,
    });

    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      nearbyCache.set(cacheKey, { data: res.data, timestamp: Date.now() });
      return res.data;
    }
  } catch (err) {
    console.warn("Server action nearby essentials lookup error:", err);
  }

  // 2. Fallback: If offline or remote Overpass mirrors fail, compute distance to verified landmarks
  const allVerified = [
    ...VERIFIED_INDIAN_POIS.mumbai,
    ...VERIFIED_INDIAN_POIS.delhi,
  ];

  const fallback = allVerified
    .map((poi) => {
      const distanceMeters = calculateDistanceMeters(lat, lon, poi.lat, poi.lon);
      const walkingMinutes = Math.max(1, Math.round(distanceMeters / 80));
      return {
        ...poi,
        distanceMeters,
        walkingMinutes,
      };
    })
    .filter((poi) => category === "all" || poi.category === category)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  nearbyCache.set(cacheKey, { data: fallback, timestamp: Date.now() });
  return fallback;
}

function getFallbackSuggestions(query: string): MapLocationSuggestion[] {
  const list = [
    { name: "Mumbai, Maharashtra, India", lat: 19.0760, lon: 72.8777, country: "India" },
    { name: "New Delhi, Delhi, India", lat: 28.6139, lon: 77.2090, country: "India" },
    { name: "Bengaluru, Karnataka, India", lat: 12.9716, lon: 77.5946, country: "India" },
    { name: "Goa (Panaji), India", lat: 15.4909, lon: 73.8278, country: "India" },
    { name: "Jaipur, Rajasthan, India", lat: 26.9124, lon: 75.7873, country: "India" },
    { name: "Kochi, Kerala, India", lat: 9.9312, lon: 76.2673, country: "India" },
    { name: "Manali, Himachal Pradesh, India", lat: 32.2432, lon: 77.1892, country: "India" },
    { name: "Varanasi, Uttar Pradesh, India", lat: 25.3176, lon: 82.9739, country: "India" },
    { name: "Kolkata, West Bengal, India", lat: 22.5726, lon: 88.3639, country: "India" },
    { name: "Hyderabad, Telangana, India", lat: 17.3850, lon: 78.4867, country: "India" },
    { name: "Chennai, Tamil Nadu, India", lat: 13.0827, lon: 80.2707, country: "India" },
    { name: "Dubai, UAE", lat: 25.2048, lon: 55.2708, country: "United Arab Emirates" },
    { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503, country: "Japan" },
    { name: "London, UK", lat: 51.5074, lon: -0.1278, country: "United Kingdom" },
  ];

  const q = query.toLowerCase();
  return list
    .filter((l) => l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q))
    .map((l) => ({
      displayName: l.name,
      shortName: l.name.split(",")[0],
      secondaryText: l.name.split(",").slice(1).join(",").trim(),
      lat: l.lat,
      lon: l.lon,
      type: "city",
    }));
}
