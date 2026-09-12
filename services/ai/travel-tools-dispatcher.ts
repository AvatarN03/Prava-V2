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

/**
 * Heuristic detector to identify if a user prompt is requesting live travel essential utilities.
 */
export function detectTravelToolIntent(
  prompt: string,
  defaultDestination?: string | null,
  userCurrency: string = "INR"
): {
  type: "weather" | "currency" | "none";
  params: Record<string, string | number>;
} {
  const lower = prompt.toLowerCase();

  // 1. Weather Intent detection
  const weatherKeywords = ["weather", "temperature", "forecast", "rain", "sunny", "how cold", "how hot", "climate"];
  const hasWeatherKeyword = weatherKeywords.some((w) => lower.includes(w));

  if (hasWeatherKeyword) {
    // Check if a specific city was mentioned (e.g. "weather in Tokyo", "Kyoto weather")
    const inMatch = lower.match(/(?:in|for|at)\s+([a-zA-Z\s]+)/i);
    const city = inMatch ? inMatch[1].trim().split(" ")[0] : defaultDestination || "Tokyo";

    return {
      type: "weather",
      params: { city: city.replace(/[^a-zA-Z]/g, "") },
    };
  }

  // 2. Currency Intent detection
  const currencyKeywords = ["convert", "currency", "exchange rate", "how much is", "jpy to inr", "usd to inr", "yen to inr", "dollar to inr", "inr to"];
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
    };
  }

  return { type: "none", params: {} };
}
