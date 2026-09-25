import { fetchWeather } from "@/features/travel-essentials/weather/weather-service";
import { fetchFxRates } from "@/features/travel-essentials/currency/currency-service";

export interface ToolExecutionResult {
  toolName: "weather" | "currency" | "emergency";
  summary: string;
  data: Record<string, unknown>;
}

/**
 * Execute live weather tool for a city.
 */
export async function executeWeatherTool(city: string): Promise<ToolExecutionResult | null> {
  try {
    const trimmed = city.trim();
    if (!trimmed) return null;

    const weather = await fetchWeather(trimmed);
    if (!weather) {
      return null;
    }

    const summary = `${weather.city}${weather.country ? `, ${weather.country}` : ""}: ${weather.temperature}°C, ${weather.weatherDescription}, Humidity ${weather.humidity}%`;

    return {
      toolName: "weather",
      summary,
      data: {
        city: weather.city,
        country: weather.country,
        temperature: weather.temperature,
        apparentTemperature: weather.apparentTemperature,
        condition: weather.weatherDescription,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        dailyForecast: (weather.forecastDays || []).slice(0, 3).map((d) => ({
          day: d.dayName,
          min: d.temperatureMin,
          max: d.temperatureMax,
          condition: d.weatherDescription,
        })),
      },
    };
  } catch (error) {
    console.warn("Weather tool execution failed:", error);
    return null;
  }
}

/**
 * Execute live currency conversion between foreign and local currency.
 */
export async function executeCurrencyTool(
  amount: number,
  fromCode: string,
  toCode: string = "INR"
): Promise<ToolExecutionResult | null> {
  try {
    const from = fromCode.toUpperCase().trim();
    const to = toCode.toUpperCase().trim();

    const fx = await fetchFxRates(from);
    if (!fx || !fx.rates || !fx.rates[to]) {
      return null;
    }

    const rate = fx.rates[to];
    const converted = amount * rate;
    const summary = `${amount.toLocaleString()} ${from} = ${converted.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} ${to} (Rate: 1 ${from} = ${rate.toFixed(4)} ${to})`;

    return {
      toolName: "currency",
      summary,
      data: {
        from,
        to,
        amount,
        rate,
        convertedAmount: converted,
        date: fx.date,
      },
    };
  } catch (error) {
    console.warn("Currency tool execution failed:", error);
    return null;
  }
}

export interface TravelToolIntent {
  type: "weather" | "currency" | "guide" | "language" | "maps" | "none";
  params: Record<string, string | number>;
  navLink?: {
    tab: "weather" | "currency" | "guide" | "language" | "maps";
    label: string;
    url: string;
  };
}

/**
 * Heuristic detector to identify if a user prompt is requesting live travel essential utilities.
 */
export function detectTravelToolIntent(
  prompt: string,
  defaultDestination?: string | null,
  userCurrency: string = "INR"
): TravelToolIntent {
  const lower = prompt.toLowerCase();

  // 1. Weather Intent detection
  const weatherKeywords = ["weather", "temperature", "forecast", "rain", "sunny", "how cold", "how hot", "climate"];
  const hasWeatherKeyword = weatherKeywords.some((w) => lower.includes(w));
  if (hasWeatherKeyword) {
    let city = defaultDestination || "Tokyo";

    // Match "weather in Osaka", "forecast for San Francisco", etc.
    const inMatch = prompt.match(/(?:in|for|at|about)\s+([a-zA-Z\s]+?)(?:\s+(?:today|tomorrow|this week|right now|forecast|live|weather|please))?$/i);
    if (inMatch && inMatch[1].trim()) {
      city = inMatch[1].trim();
    } else {
      // Match "Osaka weather", "New York forecast", etc.
      const beforeMatch = prompt.match(/([a-zA-Z\s]+?)\s+(?:weather|forecast|temperature|climate)/i);
      if (beforeMatch && beforeMatch[1].trim()) {
        const potential = beforeMatch[1]
          .replace(/^(?:check|what is the|how is the|get|live|show me|tell me)\s+/i, "")
          .trim();
        if (potential && potential.length > 1) {
          city = potential;
        }
      }
    }

    return {
      type: "weather",
      params: { city: city.trim() },
      navLink: {
        tab: "weather",
        label: "🌦️ Open Weather in Travel Essentials",
        url: "/travel-essentials?tab=weather",
      },
    };
  }

  // 2. Currency Intent detection
  const currencyKeywords = ["convert", "currency", "exchange rate", "how much is", "jpy to inr", "usd to inr", "yen to inr", "dollar to inr", "inr to", "fx rate"];
  const hasCurrencyKeyword = currencyKeywords.some((c) => lower.includes(c));

  if (hasCurrencyKeyword) {
    // Extract numbers e.g. "convert 5000 JPY to INR" or "10000 yen"
    const numberMatch = prompt.match(/\b\d+(?:,\d+)*(?:\.\d+)?\b/);
    const amount = numberMatch ? parseFloat(numberMatch[0].replace(/,/g, "")) : 100;

    let from = "USD";
    if (lower.includes("jpy") || lower.includes("yen")) from = "JPY";
    else if (lower.includes("eur") || lower.includes("euro")) from = "EUR";
    else if (lower.includes("gbp") || lower.includes("pound")) from = "GBP";
    else if (lower.includes("aed") || lower.includes("dirham")) from = "AED";
    else if (lower.includes("thb") || lower.includes("baht")) from = "THB";
    else if (lower.includes("sgd")) from = "SGD";

    return {
      type: "currency",
      params: {
        amount,
        from,
        to: userCurrency || "INR",
      },
      navLink: {
        tab: "currency",
        label: "💱 Open Currency Converter in Travel Essentials",
        url: "/travel-essentials?tab=currency",
      },
    };
  }

  // 3. Language & Phrasebook Intent detection
  const languageKeywords = ["how do you say", "how to say", "phrasebook", "translate", "translation", "local language", "say thank you", "hello in", "phrases in"];
  if (languageKeywords.some((k) => lower.includes(k))) {
    return {
      type: "language",
      params: {},
      navLink: {
        tab: "language",
        label: "🗣️ Open Language Phrasebook in Travel Essentials",
        url: "/travel-essentials?tab=language",
      },
    };
  }

  // 4. Country Guide & Emergency Contacts Intent detection
  const guideKeywords = ["emergency", "dialing code", "police number", "ambulance", "plug type", "power outlet", "country guide", "visa requirement", "embassy"];
  if (guideKeywords.some((k) => lower.includes(k))) {
    return {
      type: "guide",
      params: {},
      navLink: {
        tab: "guide",
        label: "📖 Open Country Guide in Travel Essentials",
        url: "/travel-essentials?tab=guide",
      },
    };
  }

  // 5. Maps & Navigation Intent detection
  const mapKeywords = ["show on map", "open map", "interactive map", "where is", "locations on map", "coordinates"];
  if (mapKeywords.some((k) => lower.includes(k))) {
    return {
      type: "maps",
      params: {},
      navLink: {
        tab: "maps",
        label: "🗺️ Open Interactive Map in Travel Essentials",
        url: "/travel-essentials?tab=maps",
      },
    };
  }

  return { type: "none", params: {} };
}
