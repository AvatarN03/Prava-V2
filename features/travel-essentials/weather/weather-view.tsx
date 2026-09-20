"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  Calendar,
  ChevronRight,
  Clock,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Compass,
  Crosshair,
  Droplets,
  Gauge,
  Loader2,
  MapPin,
  Moon,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Sunrise,
  Umbrella,
  Wind,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  broadcastWeatherUpdate,
  detectLocationViaGPS,
  detectLocationViaIP,
  getCachedWeather,
  listenWeatherUpdate,
} from "./location-service";
import type {
  CitySuggestion,
  DailyForecastItem,
  HourlyForecastItem,
  WeatherData,
} from "../types";

interface WeatherViewProps {
  initialData: WeatherData | null;
  onSearch: (city: string) => Promise<WeatherData | null>;
  onCitySuggestions?: (query: string) => Promise<CitySuggestion[]>;
}

// Curated Tier-1 metropolitan hubs focused on India
const QUICK_DESTINATIONS = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
];

function getWeatherIconMeta(code: number, isNight: boolean = false) {
  if (code === 0) {
    return isNight
      ? { icon: Moon, color: "text-indigo-400", bg: "bg-indigo-500/10" }
      : { icon: Sun, color: "text-amber-500", bg: "bg-amber-500/10" };
  }
  if (code === 1 || code === 2) {
    return isNight
      ? { icon: Cloud, color: "text-indigo-300", bg: "bg-indigo-500/10" }
      : { icon: CloudSun, color: "text-amber-400", bg: "bg-amber-400/10" };
  }
  if (code === 3) return { icon: Cloud, color: "text-slate-400", bg: "bg-slate-400/10" };
  if (code === 45 || code === 48) return { icon: CloudFog, color: "text-zinc-400", bg: "bg-zinc-400/10" };
  if (code >= 51 && code <= 55) return { icon: CloudDrizzle, color: "text-sky-400", bg: "bg-sky-400/10" };
  if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
    return { icon: CloudRain, color: "text-blue-500", bg: "bg-blue-500/10" };
  }
  if (code >= 71 && code <= 77) return { icon: CloudSnow, color: "text-indigo-300", bg: "bg-indigo-300/10" };
  if (code >= 95) return { icon: CloudLightning, color: "text-purple-500", bg: "bg-purple-500/10" };
  return { icon: CloudSun, color: "text-amber-400", bg: "bg-amber-400/10" };
}

function getUvIndexMeta(uv?: number): { text: string; color: string } {
  if (uv === undefined) return { text: "Moderate", color: "text-amber-500" };
  if (uv <= 2) return { text: "Low (Safe)", color: "text-emerald-500" };
  if (uv <= 5) return { text: "Moderate", color: "text-amber-500" };
  if (uv <= 7) return { text: "High (Wear SPF)", color: "text-orange-500" };
  if (uv <= 10) return { text: "Very High", color: "text-rose-500" };
  return { text: "Extreme", color: "text-purple-600" };
}

function getTravelPackingInsight(day: DailyForecastItem) {
  if (day.precipitationProbability > 50 || day.weatherCode >= 61) {
    return {
      title: "Rain Gear Recommended",
      advice: "Pack a compact umbrella or rain shell. Water-resistant footwear advised.",
      icon: Umbrella,
    };
  }
  if (day.temperatureMax > 32) {
    return {
      title: "High Heat Advisory",
      advice: "Lightweight breathable cotton, sunglasses, sunscreen, and regular hydration.",
      icon: Sun,
    };
  }
  if (day.temperatureMin < 12) {
    return {
      title: "Cool Weather Layering",
      advice: "Light jacket, pullover, or shawl recommended for morning and evening breezes.",
      icon: CloudSnow,
    };
  }
  return {
    title: "Favorable Exploration Weather",
    advice: "Pleasant conditions for outdoor travel, temple walks, markets, and sightseeing.",
    icon: Sparkles,
  };
}

