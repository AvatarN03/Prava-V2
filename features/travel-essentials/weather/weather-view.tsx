"use client";

import { useState, useTransition, useMemo, useEffect, useRef } from "react";
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Search,
  Wind,
  Droplets,
  Thermometer,
  Calendar,
  Loader2,
  MapPin,
  Sunrise,
  Sunset,
  Eye,
  Gauge,
  Compass,
  Umbrella,
  Sparkles,
  RefreshCw,
  Clock,
  ChevronRight,
  ShieldCheck,
  Globe2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { WeatherData, DailyForecastItem, HourlyForecastItem, CitySuggestion } from "../types";

interface WeatherViewProps {
  initialData: WeatherData | null;
  onSearch: (city: string) => Promise<WeatherData | null>;
  onCitySuggestions?: (query: string) => Promise<CitySuggestion[]>;
}

const QUICK_DESTINATIONS = [
  "Tokyo",
  "Paris",
  "New York",
  "London",
  "Rome",
  "Bali",
  "Reykjavik",
  "Dubai",
];

function getWeatherIconComponent(code: number, isDay: boolean = true) {
  if (code === 0) return { icon: Sun, color: "text-amber-500", bg: "bg-amber-500/10" };
  if (code === 1 || code === 2) return { icon: CloudSun, color: "text-amber-400", bg: "bg-amber-400/10" };
  if (code === 3) return { icon: Cloud, color: "text-slate-400", bg: "bg-slate-400/10" };
  if (code === 45 || code === 48) return { icon: CloudFog, color: "text-zinc-400", bg: "bg-zinc-400/10" };
  if (code >= 51 && code <= 55) return { icon: CloudDrizzle, color: "text-sky-400", bg: "bg-sky-400/10" };
  if (code >= 61 && code <= 65) return { icon: CloudRain, color: "text-blue-500", bg: "bg-blue-500/10" };
  if (code >= 71 && code <= 77) return { icon: CloudSnow, color: "text-indigo-300", bg: "bg-indigo-300/10" };
  if (code >= 80 && code <= 82) return { icon: CloudRain, color: "text-sky-500", bg: "bg-sky-500/10" };
  if (code >= 95) return { icon: CloudLightning, color: "text-purple-500", bg: "bg-purple-500/10" };
  return { icon: CloudSun, color: "text-amber-400", bg: "bg-amber-400/10" };
}

function getUvIndexDescription(uv?: number): { text: string; color: string } {
  if (uv === undefined) return { text: "Moderate", color: "text-amber-500" };
  if (uv <= 2) return { text: "Low (Safe)", color: "text-emerald-500" };
  if (uv <= 5) return { text: "Moderate", color: "text-amber-500" };
  if (uv <= 7) return { text: "High (Wear SPF)", color: "text-orange-500" };
  if (uv <= 10) return { text: "Very High", color: "text-rose-500" };
  return { text: "Extreme", color: "text-purple-600" };
}

function getTravelPackingInsight(day: DailyForecastItem): { title: string; advice: string; icon: React.ElementType } {
  if (day.precipitationProbability > 50 || day.weatherCode >= 61) {
    return {
      title: "Rain Gear Recommended",
      advice: "Pack a compact umbrella or breathable rain shell. Outdoor plans may need waterproof footwear.",
      icon: Umbrella,
    };
  }
  if (day.temperatureMax > 28) {
    return {
      title: "Warm & Sunny Preparation",
      advice: "Lightweight, breathable fabrics, sunglasses, and regular hydration recommended for exploring.",
      icon: Sun,
    };
  }
  if (day.temperatureMin < 8) {
    return {
      title: "Cold Weather Layering",
      advice: "Thermal base layers, a warm insulated jacket, and a scarf will keep you comfortable during evening strolls.",
      icon: CloudSnow,
    };
  }
  return {
    title: "Pleasant Exploration Weather",
    advice: "Great conditions for city walking tours, sightseeing, and outdoor cafes.",
    icon: Sparkles,
  };
}

