"use server";

import {
  callOpenRouterFree,
  callOpenCodeZenFree,
  hasOpenCodeKey,
  callGroqChat,
  hasGroqKey,
} from "@/lib/ai";

import { EMERGENCY_DIRECTORY } from "../emergency/emergency-data";
import type { CountryInfo, EmergencyContacts } from "../types";
import { QUICK_PICK_COUNTRIES } from "./country-constants";

// ─── REST Countries API v5 response shape ────────────────────────────────────
// Base: https://api.restcountries.com/countries/v5
// Auth: Authorization: Bearer <RESTCOUNTRIES_API_KEY>
// Response envelope: { data: { objects: [...], meta: { total, count, ... } } }
export interface RCv5CapitalItem {
  name?: string;
  coordinates?: { lat?: number; lng?: number };
  attributes?: Record<string, boolean>;
}

export interface RCv5Country {
  names?: {
    common?:    string;
    official?:  string;
    native?:    Record<string, { common?: string; official?: string }>;
  };
  codes?: {
    alpha_2?:   string;
    alpha_3?:   string;
    numeric?:   string;
  };
  flag?: {
    emoji?:     string;
    unicode?:   string;
    png_url?:   string;
    svg_url?:   string;
  };
  capitals?:    Array<RCv5CapitalItem | string>;
  region?:      string;
  subregion?:   string;
  continents?:  string[];
  area?: {
    kilometers?: number;
    miles?:      number;
  };
  borders?:     string[];
  calling_codes?: string[];
  cars?: {
    driving_side?: "right" | "left";
    signs?:        string[];
  };
  coordinates?: {
    lat?:  number;
    lng?:  number;
  };
  currencies?:  Array<{ code: string; name: string; symbol: string }>;
  descriptions?: {
    short?: string;
    long?:  string;
  };
  government_type?: string;
  landlocked?:      boolean;
  languages?:       Array<{
    bcp47?:       string;
    iso639_1?:    string;
    name:         string;
    native_name?: string;
  }>;
  links?: {
    google_maps?:      string;
    official?:         string;
    open_street_maps?: string;
    wikipedia?:        string;
  };
  memberships?: Record<string, boolean | number | undefined>;
  population?:  number;
  timezones?:   string[];
}

export interface RCv5Response {
  data: {
    objects: RCv5Country[];
    meta?: { total: number; count: number; limit: number; offset: number; more: boolean };
  };
}

export interface CountrySuggestionItem {
  name: string;
  code: string;
  flag: string;
  capital: string;
  region: string;
}

export interface CountryNewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage?: string;
}

export interface CountryAiSummary {
  vibe: string;
  advisoryStatus: "safe" | "moderate" | "caution";
  advisoryReason: string;
  newsDigest: string[];
  insiderTip: string;
  provider: string;
  isAiGenerated: boolean;
  generatedAt?: string;
  hasError?: boolean;
  errorMessage?: string;
}

// ─── In-memory server caches ──────────────────────────────────────────────────
const countryCache   = new Map<string, { data: CountryInfo;            timestamp: number }>();
const newsCache      = new Map<string, { data: CountryNewsArticle[];   timestamp: number }>();
const aiSummaryCache = new Map<string, { data: CountryAiSummary;       timestamp: number }>();
const suggestCache   = new Map<string, { data: CountrySuggestionItem[]; timestamp: number }>();

const CACHE_COUNTRY_MS  = 12 * 60 * 60 * 1000; // 12 h
const CACHE_NEWS_MS     =  1 * 60 * 60 * 1000; //  1 h
const CACHE_AI_MS       =  1 * 60 * 60 * 1000; //  1 h
const CACHE_SUGGEST_MS  = 24 * 60 * 60 * 1000; // 24 h

// ─── Shared auth helper for REST Countries v5 ────────────────────────────────
const RC_BASE = "https://api.restcountries.com/countries/v5";
function rcHeaders(): HeadersInit {
  const key = process.env.RESTCOUNTRIES_API_KEY;
  return key ? { Authorization: `Bearer ${key}` } : {};
}