export function WeatherView({ initialData, onSearch, onCitySuggestions }: WeatherViewProps) {
  const [data, setData] = useState<WeatherData | null>(() => initialData || getCachedWeather());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, startSearch] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Suggestions state & selection flag
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const isSelectingRef = useRef(false);

  // Format updatedAt according to user's system clock/timezone (avoids Vercel UTC mismatch)
  const formattedUpdatedAt = useMemo(() => {
    if (!data?.updatedAt) return "";
    if (!isMounted) return "";
    try {
      const d = new Date(data.updatedAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      }
      return data.updatedAt;
    } catch {
      return data.updatedAt;
    }
  }, [data?.updatedAt, isMounted]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced fetch for suggestions (aborted when a suggestion is selected)
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length < 3 || !onCitySuggestions) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const results = await onCitySuggestions(trimmed);
        if (!isSelectingRef.current) {
          setSuggestions(results || []);
          setShowDropdown(Boolean(results && results.length > 0));
        }
      } catch (err) {
        console.error("Failed to load city suggestions:", err);
      } finally {
        setIsSuggesting(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, onCitySuggestions]);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for real-time app-wide updates & auto-detect location on initial load
  useEffect(() => {
    const unsubscribe = listenWeatherUpdate((updated) => {
      setData(updated);
      setSelectedDateIndex(0);
    });

    if (!data) {
      detectLocationViaIP().then((loc) => {
        const query = loc.lat && loc.lon ? `${loc.lat},${loc.lon}` : (loc.city || "Mumbai");
        handleSearchCity(query);
      });
    } else {
      broadcastWeatherUpdate(data);
    }

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchCity = (cityName: string) => {
    if (!cityName.trim()) return;
    isSelectingRef.current = true;
    setError(null);
    setShowDropdown(false);
    setSuggestions([]);

    startSearch(async () => {
      const result = await onSearch(cityName.trim());
      if (result) {
        setData(result);
        setSelectedDateIndex(0);
        setSearchQuery("");
        broadcastWeatherUpdate(result);
      } else {
        setError(`Could not find weather data for "${cityName}". Please check the spelling.`);
      }
    });
  };

  // On-demand device GPS detection
  const handleLocateMe = () => {
    startSearch(async () => {
      toast.info("Requesting device location...");
      const coords = await detectLocationViaGPS();

      if (!coords) {
        toast.error("Location permission denied. Detecting via network IP.");
        const ipLoc = await detectLocationViaIP();
        handleSearchCity(ipLoc.city || "Mumbai");
        return;
      }

      handleSearchCity(`${coords.lat},${coords.lon}`);
      toast.success("Loaded weather for your current location");
    });
  };

  const handleSelectSuggestion = (item: CitySuggestion) => {
    isSelectingRef.current = true;
    setShowDropdown(false);
    setSuggestions([]);
    setSearchQuery(item.name);
    handleSearchCity(item.name);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      isSelectingRef.current = true;
      setShowDropdown(false);
      setSuggestions([]);
      handleSearchCity(searchQuery);
    }
  };

  const formatTemp = (celsius: number) => {
    if (unit === "F") {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  const forecastDays = useMemo<DailyForecastItem[]>(() => {
    if (data?.forecastDays && data.forecastDays.length > 0) {
      return data.forecastDays;
    }
    if (data?.daily?.time) {
      return data.daily.time.map((timeStr, idx) => {
        const d = new Date(timeStr + "T00:00:00");
        return {
          date: timeStr,
          dayName: idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" }),
          formattedDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          temperatureMax: data.daily.temperatureMax[idx] || 25,
          temperatureMin: data.daily.temperatureMin[idx] || 20,
          weatherCode: data.daily.weatherCode[idx] || 1,
          weatherDescription: "Forecast Outlook",
          weatherIcon: undefined,
          precipitationProbability: data.daily.precipitationProbabilityMax[idx] || 0,
          precipitationAmount: 0,
          windSpeed: data.windSpeed || 12,
          humidity: data.humidity || 55,
          hourly: [],
        };
      });
    }
    return [];
  }, [data]);

  const selectedDay = forecastDays[selectedDateIndex] || forecastDays[0];
  const travelInsight = useMemo(() => {
    if (!selectedDay) return null;
    return getTravelPackingInsight(selectedDay);
  }, [selectedDay]);

  const isNight = data?.weatherIcon?.includes("n") ?? false;
  const currentIconMeta = useMemo(() => {
    return getWeatherIconMeta(data?.weatherCode || 1, isNight);
  }, [data?.weatherCode, isNight]);

  const CurrentIcon = currentIconMeta.icon;

  const atmosphericStats = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Humidity",
        value: `${data.humidity}%`,
        icon: Droplets,
        color: "text-sky-500",
      },
      {
        label: "Wind Speed",
        value: unit === "F" ? `${Math.round(data.windSpeed * 0.621371)} mph` : `${data.windSpeed} km/h`,
        icon: Wind,
        color: "text-teal-500",
      },
      {
        label: "UV Index",
        value: data.uvIndex !== undefined ? `${data.uvIndex} (${getUvIndexMeta(data.uvIndex).text})` : "Moderate (4)",
        icon: Sun,
        color: getUvIndexMeta(data.uvIndex).color,
      },
      {
        label: "Air Pressure",
        value: data.pressure ? `${data.pressure} hPa` : "1013 hPa",
        icon: Gauge,
        color: "text-indigo-500",
      },
      {
        label: "Precipitation",
        value: `${data.precipitationProbability}% chance`,
        icon: CloudRain,
        color: "text-blue-500",
      },
      {
        label: "Daylight Cycle",
        value: data.sunrise && data.sunset ? `${data.sunrise} / ${data.sunset}` : "Sunrise to Sunset",
        icon: Sunrise,
        color: "text-amber-500",
      },
    ];
  }, [data, unit]);

  return (
    <div className="space-y-6">
      {/* Top Controls: Search Bar & Quick Indian Pick Pills */}
      <div className="flex flex-col gap-3 pb-3 border-b border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-amber-500" />
                Live Weather & Forecasts
              </h2>
              {data?.source && (
                <Badge variant="secondary" className="text-[10px] font-mono font-medium px-2 py-0 h-5">
                  {data.source === "OpenWeather" ? "OpenWeather" : "Live Forecast"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live atmospheric radar, multi-day forecasting, and hourly schedules for top destinations.
            </p>
          </div>

          {/* Unit Switcher & Refresh Button (Right-aligned on mobile) */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUnit("C")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  unit === "C"
                    ? "bg-background text-foreground shadow-xs font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => setUnit("F")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  unit === "F"
                    ? "bg-background text-foreground shadow-xs font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                °F
              </button>
            </div>

            {data && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => handleSearchCity(data.city)}
                disabled={isSearching}
                title="Refresh current forecast"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? "animate-spin text-primary" : ""}`} />
                <span className="hidden sm:inline ml-1">Refresh</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search Input with Robust Suggestion Dropdown + Locate Me GPS Button */}
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
          <div ref={searchContainerRef} className="relative flex-1 max-w-lg">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search city (e.g. Mumbai, Delhi, Bengaluru)..."
                  className="pl-8 pr-8 h-9 text-xs bg-background"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim().length >= 3) {
                      setShowDropdown(true);
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0 && searchQuery.trim().length >= 3) {
                      setShowDropdown(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setShowDropdown(false);
                    }
                  }}
                  disabled={isSearching}
                />
                {isSuggesting && (
                  <Loader2 className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-primary animate-spin" />
                )}
              </div>

              <Button
                type="submit"
                size="sm"
                className="h-9 px-3.5 text-xs cursor-pointer shrink-0"
                disabled={isSearching}
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLocateMe}
                disabled={isSearching}
                className="h-9 px-2.5 text-xs gap-1.5 cursor-pointer shrink-0 border-border/80 hover:border-primary/40 text-muted-foreground hover:text-foreground"
                title="Locate Me (Current GPS / Network Location)"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : (
                  <Crosshair className="w-3.5 h-3.5 text-primary" />
                )}
                <span className="hidden sm:inline">Locate Me</span>
              </Button>
            </form>

            {/* Suggestions Dropdown (Closes reliably on selection) */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-xl overflow-hidden py-1 divide-y divide-border/40 animate-in fade-in-50 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 flex items-center justify-between">
                  <span>Location Suggestions</span>
                  <span className="text-[9px] font-normal lowercase text-muted-foreground/70">
                    {suggestions.length} places
                  </span>
                </div>
                {suggestions.map((item, index) => (
                  <button
                    key={`${item.name}-${item.lat}-${item.lon}-${index}`}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-3 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer group select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary">
                        <MapPin className="h-3 w-3" />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-foreground group-hover:text-primary">
                          {item.name}
                        </span>
                        {item.state && (
                          <span className="text-muted-foreground text-[11px] ml-1">
                            ({item.state})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono text-muted-foreground group-hover:border-primary/40 group-hover:text-primary">
                        {item.country}
                      </Badge>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Curated Tier-1 Indian Metro Quick Picks */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap mr-1 font-medium">Quick pick:</span>
            {QUICK_DESTINATIONS.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => handleSearchCity(dest)}
                disabled={isSearching}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer border ${
                  data?.city.toLowerCase() === dest.toLowerCase()
                    ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                    : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="h-6 text-xs px-2 cursor-pointer">
            Dismiss
          </Button>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Main Hero Card: Current Weather + Atmospheric Matrix */}
          <Card className="border-border/80 bg-gradient-to-br from-card via-card to-muted/20 shadow-xs overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left: Location & Main Temperature */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-primary font-medium text-xs">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold text-sm text-foreground">
                      {data.city}{data.country ? `, ${data.country}` : ""}
                    </span>
                    {formattedUpdatedAt && (
                      <span className="text-[10px] text-muted-foreground ml-auto sm:ml-2">
                        Updated {formattedUpdatedAt}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 sm:gap-5">
                    {/* Clean Vector Weather Icon (No black circle) */}
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${currentIconMeta?.bg} ${currentIconMeta?.color} border border-border/50 shrink-0`}>
                      <CurrentIcon className="w-9 h-9" />
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-mono">
                          {formatTemp(data.temperature)}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                          Feels like {formatTemp(data.apparentTemperature)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {data.weatherDescription}
                        </Badge>
                        {selectedDay && (
                          <span className="text-[11px] text-muted-foreground font-medium">
                            High {formatTemp(selectedDay.temperatureMax)} / Low {formatTemp(selectedDay.temperatureMin)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Concise Atmospheric Matrix Grid (Clean & Balanced) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 border-t lg:border-t-0 lg:border-l border-border/80 pt-4 lg:pt-0 lg:pl-6 text-xs">
                  {atmosphericStats.map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1 hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 text-muted-foreground font-medium text-[11px]">
                          <StatIcon className={`w-3.5 h-3.5 ${stat.color} shrink-0`} />
                          <span>{stat.label}</span>
                        </div>
                        <div className="font-semibold text-foreground font-mono text-xs truncate">
                          {stat.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Multi-Day Forecast Selector Strip */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Select Date for Detailed Forecast
              </h3>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                Click any day to inspect conditions & hourly schedule
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {forecastDays.map((day, idx) => {
                const isSelected = selectedDateIndex === idx;
                const isDayNight = day.weatherIcon?.includes("n") ?? false;
                const iconMeta = getWeatherIconMeta(day.weatherCode, isDayNight);
                const Icon = iconMeta.icon;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDateIndex(idx)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer space-y-2 select-none text-left relative ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                        : "border-border/70 bg-card hover:bg-muted/40 hover:border-border"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {day.dayName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {day.formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-center py-1">
                      <div className={`p-1.5 rounded-lg ${iconMeta.bg} ${iconMeta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="font-mono text-xs font-bold text-foreground text-center">
                      {formatTemp(day.temperatureMax)} / <span className="text-muted-foreground font-normal">{formatTemp(day.temperatureMin)}</span>
                    </div>

                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <Droplets className="w-2.5 h-2.5 text-sky-500" />
                      <span>{day.precipitationProbability}% rain</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details & Hourly Schedule */}
          {selectedDay && (
            <Card className="border-border/80 bg-card">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Hourly Schedule for {selectedDay.dayName} ({selectedDay.formattedDate})
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {selectedDay.weatherDescription} with temperatures between {formatTemp(selectedDay.temperatureMin)} and {formatTemp(selectedDay.temperatureMax)}.
                    </CardDescription>
                  </div>

                  {travelInsight && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/60 text-xs self-start sm:self-auto">
                      <travelInsight.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-muted-foreground text-xs">
                        <strong className="text-foreground font-medium mr-1">{travelInsight.title}:</strong>
                        {travelInsight.advice}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5">
                {selectedDay.hourly && selectedDay.hourly.length > 0 ? (
                  <div className="overflow-x-auto pb-2 no-scrollbar">
                    <div className="flex items-center gap-2.5 min-w-max">
                      {selectedDay.hourly.map((hourItem) => {
                        const isHNight = hourItem.weatherIcon?.includes("n") ?? false;
                        const hIconMeta = getWeatherIconMeta(hourItem.weatherCode, isHNight);
                        const HIcon = hIconMeta.icon;

                        return (
                          <div
                            key={hourItem.fullTime || hourItem.time}
                            className="flex flex-col items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50 min-w-[85px] sm:min-w-[95px] space-y-2 text-center hover:bg-muted/60 transition-colors"
                          >
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              {hourItem.time}
                            </span>

                            <div className={`p-1.5 rounded-md ${hIconMeta.bg} ${hIconMeta.color}`}>
                              <HIcon className="w-4 h-4" />
                            </div>

                            <div className="font-mono text-xs font-bold text-foreground">
                              {formatTemp(hourItem.temperature)}
                            </div>

                            <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                              <Droplets className="w-2.5 h-2.5 text-sky-500" />
                              <span>{hourItem.precipitationProbability}%</span>
                            </div>

                            <div className="text-[10px] text-muted-foreground/80 font-mono">
                              {unit === "F"
                                ? `${Math.round(hourItem.windSpeed * 0.621371)}mph`
                                : `${hourItem.windSpeed}km/h`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground space-y-1">
                    <p>Standard day forecast outlook: High {formatTemp(selectedDay.temperatureMax)}, Low {formatTemp(selectedDay.temperatureMin)}.</p>
                    <p className="text-[11px]">3-hourly precision activates automatically for near-term dates.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
