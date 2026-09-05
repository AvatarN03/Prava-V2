import { FxRates, CurrencyPerformanceData, CurrencyHistoryPoint, SupportedCurrency } from "../types";

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  { code: "USD", name: "United States Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "AED", name: "UAE Dirham", symbol: "AED", flag: "🇦🇪" },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$", flag: "🇲🇽" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰" },
  { code: "PLN", name: "Polish Złoty", symbol: "zł", flag: "🇵🇱" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", flag: "🇨🇿" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", flag: "🇭🇺" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪", flag: "🇮🇱" },
  { code: "ISK", name: "Icelandic Króna", symbol: "kr", flag: "🇮🇸" },
];

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

// Server-side in-memory cache with 1-hour TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const fxRatesCache = new Map<string, CacheEntry<FxRates>>();
const fxPerfCache = new Map<string, CacheEntry<CurrencyPerformanceData>>();

/**
 * Fetch latest FX rates from Frankfurter API with daily change calculations
 */
export async function fetchFxRates(base: string = "USD"): Promise<FxRates | null> {
  const cleanBase = base.toUpperCase();
  const now = Date.now();

  // Check in-memory cache first
  const cached = fxRatesCache.get(cleanBase);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    // 1. Fetch latest rates
    const latestUrl = `https://api.frankfurter.app/latest?from=${cleanBase}`;
    const res = await fetch(latestUrl, { next: { revalidate: 3600 } });

    if (!res.ok) {
      return getFallbackRates(cleanBase);
    }

    const data = await res.json();
    const latestRates = { ...data.rates, [cleanBase]: 1.0 };

    // 2. Fetch rates from ~3-5 days ago to compute real period/daily changes
    const today = new Date();
    const prevDate = new Date(today.getTime() - 4 * 86400000);
    const prevUrl = `https://api.frankfurter.app/${formatDate(prevDate)}?from=${cleanBase}`;

    let changes: Record<string, number> = {};
    let previousRates: Record<string, number> = {};

    try {
      const prevRes = await fetch(prevUrl, { next: { revalidate: 3600 } });
      if (prevRes.ok) {
        const prevData = await prevRes.json();
        previousRates = { ...prevData.rates, [cleanBase]: 1.0 };

        for (const [code, currentRate] of Object.entries(latestRates)) {
          const oldRate = previousRates[code];
          if (oldRate && oldRate > 0 && typeof currentRate === "number") {
            const diff = currentRate - oldRate;
            changes[code] = Number(((diff / oldRate) * 100).toFixed(2));
          } else {
            changes[code] = 0;
          }
        }
      }
    } catch {
      // Ignore previous rates error and continue with 0% defaults
    }

    const result: FxRates = {
      base: data.base || cleanBase,
      date: data.date || formatDate(today),
      rates: latestRates,
      previousRates,
      changes,
    };

    fxRatesCache.set(cleanBase, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error("Error fetching FX rates:", error);
    return getFallbackRates(cleanBase);
  }
}

/**
 * Fetch historical performance time-series from Frankfurter API for range (7D, 1M, 3M, 1Y)
 */
export async function fetchCurrencyPerformance(
  base: string = "USD",
  target: string = "EUR",
  range: "7D" | "1M" | "3M" | "1Y" = "1M"
): Promise<CurrencyPerformanceData | null> {
  const cleanBase = base.toUpperCase();
  const cleanTarget = target.toUpperCase();
  const cacheKey = `${cleanBase}_${cleanTarget}_${range}`;
  const now = Date.now();

  // Check in-memory cache first
  const cached = fxPerfCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (cleanBase === cleanTarget) {
    const todayStr = formatDate(new Date());
    return {
      base: cleanBase,
      target: cleanTarget,
      range,
      startDate: todayStr,
      endDate: todayStr,
      currentRate: 1.0,
      initialRate: 1.0,
      changeAmount: 0,
      changePercent: 0,
      isBaseStronger: false,
      highRate: 1.0,
      lowRate: 1.0,
      points: [{ date: todayStr, rate: 1.0, formattedDate: formatShortDate(todayStr) }],
    };
  }

  const nowDate = new Date();
  const dayOffsets: Record<string, number> = {
    "7D": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 365,
  };

  const daysAgo = dayOffsets[range] || 30;
  const startDate = formatDate(new Date(nowDate.getTime() - daysAgo * 86400000));
  const endDate = formatDate(nowDate);

  try {
    const historyUrl = `https://api.frankfurter.app/${startDate}..${endDate}?from=${cleanBase}&to=${cleanTarget}`;
    const res = await fetch(historyUrl, { next: { revalidate: 3600 } });

    if (!res.ok) {
      return getFallbackPerformance(cleanBase, cleanTarget, range, daysAgo);
    }

    const data = await res.json();
    const rawRates: Record<string, Record<string, number>> = data.rates || {};
    const dateKeys = Object.keys(rawRates).sort();

    if (dateKeys.length === 0) {
      return getFallbackPerformance(cleanBase, cleanTarget, range, daysAgo);
    }

    const points: CurrencyHistoryPoint[] = dateKeys.map((d) => ({
      date: d,
      rate: Number((rawRates[d][cleanTarget] || 1).toFixed(4)),
      formattedDate: formatShortDate(d),
    }));

    const ratesArray = points.map((p) => p.rate);
    const initialRate = points[0].rate;
    const currentRate = points[points.length - 1].rate;
    const changeAmount = Number((currentRate - initialRate).toFixed(4));
    const changePercent = initialRate > 0 ? Number(((changeAmount / initialRate) * 100).toFixed(2)) : 0;
    const isBaseStronger = changeAmount > 0;
    const highRate = Math.max(...ratesArray);
    const lowRate = Math.min(...ratesArray);

    const perfResult: CurrencyPerformanceData = {
      base: cleanBase,
      target: cleanTarget,
      range,
      startDate: points[0].date,
      endDate: points[points.length - 1].date,
      currentRate,
      initialRate,
      changeAmount,
      changePercent,
      isBaseStronger,
      highRate,
      lowRate,
      points,
    };

    fxPerfCache.set(cacheKey, { data: perfResult, timestamp: Date.now() });
    return perfResult;
  } catch (error) {
    console.error("Error fetching historical FX performance:", error);
    return getFallbackPerformance(cleanBase, cleanTarget, range, daysAgo);
  }
}

function getFallbackRates(base: string): FxRates {
  const defaultUsdRates: Record<string, number> = {
    USD: 1.0,
    EUR: 0.924,
    GBP: 0.789,
    JPY: 154.2,
    CAD: 1.365,
    AUD: 1.524,
    CHF: 0.908,
    INR: 83.45,
    SGD: 1.348,
    AED: 3.672,
    THB: 36.8,
    IDR: 16250.0,
    MXN: 17.15,
    BRL: 5.18,
    CNY: 7.24,
    NZD: 1.64,
    HKD: 7.82,
    SEK: 10.45,
    NOK: 10.62,
    DKK: 6.89,
    PLN: 3.98,
    CZK: 23.1,
    HUF: 364.5,
    TRY: 32.4,
    ZAR: 18.65,
    KRW: 1370.0,
    MYR: 4.72,
    PHP: 57.6,
    ILS: 3.75,
    ISK: 139.2,
  };

  const baseRateInUsd = defaultUsdRates[base] || 1.0;
  const normalizedRates: Record<string, number> = {};
  const mockChanges: Record<string, number> = {};

  for (const [curr, rate] of Object.entries(defaultUsdRates)) {
    const norm = Number((rate / baseRateInUsd).toFixed(4));
    normalizedRates[curr] = norm;
    // Mild deterministic mock change
    const charCode = curr.charCodeAt(0) + curr.charCodeAt(1);
    mockChanges[curr] = Number((((charCode % 10) - 4.5) * 0.25).toFixed(2));
  }

  return {
    base,
    date: formatDate(new Date()),
    rates: normalizedRates,
    changes: mockChanges,
  };
}

function getFallbackPerformance(
  base: string,
  target: string,
  range: "7D" | "1M" | "3M" | "1Y",
  daysAgo: number
): CurrencyPerformanceData {
  const fallbackRates = getFallbackRates(base).rates;
  const currentRate = fallbackRates[target] || 1.0;
  const now = new Date();
  const step = Math.max(1, Math.floor(daysAgo / 15));
  const points: CurrencyHistoryPoint[] = [];

  for (let i = daysAgo; i >= 0; i -= step) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = formatDate(d);
    // Subtle sinusoidal variance
    const factor = 1 + Math.sin(i * 0.3) * 0.02;
    points.push({
      date: dateStr,
      rate: Number((currentRate * factor).toFixed(4)),
      formattedDate: formatShortDate(dateStr),
    });
  }

  const initialRate = points[0]?.rate || currentRate;
  const changeAmount = Number((currentRate - initialRate).toFixed(4));
  const changePercent = initialRate > 0 ? Number(((changeAmount / initialRate) * 100).toFixed(2)) : 0;
  const rates = points.map((p) => p.rate);

  return {
    base,
    target,
    range,
    startDate: points[0]?.date || formatDate(now),
    endDate: points[points.length - 1]?.date || formatDate(now),
    currentRate,
    initialRate,
    changeAmount,
    changePercent,
    isBaseStronger: changeAmount > 0,
    highRate: Math.max(...rates),
    lowRate: Math.min(...rates),
    points,
  };
}

