import type {
  DailyForecastItem,
  HourlyForecastItem,
  WeatherData,
} from "../types";

// WMO Weather interpretation codes (WW)
export function getWeatherDescription(code: number): string {
  switch (code) {
    case 0:
      return "Clear sky";
    case 1:
      return "Mainly clear";
    case 2:
      return "Partly cloudy";
    case 3:
      return "Overcast";
    case 45:
    case 48:
      return "Foggy";
    case 51:
    case 53:
    case 55:
      return "Drizzle";
    case 61:
    case 63:
    case 65:
      return "Rain";
    case 71:
    case 73:
    case 75:
      return "Snowfall";
    case 80:
    case 81:
    case 82:
      return "Rain showers";
    case 95:
      return "Thunderstorm";
    case 96:
    case 99:
      return "Thunderstorm with hail";
    default:
      return "Partly cloudy";
  }
}

function formatDayName(dateStr: string, index: number): { dayName: string; formattedDate: string } {
  try {
    const d = new Date(dateStr + "T00:00:00");
    const dayName = index === 0 ? "Today" : index === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { dayName, formattedDate };
  } catch {
    return { dayName: `Day ${index + 1}`, formattedDate: dateStr };
  }
}

function formatTime(unixSeconds: number, timezoneOffsetSeconds: number = 0): string {
  try {
    const d = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
  } catch {
    return "";
  }
}

// Map OpenWeather icon code to description if needed
export function getOpenWeatherDescription(id: number, main: string, description: string): string {
  if (description) {
    return description.charAt(0).toUpperCase() + description.slice(1);
  }
  return main;
}

// Convert OpenWeather icon ID to weatherCode equivalent
function mapOpenWeatherIdToCode(id: number): number {
  if (id >= 200 && id < 300) return 95; // Thunderstorm
  if (id >= 300 && id < 400) return 51; // Drizzle
  if (id >= 500 && id < 600) return 63; // Rain
  if (id >= 600 && id < 700) return 73; // Snow
  if (id >= 700 && id < 800) return 45; // Atmosphere / Fog
  if (id === 800) return 0; // Clear
  if (id === 801) return 1; // Few clouds
  if (id === 802) return 2; // Scattered clouds
  if (id >= 803) return 3; // Broken / Overcast
  return 2;
}

/**
 * Fetch weather from OpenWeatherMap API
 */
