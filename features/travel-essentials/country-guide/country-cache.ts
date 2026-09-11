"use client";

import type { CountryInfo } from "../types";
import type { CountryAiSummary, CountryNewsArticle } from "./country-service";

const AI_CACHE_PREFIX = "prava_cg_ai_v2_";
const NEWS_CACHE_PREFIX = "prava_cg_news_v2_";
const COUNTRY_CACHE_PREFIX = "prava_cg_info_v2_";

const AI_TTL_MS = 24 * 60 * 60 * 1000;       // 24 hours
const NEWS_TTL_MS = 2 * 60 * 60 * 1000;      // 2 hours
const COUNTRY_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory fallback if localStorage is unavailable (SSR, private browsing, quota limits)
const memoryStore = new Map<string, { data: any; expiresAt: number }>();

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const testKey = "__prava_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function getItem<T>(key: string): T | null {
  const now = Date.now();

  // Try localStorage first
  if (isLocalStorageAvailable()) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const entry = JSON.parse(raw);
        if (entry && typeof entry.expiresAt === "number" && entry.expiresAt > now) {
          return entry.data as T;
        }
        // Expired
        window.localStorage.removeItem(key);
      }
    } catch {
      // Fall through to memory store
    }
  }

  // Fallback to memoryStore
  const mem = memoryStore.get(key);
  if (mem) {
    if (mem.expiresAt > now) {
      return mem.data as T;
    }
    memoryStore.delete(key);
  }

  return null;
}

function setItem<T>(key: string, data: T, ttlMs: number): void {
  const expiresAt = Date.now() + ttlMs;
  const payload = { data, expiresAt };

  // Always keep in memory store
  memoryStore.set(key, payload);

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
      console.warn("[CountryCache] localStorage write failed, using memory store:", e);
    }
  }
}

function removeItem(key: string): void {
  memoryStore.delete(key);
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }
}

// ─── AI Summary Cache ────────────────────────────────────────────────────────
export function getCachedAiSummary(countryName: string): CountryAiSummary | null {
  const clean = countryName.trim().toLowerCase();
  const key = `${AI_CACHE_PREFIX}${clean}`;
  return getItem<CountryAiSummary>(key);
}

export function setCachedAiSummary(
  countryName: string,
  summary: CountryAiSummary
): void {
  // Never persist errored responses in client storage
  if (summary.hasError) return;
  const clean = countryName.trim().toLowerCase();
  const key = `${AI_CACHE_PREFIX}${clean}`;
  setItem(key, summary, AI_TTL_MS);
}

export function clearCachedAiSummary(countryName: string): void {
  const clean = countryName.trim().toLowerCase();
  removeItem(`${AI_CACHE_PREFIX}${clean}`);
}

// ─── News Cache ─────────────────────────────────────────────────────────────
export function getCachedNews(countryName: string): CountryNewsArticle[] | null {
  const clean = countryName.trim().toLowerCase();
  const key = `${NEWS_CACHE_PREFIX}${clean}`;
  return getItem<CountryNewsArticle[]>(key);
}

export function setCachedNews(
  countryName: string,
  articles: CountryNewsArticle[]
): void {
  const clean = countryName.trim().toLowerCase();
  const key = `${NEWS_CACHE_PREFIX}${clean}`;
  setItem(key, articles, NEWS_TTL_MS);
}

// ─── Country Info Cache ─────────────────────────────────────────────────────
export function getCachedCountryInfo(countryName: string): CountryInfo | null {
  const clean = countryName.trim().toLowerCase();
  const key = `${COUNTRY_CACHE_PREFIX}${clean}`;
  return getItem<CountryInfo>(key);
}

export function setCachedCountryInfo(
  countryName: string,
  info: CountryInfo
): void {
  const clean = countryName.trim().toLowerCase();
  const key = `${COUNTRY_CACHE_PREFIX}${clean}`;
  setItem(key, info, COUNTRY_TTL_MS);
}