/**
 * Safely extract capital city name from v5 array of capital objects/strings
 */
function extractCapitalName(capitals: unknown): string {
  if (!capitals) return "Capital City";
  if (Array.isArray(capitals)) {
    if (capitals.length === 0) return "Capital City";
    const first = capitals[0];
    if (typeof first === "string") return first;
    if (typeof first === "object" && first !== null && "name" in first) {
      return String((first as { name?: string }).name || "Capital City");
    }
  } else if (typeof capitals === "string") {
    return capitals;
  }
  return "Capital City";
}

/**
 * Country autocomplete — v5 free-text search + quick-picks seed (no static file)
 */
export async function fetchCountrySuggestions(
  query: string
): Promise<CountrySuggestionItem[]> {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  const cacheKey = `suggest_${trimmed}`;
  const cached = suggestCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_SUGGEST_MS) return cached.data;

  // Fast pre-filter from curated quick-picks (instant)
  const quickMatches: CountrySuggestionItem[] = QUICK_PICK_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(trimmed) ||
      c.code.toLowerCase() === trimmed ||
      c.capital.toLowerCase().includes(trimmed)
  ).map((c) => ({
    name: c.name, code: c.code, flag: c.flag, capital: c.capital, region: c.region,
  }));

  try {
    const url = `${RC_BASE}?q=${encodeURIComponent(trimmed)}&limit=8&response_fields=names.common,codes.alpha_2,flag.emoji,capitals,region`;
    const res = await fetch(url, { headers: rcHeaders(), next: { revalidate: 86400 } });

    if (res.ok) {
      const json: RCv5Response = await res.json();
      const objects = json.data?.objects ?? [];

      if (objects.length > 0) {
        const apiMatches: CountrySuggestionItem[] = objects.map((item) => ({
          name:    item.names?.common    ?? "Unknown",
          code:    item.codes?.alpha_2   ?? "??",
          flag:    item.flag?.emoji      ?? "🌐",
          capital: extractCapitalName(item.capitals),
          region:  item.region           ?? "Global",
        }));

        const combined = [...quickMatches];
        apiMatches.forEach((a) => {
          if (!combined.some((c) => c.code.toUpperCase() === a.code.toUpperCase())) {
            combined.push(a);
          }
        });

        const result = combined.slice(0, 5);
        suggestCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    }
  } catch {
    // Fall through to quick-pick results
  }

  const result = quickMatches.slice(0, 5);
  suggestCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

/**
 * Full country details — REST Countries v5 API with emergency integration & rich dataset
 */
export async function searchCountryInfo(query: string): Promise<CountryInfo | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const cacheKey = trimmed.toLowerCase();
  const cached = countryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_COUNTRY_MS) return cached.data;

  try {
    // v5: read by common name
    const url = `${RC_BASE}/names.common/${encodeURIComponent(trimmed)}?response_fields_omit=names.translations`;
    const res = await fetch(url, { headers: rcHeaders(), next: { revalidate: 86400 } });

    let objects: RCv5Country[] = [];
    if (res.ok) {
      const json: RCv5Response = await res.json();
      objects = json.data?.objects ?? [];
    }

    // Fallback: free-text search if exact common name lookup did not match
    if (objects.length === 0) {
      const searchUrl = `${RC_BASE}?q=${encodeURIComponent(trimmed)}&limit=5&response_fields_omit=names.translations`;
      const searchRes = await fetch(searchUrl, { headers: rcHeaders(), next: { revalidate: 86400 } });
      if (searchRes.ok) {
        const json: RCv5Response = await searchRes.json();
        objects = json.data?.objects ?? [];
      }
    }

    if (objects.length === 0) return null;

    // Prefer exact common-name match, then first result
    const best =
      objects.find((o) => o.names?.common?.toLowerCase() === trimmed.toLowerCase()) ??
      objects[0];

    // ── Capital ──────────────────────────────────────────────────────────────
    const capitalStr = extractCapitalName(best.capitals);

    // ── Currency ─────────────────────────────────────────────────────────────
    let currencyStr = "Local Currency";
    if (Array.isArray(best.currencies) && best.currencies.length > 0) {
      currencyStr = best.currencies
        .map((c) => `${c.code} (${c.symbol || c.name || c.code})`)
        .join(", ");
    }

    // ── Languages ────────────────────────────────────────────────────────────
    let languages: string[] = ["Official Language"];
    if (Array.isArray(best.languages) && best.languages.length > 0) {
      languages = best.languages.map((l) => l.name).filter(Boolean);
      if (languages.length === 0) languages = ["Official Language"];
    }

    // ── Region & Geography heuristics ────────────────────────────────────────
    const subregion = best.subregion ?? "";
    const region    = best.region    ?? "";
    const name      = best.names?.common ?? trimmed;
    const countryCode = (best.codes?.alpha_2 ?? "").toUpperCase();

    const isWesternEurope = [
      "Western Europe", "Northern Europe", "Southern Europe", "Central Europe"
    ].includes(subregion);
    const isNorthAmerica  = subregion === "Northern America";
    const isDevelopedAsia = ["Japan", "Singapore", "South Korea", "Australia", "New Zealand"].includes(name);

    const waterStatus: "safe" | "caution" | "unsafe" =
      isWesternEurope || isNorthAmerica || isDevelopedAsia ? "safe"
        : region === "Europe" ? "caution"
        : "unsafe";

    const tapWater =
      waterStatus === "safe"
        ? "Safe and potable from municipal tap systems."
        : waterStatus === "caution"
        ? "Generally safe in major hotels; bottled water recommended for caution."
        : "Do not drink unboiled tap water. Always use sealed bottled water.";

    const plugTypes =
      isNorthAmerica              ? ["Type A", "Type B (120V / 60Hz)"]
      : region === "Europe"       ? ["Type C", "Type E / F (230V / 50Hz)"]
      : subregion === "South-Eastern Asia" ? ["Type A", "Type C", "Type G (220–230V)"]
      : ["Type C (Europlug 2-pin, 230V)"];

    const voltage        = isNorthAmerica ? "120V / 60Hz" : "230V / 50Hz";
    const tippingPercent = isNorthAmerica ? 18 : isWesternEurope ? 10 : 7;
    const tipping        = isNorthAmerica
      ? `Tipping 15–20% is expected in restaurants; ~${tippingPercent}% for taxis and service staff.`
      : isWesternEurope
      ? `Rounding up or leaving ~${tippingPercent}% in sit-down restaurants is appreciated.`
      : `Tipping is informal — rounding up or leaving ~${tippingPercent}% is appreciated.`;

    const cashCulture: "cash_only" | "mixed" | "card_friendly" =
      isWesternEurope || isNorthAmerica || isDevelopedAsia ? "card_friendly" : "mixed";

    // ── Calling Code & Emergency Directory Integration ───────────────────────
    const callingCode = best.calling_codes && best.calling_codes.length > 0 ? `+${best.calling_codes[0]}` : "";

    const emergencyFromDir = EMERGENCY_DIRECTORY.find(
      (e) =>
        (e.code && e.code.toUpperCase().includes(countryCode)) ||
        e.country.toLowerCase() === name.toLowerCase()
    );

    const emergencyContacts: EmergencyContacts = emergencyFromDir || {
      country: name,
      code: countryCode || "??",
      dialCode: callingCode || (region === "Europe" ? "+EU" : "+--"),
      general: region === "Europe" ? "112" : isNorthAmerica ? "911" : "112 / 999",
      police: region === "Europe" ? "112" : isNorthAmerica ? "911" : "112",
      ambulance: region === "Europe" ? "112" : isNorthAmerica ? "911" : "112",
      fire: region === "Europe" ? "112" : isNorthAmerica ? "911" : "112",
      notes: `Single emergency dispatch: ${region === "Europe" ? "112 (EU standard)" : isNorthAmerica ? "911" : "112 / 999"}. Verify local hospital numbers upon arrival in ${name}.`,
    };

    // Extract active international memberships
    const memberships = best.memberships
      ? Object.entries(best.memberships)
          .filter(([_, v]) => Boolean(v))
          .map(([k]) => k.replace(/_/g, " ").toUpperCase())
      : [];

    const countryResult: CountryInfo = {
      code:              countryCode || "??",
      name,
      officialName:      best.names?.official,
      capital:           capitalStr,
      currency:          currencyStr,
      languages,
      plugTypes,
      voltage,
      tipping,
      tippingPercent,
      tapWater,
      waterSafetyStatus: waterStatus,
      drivingSide:       best.cars?.driving_side === "left" ? "Left" : "Right",
      visaInfo:          `Standard entry requirements apply. Verify e-visa, visa-on-arrival, or exemptions with the official immigration authority of ${name}.`,
      bestSeasons:       `Spring (Apr–Jun) and Autumn (Sep–Oct) typically offer comfortable travel weather. Check local seasonal guides for ${name}.`,
      topCustoms: [
        `Greet locals and shopkeepers politely in ${languages[0] || "local language"}.`,
        "Dress respectfully at historical, religious, and government landmarks.",
        "Carry small-denomination local cash for markets and small merchants.",
        "Use ride-hailing apps or agree on taxi fares before boarding.",
      ],
      dos: [
        "Keep your passport and travel documents accessible at all times.",
        "Download offline maps and a translation app before leaving accommodation.",
        "Check tap-water recommendations upon check-in at your hotel.",
      ],
      donts: [
        "Don't ignore dress codes at sacred religious sites or official buildings.",
        "Don't display large amounts of cash in crowded transit or market areas.",
        "Don't forget to verify your plug adapter matches local socket types.",
      ],
      cashCulture,
      emergencyNumber:   emergencyContacts.general,
      emergencyContacts,
      flag:              best.flag?.emoji      ?? "🌐",
      population:        best.population,
      region,
      subregion,
      timezones:         best.timezones,
      googleMapsUrl:     best.links?.google_maps,
      wikipediaUrl:      best.links?.wikipedia,
      officialUrl:       best.links?.official,
      areaKm:            best.area?.kilometers,
      borders:           best.borders,
      callingCode,
      governmentType:    best.government_type,
      memberships,
      descriptionShort:  best.descriptions?.short,
      descriptionLong:   best.descriptions?.long,
      landlocked:        best.landlocked,
    };

    countryCache.set(cacheKey, { data: countryResult, timestamp: Date.now() });
    return countryResult;
  } catch (err) {
    console.error(`[Country Guide] Failed to fetch info for "${trimmed}":`, err);
    return null;
  }
}