async function fetchFromOpenWeather(query: string, apiKey: string): Promise<WeatherData | null> {
  try {
    // 1. Direct Geocoding (fetch top 5 matches to find exact city name)
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      query.trim()
    )}&limit=5&appid=${apiKey}`;

    const geoRes = await fetch(geoUrl, { next: { revalidate: 3600 } });
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();

    if (!Array.isArray(geoData) || geoData.length === 0) {
      return null;
    }

    const trimmedQuery = query.trim().toLowerCase();
    const exactMatch = geoData.find(
      (item: any) => item.name?.toLowerCase() === trimmedQuery
    );
    const { lat, lon, name, country } = exactMatch || geoData[0];

    // 2. Current Weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const currentRes = await fetch(currentUrl, { next: { revalidate: 1800 } });
    if (!currentRes.ok) return null;
    const current = await currentRes.json();

    // 3. 5-Day / 3-Hour Forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastRes = await fetch(forecastUrl, { next: { revalidate: 1800 } });
    if (!forecastRes.ok) return null;
    const forecast = await forecastRes.json();

    const timezoneOffset = current.timezone || 0;
    const sunriseStr = current.sys?.sunrise ? formatTime(current.sys.sunrise, timezoneOffset) : undefined;
    const sunsetStr = current.sys?.sunset ? formatTime(current.sys.sunset, timezoneOffset) : undefined;

    // Group 3-hour forecasts by date (YYYY-MM-DD)
    const groupedDays: Record<string, typeof forecast.list> = {};
    if (forecast.list && Array.isArray(forecast.list)) {
      for (const item of forecast.list) {
        const dateKey = item.dt_txt.split(" ")[0];
        if (!groupedDays[dateKey]) {
          groupedDays[dateKey] = [];
        }
        groupedDays[dateKey].push(item);
      }
    }

    const dateKeys = Object.keys(groupedDays);
    const forecastDays: DailyForecastItem[] = dateKeys.map((dateKey, idx) => {
      const dayItems = groupedDays[dateKey];
      const temps = dayItems.map((i: any) => i.main.temp);
      const minTemp = Math.round(Math.min(...temps));
      const maxTemp = Math.round(Math.max(...temps));
      const midItem = dayItems[Math.floor(dayItems.length / 2)] || dayItems[0];
      const weatherId = midItem.weather?.[0]?.id || 800;
      const weatherCode = mapOpenWeatherIdToCode(weatherId);
      const desc = getOpenWeatherDescription(
        weatherId,
        midItem.weather?.[0]?.main || "Clear",
        midItem.weather?.[0]?.description || ""
      );

      const pops = dayItems.map((i: any) => Math.round((i.pop || 0) * 100));
      const maxPop = Math.max(0, ...pops);
      const avgWind = Math.round(
        dayItems.reduce((acc: number, cur: any) => acc + (cur.wind?.speed || 0), 0) / dayItems.length
      );
      const avgHum = Math.round(
        dayItems.reduce((acc: number, cur: any) => acc + (cur.main?.humidity || 0), 0) / dayItems.length
      );

      const { dayName, formattedDate } = formatDayName(dateKey, idx);

      const hourly: HourlyForecastItem[] = dayItems.map((item: any) => {
        const timePart = item.dt_txt.split(" ")[1]?.slice(0, 5) || "12:00";
        const hourNum = parseInt(timePart.split(":")[0], 10) || 0;
        const itemWeatherId = item.weather?.[0]?.id || 800;
        return {
          time: timePart,
          fullTime: item.dt_txt,
          hour: hourNum,
          temperature: Math.round(item.main.temp),
          apparentTemperature: Math.round(item.main.feels_like),
          weatherCode: mapOpenWeatherIdToCode(itemWeatherId),
          weatherDescription: getOpenWeatherDescription(
            itemWeatherId,
            item.weather?.[0]?.main || "",
            item.weather?.[0]?.description || ""
          ),
          weatherIcon: item.weather?.[0]?.icon,
          precipitationProbability: Math.round((item.pop || 0) * 100),
          precipitation: item.rain?.["3h"] || 0,
          windSpeed: Math.round(item.wind?.speed || 0),
          humidity: item.main.humidity,
        };
      });

      return {
        date: dateKey,
        dayName,
        formattedDate,
        temperatureMax: maxTemp,
        temperatureMin: minTemp,
        weatherCode,
        weatherDescription: desc,
        weatherIcon: midItem.weather?.[0]?.icon,
        precipitationProbability: maxPop,
        precipitationAmount: dayItems.reduce((acc: number, cur: any) => acc + (cur.rain?.["3h"] || 0), 0),
        windSpeed: avgWind,
        humidity: avgHum,
        sunrise: sunriseStr,
        sunset: sunsetStr,
        hourly,
      };
    });

    const currentWeatherId = current.weather?.[0]?.id || 800;
    const currentWeatherCode = mapOpenWeatherIdToCode(currentWeatherId);

    return {
      city: name,
      country: country || current.sys?.country || "",
      coordinates: { lat, lon },
      timezone: String(timezoneOffset),
      source: "OpenWeather",
      temperature: Math.round(current.main.temp),
      apparentTemperature: Math.round(current.main.feels_like),
      weatherCode: currentWeatherCode,
      weatherDescription: getOpenWeatherDescription(
        currentWeatherId,
        current.weather?.[0]?.main || "",
        current.weather?.[0]?.description || ""
      ),
      weatherIcon: current.weather?.[0]?.icon,
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6), // m/s to km/h
      windDirection: current.wind.deg,
      windGust: current.wind.gust ? Math.round(current.wind.gust * 3.6) : undefined,
      precipitation: current.rain?.["1h"] || 0,
      precipitationProbability: forecastDays[0]?.precipitationProbability || 0,
      pressure: current.main.pressure,
      visibility: current.visibility ? Math.round(current.visibility / 1000) : undefined, // meters to km
      sunrise: sunriseStr,
      sunset: sunsetStr,
      updatedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      forecastDays,
      daily: {
        time: forecastDays.map((d) => d.date),
        temperatureMax: forecastDays.map((d) => d.temperatureMax),
        temperatureMin: forecastDays.map((d) => d.temperatureMin),
        weatherCode: forecastDays.map((d) => d.weatherCode),
        precipitationProbabilityMax: forecastDays.map((d) => d.precipitationProbability),
      },
    };
  } catch (err) {
    console.error("OpenWeather API error:", err);
    return null;
  }
}

/**
 * Fetch weather via Open-Meteo fallback (Free, no key required, full 7-day hourly breakdown)
 */
async function fetchFromOpenMeteo(query: string): Promise<WeatherData | null> {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=5&language=en&format=json`;

    const geoRes = await fetch(geoUrl, { next: { revalidate: 3600 } });
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return null;
    }

    // Find exact city name match first
    const trimmed = query.trim().toLowerCase();
    const exactMatch = geoData.results.find(
      (r: any) => r.name?.toLowerCase() === trimmed
    );
    // Prioritize Indian destinations when ambiguous or matching
    const indianMatch = geoData.results.find(
      (r: any) => r.country_code?.toUpperCase() === "IN" || r.country?.toLowerCase() === "india"
    );
    const place = exactMatch || indianMatch || geoData.results[0];
    const { latitude, longitude, name, country } = place;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

    const weatherRes = await fetch(weatherUrl, { next: { revalidate: 1800 } });
    if (!weatherRes.ok) return null;
    const data = await weatherRes.json();

    const dailyDates: string[] = data.daily.time || [];
    const hourlyTimes: string[] = data.hourly.time || [];

    const forecastDays: DailyForecastItem[] = dailyDates.map((dateStr: string, idx: number) => {
      const { dayName, formattedDate } = formatDayName(dateStr, idx);
      const code = data.daily.weather_code[idx];
      const desc = getWeatherDescription(code);

      // Extract hourly slots for this day
      const dayHourly: HourlyForecastItem[] = [];
      hourlyTimes.forEach((isoTime: string, hIdx: number) => {
        if (isoTime.startsWith(dateStr)) {
          const timePart = isoTime.split("T")[1]?.slice(0, 5) || "00:00";
          const hourNum = parseInt(timePart.split(":")[0], 10) || 0;
          dayHourly.push({
            time: timePart,
            fullTime: isoTime,
            hour: hourNum,
            temperature: Math.round(data.hourly.temperature_2m[hIdx]),
            apparentTemperature: Math.round(data.hourly.apparent_temperature[hIdx]),
            weatherCode: data.hourly.weather_code[hIdx],
            weatherDescription: getWeatherDescription(data.hourly.weather_code[hIdx]),
            precipitationProbability: data.hourly.precipitation_probability[hIdx] || 0,
            precipitation: data.hourly.precipitation[hIdx] || 0,
            windSpeed: Math.round(data.hourly.wind_speed_10m[hIdx] || 0),
            humidity: data.hourly.relative_humidity_2m[hIdx] || 0,
            uvIndex: data.hourly.uv_index ? Math.round(data.hourly.uv_index[hIdx]) : undefined,
          });
        }
      });

      const sunriseRaw = data.daily.sunrise?.[idx];
      const sunsetRaw = data.daily.sunset?.[idx];
      const sunriseStr = sunriseRaw ? sunriseRaw.split("T")[1] : undefined;
      const sunsetStr = sunsetRaw ? sunsetRaw.split("T")[1] : undefined;

      return {
        date: dateStr,
        dayName,
        formattedDate,
        temperatureMax: Math.round(data.daily.temperature_2m_max[idx]),
        temperatureMin: Math.round(data.daily.temperature_2m_min[idx]),
        weatherCode: code,
        weatherDescription: desc,
        precipitationProbability: data.daily.precipitation_probability_max?.[idx] || 0,
        precipitationAmount: data.daily.precipitation_sum?.[idx] || 0,
        windSpeed: Math.round(data.daily.wind_speed_10m_max?.[idx] || 0),
        humidity: data.current.relative_humidity_2m || 60,
        uvIndex: data.daily.uv_index_max?.[idx] ? Math.round(data.daily.uv_index_max[idx]) : undefined,
        sunrise: sunriseStr,
        sunset: sunsetStr,
        hourly: dayHourly,
      };
    });

    const currentWeatherCode = data.current.weather_code;

    return {
      city: name,
      country: country || "",
      coordinates: { lat: latitude, lon: longitude },
      timezone: data.timezone,
      source: "Open-Meteo",
      temperature: Math.round(data.current.temperature_2m),
      apparentTemperature: Math.round(data.current.apparent_temperature),
      weatherCode: currentWeatherCode,
      weatherDescription: getWeatherDescription(currentWeatherCode),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      windDirection: data.current.wind_direction_10m,
      precipitation: data.current.precipitation || 0,
      precipitationProbability: forecastDays[0]?.precipitationProbability || 0,
      pressure: data.current.surface_pressure ? Math.round(data.current.surface_pressure) : undefined,
      uvIndex: forecastDays[0]?.uvIndex,
      sunrise: forecastDays[0]?.sunrise,
      sunset: forecastDays[0]?.sunset,
      updatedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      forecastDays,
      daily: {
        time: data.daily.time,
        temperatureMax: data.daily.temperature_2m_max.map((t: number) => Math.round(t)),
        temperatureMin: data.daily.temperature_2m_min.map((t: number) => Math.round(t)),
        weatherCode: data.daily.weather_code,
        precipitationProbabilityMax: data.daily.precipitation_probability_max,
      },
    };
  } catch (error) {
    console.error("Open-Meteo fallback error:", error);
    return null;
  }
}