export function WeatherView({ initialData, onSearch, onCitySuggestions }: WeatherViewProps) {
  const [data, setData] = useState<WeatherData | null>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, startSearch] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);

  // City suggestions state
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced fetch for suggestions when user types >= 3 characters
  useEffect(() => {
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
        setSuggestions(results || []);
        setShowDropdown((results && results.length > 0) || false);
      } catch (err) {
        console.error("Failed to load city suggestions:", err);
      } finally {
        setIsSuggesting(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onCitySuggestions]);

  // Click outside to close suggestion dropdown
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

  const handleSearchCity = (cityName: string) => {
    if (!cityName.trim()) return;
    setError(null);
    setShowDropdown(false);
    startSearch(async () => {
      const result = await onSearch(cityName.trim());
      if (result) {
        setData(result);
        setSelectedDateIndex(0);
        setSearchQuery("");
      } else {
        setError(`Could not find weather data for "${cityName}". Please check the spelling.`);
      }
    });
  };

  const handleSelectSuggestion = (item: CitySuggestion) => {
    setSearchQuery(item.displayName);
    setShowDropdown(false);
    handleSearchCity(item.displayName);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearchCity(searchQuery);
    }
  };

  const formatTemp = (celsius: number) => {
    if (unit === "F") {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  // Safe fallback forecast items if legacy data is passed
  const forecastDays = useMemo(() => {
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
          temperatureMax: data.daily.temperatureMax[idx] || 20,
          temperatureMin: data.daily.temperatureMin[idx] || 15,
          weatherCode: data.daily.weatherCode[idx] || 1,
          weatherDescription: "Forecast Outlook",
          precipitationProbability: data.daily.precipitationProbabilityMax[idx] || 0,
          precipitationAmount: 0,
          windSpeed: data.windSpeed || 10,
          humidity: data.humidity || 50,
          hourly: [],
        };
      });
    }
    return [];
  }, [data]);

  const selectedDay: DailyForecastItem | undefined = forecastDays[selectedDateIndex] || forecastDays[0];
  const travelInsight = selectedDay ? getTravelPackingInsight(selectedDay) : null;
  const currentIconMeta = data ? getWeatherIconComponent(data.weatherCode) : null;
  const CurrentIcon = currentIconMeta?.icon || CloudSun;

  return (
    <div className="space-y-6">
      {/* Search Bar & Destination Quick Pills */}
      <div className="flex flex-col gap-3 pb-2 border-b border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-amber-500" />
                Live Weather & Forecasts
              </h2>
              {data?.source && (
                <Badge variant="secondary" className="text-[10px] font-mono font-medium px-2 py-0 h-5">
                  {data.source === "OpenWeather" ? "OpenWeather API" : "Live Forecast Feed"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instant atmospheric conditions, multi-day forecasting, and hourly breakdowns for global destinations.
            </p>
          </div>

          {/* Unit Switcher & Refresh */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUnit("C")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  unit === "C"
                    ? "bg-background text-foreground shadow-xs"
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
                    ? "bg-background text-foreground shadow-xs"
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
                title="Refresh latest forecast"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? "animate-spin text-primary" : ""}`} />
                <span className="hidden sm:inline ml-1">Refresh</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search Input with Autocomplete Suggestions Dropdown */}
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
          <div ref={searchContainerRef} className="relative flex-1 max-w-md">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search city (e.g. Kyoto, Barcelona, Queenstown)..."
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
              <Button type="submit" size="sm" className="h-9 px-3.5 text-xs cursor-pointer" disabled={isSearching}>
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
              </Button>
            </form>

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-xl overflow-hidden py-1 divide-y divide-border/40 animate-in fade-in-50 zoom-in-95 duration-100">
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
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary">
                        <MapPin className="h-3.5 w-3.5" />
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
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-muted-foreground group-hover:border-primary/40 group-hover:text-primary">
                        {item.country}
                      </Badge>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Destination Pills */}
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
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="h-6 text-xs px-2">
            Dismiss
          </Button>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Main Hero Weather Card */}
          <Card className="border-border/80 bg-gradient-to-br from-card via-card to-muted/20 shadow-xs overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left: Location & Main Temperature */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-primary font-medium text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-semibold text-sm text-foreground">
                      {data.city}{data.country ? `, ${data.country}` : ""}
                    </span>
                    {data.updatedAt && (
                      <span className="text-[10px] text-muted-foreground ml-auto sm:ml-2">
                        Updated {data.updatedAt}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-5">
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

                {/* Right: Atmospheric Matrix Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 border-t lg:border-t-0 lg:border-l border-border/80 pt-4 lg:pt-0 lg:pl-6 text-xs">
                  {/* Wind */}
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Wind className="w-3.5 h-3.5 text-primary" />
                      <span>Wind</span>
                    </div>
                    <div className="font-semibold text-foreground font-mono">
                      {unit === "F" ? `${Math.round(data.windSpeed * 0.621371)} mph` : `${data.windSpeed} km/h`}
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      <span>Humidity</span>
                    </div>
                    <div className="font-semibold text-foreground font-mono">
                      {data.humidity}%
                    </div>
                  </div>

                  {/* Precipitation */}
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Umbrella className="w-3.5 h-3.5 text-blue-500" />
                      <span>Precipitation</span>
                    </div>
                    <div className="font-semibold text-foreground font-mono">
                      {data.precipitationProbability ? `${data.precipitationProbability}% chance` : `${data.precipitation} mm`}
                    </div>
                  </div>

                  {/* UV Index */}
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>UV Index</span>
                    </div>
                    <div className={`font-semibold font-mono ${getUvIndexDescription(data.uvIndex).color}`}>
                      {data.uvIndex !== undefined ? `${data.uvIndex} (${getUvIndexDescription(data.uvIndex).text})` : "Moderate"}
                    </div>
                  </div>

                  {/* Pressure or Visibility */}
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Pressure</span>
                    </div>
                    <div className="font-semibold text-foreground font-mono">
                      {data.pressure ? `${data.pressure} hPa` : "1013 hPa"}
                    </div>
                  </div>

                  {/* Sun Times */}
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                      <span>Sun Times</span>
                    </div>
                    <div className="font-semibold text-foreground text-[11px] truncate">
                      {data.sunrise && data.sunset ? `${data.sunrise} / ${data.sunset}` : "Dawn to Dusk"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selector Strip (Check future days) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Select Date for Detailed Forecast
              </h3>
              <span className="text-[11px] text-muted-foreground">
                Click any day to inspect conditions & hourly schedule
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {forecastDays.map((day, idx) => {
                const isSelected = selectedDateIndex === idx;
                const iconMeta = getWeatherIconComponent(day.weatherCode);
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
                      <div className={`p-2 rounded-lg ${iconMeta.bg} ${iconMeta.color}`}>
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

          {/* Selected Date Details & Hourly Timeline */}
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
                      {selectedDay.weatherDescription} with expected temperatures from {formatTemp(selectedDay.temperatureMin)} to {formatTemp(selectedDay.temperatureMax)}.
                    </CardDescription>
                  </div>

                  {travelInsight && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/60 text-xs self-start sm:self-auto">
                      <travelInsight.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-muted-foreground">
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
                    <div className="inline-flex gap-2 min-w-full">
                      {selectedDay.hourly.map((hourItem) => {
                        const hIconMeta = getWeatherIconComponent(hourItem.weatherCode);
                        const HIcon = hIconMeta.icon;

                        return (
                          <div
                            key={hourItem.fullTime || hourItem.time}
                            className="flex flex-col items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50 min-w-[85px] sm:min-w-[95px] space-y-2 text-center"
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
                    <p className="text-[11px]">3-hourly precision will activate automatically as the date approaches.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Travel Note Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border/70 bg-card flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-foreground">Timezone & Local Coordination</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Weather observations reflect local time in {data.city}. Check the destination time difference before booking morning walking tours or sunset dinners.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-foreground">Smart Forecast Cache</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Forecasts are cached for 30 minutes to reduce battery and data usage while abroad. Hit the refresh button anytime for instant live radar sync.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