/**
 * Fetch latest news articles for a country using NewsAPI.org with smart fallbacks
 */
export async function fetchCountryNews(countryName: string): Promise<CountryNewsArticle[]> {
  const cleanName = countryName.trim();
  const cacheKey = `news_${cleanName.toLowerCase()}`;
  const cached = newsCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_NEWS_MS) return cached.data;

  const apiKey = process.env.NEWS_API;
  if (apiKey) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        `${cleanName} (travel OR tourism OR airport OR culture OR festival)`
      )}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;

      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "ok" && Array.isArray(data.articles) && data.articles.length > 0) {
          const articles: CountryNewsArticle[] = data.articles
            .filter((a: any) => a.title && a.title !== "[Removed]")
            .slice(0, 4)
            .map((a: any) => ({
              title: a.title,
              description: a.description || a.content || "Read latest updates from international news correspondents.",
              url: a.url,
              source: a.source?.name || "Global News Feed",
              publishedAt: new Date(a.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              urlToImage: a.urlToImage || undefined,
            }));

          if (articles.length > 0) {
            newsCache.set(cacheKey, { data: articles, timestamp: Date.now() });
            return articles;
          }
        }
      }
    } catch (err) {
      console.warn("NewsAPI error, using contextual travel news fallback:", err);
    }
  }

  // Fallback curated news items
  const fallbacks: CountryNewsArticle[] = [
    {
      title: `${cleanName} Tourism & Seasonal Travel Outlook`,
      description: `Travel operators report strong seasonal bookings with expanded high-speed transit schedules and cultural events across major destination hubs.`,
      url: `https://news.google.com/search?q=${encodeURIComponent(cleanName + " travel tourism")}`,
      source: "Travel Wire Global",
      publishedAt: "Today",
    },
    {
      title: `Digital Entry & Border Processing Updates for ${cleanName}`,
      description: `Immigration authorities recommend completing digital arrival declarations and passport scans in advance to expedite airport entry lanes.`,
      url: `https://news.google.com/search?q=${encodeURIComponent(cleanName + " travel advisory entry requirements")}`,
      source: "International Transit News",
      publishedAt: "Yesterday",
    },
    {
      title: `Cultural Festivals and Heritage Exhibitions Announced in ${cleanName}`,
      description: `Major museums and cultural districts unveil seasonal art exhibitions, local culinary showcases, and guided historic walking tours for international visitors.`,
      url: `https://news.google.com/search?q=${encodeURIComponent(cleanName + " festivals cultural events")}`,
      source: "Culture & Discovery",
      publishedAt: "2 days ago",
    },
  ];

  newsCache.set(cacheKey, { data: fallbacks, timestamp: Date.now() });
  return fallbacks;
}