/**
 * Main weather entrypoint:
 * Uses OpenWeather API when OPENWEATHER_API_KEY is available, otherwise uses Open-Meteo
 */
export async function fetchWeather(query: string = "Mumbai"): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  if (apiKey && apiKey.trim() && apiKey !== "your-openweather-api-key") {
    const owData = await fetchFromOpenWeather(query, apiKey.trim());
    if (owData) return owData;
  }

  // Fallback to open weather provider
  return await fetchFromOpenMeteo(query);
}

/**
 * Fetch 4-5 city name auto-suggestions for search autocomplete
 * Prioritizes Indian cities and destinations
 */
export async function fetchCitySuggestions(query: string): Promise<import("../types").CitySuggestion[]> {
  if (!query || query.trim().length < 3) return [];
  const trimmed = query.trim();
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  // 1. Try OpenWeather Geocoding API if key is available
  if (apiKey && apiKey.trim() && apiKey !== "your-openweather-api-key") {
    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        trimmed
      )}&limit=8&appid=${apiKey.trim()}`;

      const res = await fetch(geoUrl, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Prioritize Indian destinations
          const sorted = [...data].sort((a: any, b: any) => {
            const aIsIN = a.country === "IN" ? 1 : 0;
            const bIsIN = b.country === "IN" ? 1 : 0;
            return bIsIN - aIsIN;
          });

          return sorted.slice(0, 5).map((item: any) => {
            const parts: string[] = [item.name];
            if (item.state && item.state !== item.name) parts.push(item.state);
            if (item.country) parts.push(item.country);
            return {
              name: item.name,
              country: item.country || "",
              state: item.state,
              lat: item.lat,
              lon: item.lon,
              displayName: parts.join(", "),
            };
          });
        }
      }
    } catch (err) {
      console.error("OpenWeather geocoding suggestions error:", err);
    }
  }

  // 2. Fallback to Open-Meteo Geocoding API
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=8&language=en&format=json`;

    const res = await fetch(geoUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        // Prioritize Indian destinations
        const sorted = [...data.results].sort((a: any, b: any) => {
          const aIsIN = a.country_code?.toUpperCase() === "IN" || a.country?.toLowerCase() === "india" ? 1 : 0;
          const bIsIN = b.country_code?.toUpperCase() === "IN" || b.country?.toLowerCase() === "india" ? 1 : 0;
          return bIsIN - aIsIN;
        });

        return sorted.slice(0, 5).map((item: any) => {
          const parts: string[] = [item.name];
          if (item.admin1 && item.admin1 !== item.name) parts.push(item.admin1);
          if (item.country) parts.push(item.country);
          return {
            name: item.name,
            country: item.country || item.country_code || "",
            state: item.admin1,
            lat: item.latitude,
            lon: item.longitude,
            displayName: parts.join(", "),
          };
        });
      }
    }
  } catch (err) {
    console.error("Open-Meteo geocoding suggestions error:", err);
  }

  return [];
}