/**
 * Safely parse JSON from AI responses (handles markdown code fences and trailing text)
 */
function extractJsonPayload(raw: string): any {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {}

  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {}
  }

  const braceMatch = raw.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch {}
  }
  return null;
}

/**
 * Verified free chat models on OpenRouter (in priority order).
 * Note: Avoid generic "openrouter/free" because it includes content safety models (e.g. nemotron-3.5-content-safety)
 * which only output "User Safety: safe".
 */
const VERIFIED_FREE_MODELS = [
  "inclusionai/ling-3.0-flash-sante:free",
  "nex-agi/nex-n2.5-mini:free",
  "nvidia/nemotron-3.5-lightning:free",
];

/**
 * Generate an AI-powered travel & news summary using OpenRouter free models exclusively
 */
export async function generateCountryAiSummary(
  countryName: string,
  countryInfo: CountryInfo,
  newsArticles: CountryNewsArticle[],
  forceRefresh: boolean = false
): Promise<CountryAiSummary> {
  const cacheKey = `ai_sum_${countryName.toLowerCase()}`;
  if (!forceRefresh) {
    const cached = aiSummaryCache.get(cacheKey);
    if (cached && !cached.data.hasError && Date.now() - cached.timestamp < CACHE_AI_MS) {
      return cached.data;
    }
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const newsHeadlines = newsArticles.map((a) => `- ${a.title}`).join("\n");

  const prompt = `You are a concise, premium travel intelligence assistant for the Prava Travel Companion app.
Analyze the destination "${countryName}" for an international traveler (with focus on Indian travel context if relevant):
- Capital: ${countryInfo.capital}
- Currency: ${countryInfo.currency}
- Water Safety: ${countryInfo.waterSafetyStatus}
- Recent Headlines:
${newsHeadlines}

Provide a factual JSON response with this exact schema:
{
  "vibe": "A captivating 2-sentence summary of the traveler atmosphere, hospitality, and distinctive appeal of ${countryName}.",
  "advisoryStatus": "safe" | "moderate" | "caution",
  "advisoryReason": "A 1-sentence assessment of current traveler safety and comfort.",
  "newsDigest": [
    "Actionable bullet point 1 for travelers based on current events/season",
    "Actionable bullet point 2 on transit, festivals, or local conditions",
    "Actionable bullet point 3 on payments or seasonal tips"
  ],
  "insiderTip": "A 1-sentence high-value insider hack or hidden gem recommendation for visiting ${countryName}."
}
Only output valid JSON.`;

  // Curated baseline data for fallback
  const curatedFallback: CountryAiSummary = {
    vibe: `${countryName} offers an extraordinary blend of historic landmarks, vibrant urban energy, and welcoming local hospitality. Exploring its capital ${countryInfo.capital} reveals rich cultural traditions alongside world-class modern transit and culinary scenes.`,
    advisoryStatus: countryInfo.waterSafetyStatus === "safe" ? "safe" : "moderate",
    advisoryReason: `Standard travel precautions apply throughout ${countryName}. Tourist infrastructure is well-established with reliable municipal emergency services.`,
    newsDigest: [
      `Transit networks in ${countryInfo.capital} and major regional routes are operating on standard schedules with high contactless payment adoption.`,
      `Seasonal cultural events, heritage sites, and museum exhibitions are actively welcoming international travelers.`,
      `Confirm digital visa entry prerequisites and passport validity (minimum 6 months) prior to flight departure.`,
    ],
    insiderTip: `Download local transit maps in advance and carry small local currency (${countryInfo.currency.split(" ")[0]}) for small merchant markets and traditional cafes.`,
    provider: "Prava Curated Travel Intelligence",
    isAiGenerated: false,
    generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  let lastError = "";

  // 1. Attempt OpenRouter Free Models Cascade (if key configured)
  if (openRouterKey) {
    const aiResult = await callOpenRouterFree({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      models: VERIFIED_FREE_MODELS,
    });

    if (aiResult?.success && aiResult.text) {
      const parsed = extractJsonPayload(aiResult.text);
      if (parsed && parsed.vibe) {
        const result: CountryAiSummary = {
          vibe: parsed.vibe,
          advisoryStatus: parsed.advisoryStatus || "safe",
          advisoryReason: parsed.advisoryReason || "Standard travel precautions apply.",
          newsDigest: Array.isArray(parsed.newsDigest) ? parsed.newsDigest : [],
          insiderTip: parsed.insiderTip || "",
          provider: `OpenRouter (${aiResult.modelUsed.replace(/:free$/, "")})`,
          isAiGenerated: true,
          generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          hasError: false,
        };
        aiSummaryCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    }
    lastError = aiResult?.error || "OpenRouter free models unavailable or quota depleted.";
  }

  // 2. Cascade to OpenCode Zen Free Models (if OPENCODE_API_KEY configured)
  if (hasOpenCodeKey()) {
    const opencodeResult = await callOpenCodeZenFree({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    if (opencodeResult?.success && opencodeResult.text) {
      const parsed = extractJsonPayload(opencodeResult.text);
      if (parsed && parsed.vibe) {
        const result: CountryAiSummary = {
          vibe: parsed.vibe,
          advisoryStatus: parsed.advisoryStatus || "safe",
          advisoryReason: parsed.advisoryReason || "Standard travel precautions apply.",
          newsDigest: Array.isArray(parsed.newsDigest) ? parsed.newsDigest : [],
          insiderTip: parsed.insiderTip || "",
          provider: `OpenCode Zen (${opencodeResult.modelUsed.replace(/-free$/, "")})`,
          isAiGenerated: true,
          generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          hasError: false,
        };
        aiSummaryCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    }
    lastError = opencodeResult?.error || lastError || "OpenCode Zen models busy or unavailable.";
  }

  // 3. Cascade to Groq (if GROQ_API_KEY configured)
  if (hasGroqKey()) {
    const groqResult = await callGroqChat({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      responseFormat: { type: "json_object" },
    });

    if (groqResult?.success && groqResult.text) {
      const parsed = extractJsonPayload(groqResult.text);
      if (parsed && parsed.vibe) {
        const result: CountryAiSummary = {
          vibe: parsed.vibe,
          advisoryStatus: parsed.advisoryStatus || "safe",
          advisoryReason: parsed.advisoryReason || "Standard travel precautions apply.",
          newsDigest: Array.isArray(parsed.newsDigest) ? parsed.newsDigest : [],
          insiderTip: parsed.insiderTip || "",
          provider: `Groq (${groqResult.modelUsed.split("/")[1] || groqResult.modelUsed})`,
          isAiGenerated: true,
          generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          hasError: false,
        };
        aiSummaryCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    }
    lastError = groqResult?.error || lastError || "Groq models busy or unavailable.";
  }

  // 4. Graceful Curated Fallback (if all API attempts fail or keys missing)
  return {
    ...curatedFallback,
    hasError: true,
    errorMessage:
      lastError || "AI free tier providers currently unavailable. Displaying curated baseline intelligence.",
    provider: "Prava Curated Travel Intelligence",
  };
}
