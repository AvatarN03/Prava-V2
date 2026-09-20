"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import {
  ArrowUpRight,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Crosshair,
  Droplets,
  Loader2,
  MapPin,
  Moon,
  Sun,
  Wind,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  getWeatherAction,
  getWeatherByCoordsAction,
} from "@/features/travel-essentials/weather/actions";
import {
  broadcastWeatherUpdate,
  detectLocationViaGPS,
  detectLocationViaIP,
  getCachedWeather,
  listenWeatherUpdate,
} from "@/features/travel-essentials/weather/location-service";
import type { WeatherData } from "@/features/travel-essentials/types";

function getTopBarWeatherIcon(code?: number, iconCode?: string) {
  const isNight = iconCode?.includes("n");
  if (code === 0) {
    return isNight
      ? { Icon: Moon, color: "text-indigo-400", bg: "bg-indigo-500/10" }
      : { Icon: Sun, color: "text-amber-500", bg: "bg-amber-500/10" };
  }
  if (code === 1 || code === 2) {
    return isNight
      ? { Icon: Cloud, color: "text-indigo-300", bg: "bg-indigo-500/10" }
      : { Icon: CloudSun, color: "text-amber-500", bg: "bg-amber-500/10" };
  }
  if (code === 3) return { Icon: Cloud, color: "text-slate-400", bg: "bg-slate-400/10" };
  if (code === 45 || code === 48) return { Icon: CloudFog, color: "text-zinc-400", bg: "bg-zinc-400/10" };
  if (code >= 51 && code <= 55) return { Icon: CloudDrizzle, color: "text-sky-400", bg: "bg-sky-400/10" };
  if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
    return { Icon: CloudRain, color: "text-blue-500", bg: "bg-blue-500/10" };
  }
  if (code >= 71 && code <= 77) return { Icon: CloudSnow, color: "text-indigo-300", bg: "bg-indigo-300/10" };
  if (code >= 95) return { Icon: CloudLightning, color: "text-purple-500", bg: "bg-purple-500/10" };
  return { Icon: CloudSun, color: "text-amber-500", bg: "bg-amber-500/10" };
}

export function TopBarWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(() => getCachedWeather());
  const [isDetecting, startDetecting] = useTransition();
  const [open, setOpen] = useState(false);

  // Initial silent location & weather detection (zero permissions required via IP)
  useEffect(() => {
    // Listen for real-time weather updates broadcast from anywhere in the app
    const unsubscribe = listenWeatherUpdate((updatedData) => {
      setWeather(updatedData);
    });

    // If no fresh weather data in cache, silently resolve city via IP and fetch weather
    if (!weather) {
      startDetecting(async () => {
        try {
          const loc = await detectLocationViaIP();
          const data = loc.lat && loc.lon
            ? await getWeatherByCoordsAction(loc.lat, loc.lon, loc.city)
            : await getWeatherAction(loc.city || "Mumbai");

          if (data) {
            setWeather(data);
            broadcastWeatherUpdate(data);
          }
        } catch (err) {
          console.error("Silent topbar weather detection error:", err);
        }
      });
    }

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Explicit GPS / Pinpoint Locate Me action
  const handleLocateMe = () => {
    startDetecting(async () => {
      toast.info("Requesting device location...");
      const coords = await detectLocationViaGPS();

      if (!coords) {
        toast.error("Location permission denied or unavailable. Using network IP.");
        const ipLoc = await detectLocationViaIP();
        const data = await getWeatherAction(ipLoc.city || "Mumbai");
        if (data) {
          setWeather(data);
          broadcastWeatherUpdate(data);
          toast.success(`Weather updated for ${data.city}`);
        }
        return;
      }

      const data = await getWeatherByCoordsAction(coords.lat, coords.lon);
      if (data) {
        setWeather(data);
        broadcastWeatherUpdate(data);
        toast.success(`Local weather updated for ${data.city}`);
      } else {
        toast.error("Could not fetch forecast for your coordinates.");
      }
    });
  };

  const iconMeta = getTopBarWeatherIcon(weather?.weatherCode, weather?.weatherIcon);
  const WeatherIcon = iconMeta.Icon;
  const firstDay = weather?.forecastDays?.[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="View local weather"
          className="h-8.5 px-2 sm:px-2.5 rounded-full border border-border/70 hover:border-primary/40 bg-card/70 hover:bg-muted/70 backdrop-blur-xs flex items-center gap-1.5 transition-all text-xs cursor-pointer select-none shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {/* Crisp Vector Weather Icon */}
          <WeatherIcon className={`w-4 h-4 ${iconMeta.color} shrink-0`} />

          {/* Temperature & City */}
          {weather ? (
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-semibold text-foreground text-xs font-mono">
                {weather.temperature}°C
              </span>
              <span className="hidden lg:inline-block text-[11px] text-muted-foreground font-medium truncate max-w-[80px]">
                · {weather.city}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              {isDetecting ? (
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
              ) : (
                "Weather"
              )}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-76 p-4 rounded-xl border border-border/80 bg-card shadow-lg text-foreground"
      >
        {weather ? (
          <div className="space-y-3.5">
            {/* Header: Icon, City & Temperature */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconMeta.bg} ${iconMeta.color} shrink-0`}>
                  <WeatherIcon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs font-semibold text-foreground truncate">
                    <MapPin className="w-3 h-3 text-primary shrink-0" />
                    <span className="truncate">{weather.city}</span>
                    {weather.country && (
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({weather.country})
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground capitalize truncate">
                    {weather.weatherDescription}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-bold font-mono text-foreground">
                  {weather.temperature}°C
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Feels {weather.apparentTemperature}°C
                </p>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-1.5 p-2 bg-muted/40 rounded-lg border border-border/50 text-center">
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium">High / Low</span>
                <span className="text-xs font-semibold font-mono text-foreground">
                  {firstDay ? `${firstDay.temperatureMax}° / ${firstDay.temperatureMin}°` : "--"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium flex items-center justify-center gap-0.5">
                  <Droplets className="w-2.5 h-2.5 text-sky-500" /> Humidity
                </span>
                <span className="text-xs font-semibold font-mono text-foreground">
                  {weather.humidity}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium flex items-center justify-center gap-0.5">
                  <Wind className="w-2.5 h-2.5 text-teal-500" /> Wind
                </span>
                <span className="text-xs font-semibold font-mono text-foreground">
                  {weather.windSpeed} km/h
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLocateMe}
                disabled={isDetecting}
                className="flex-1 h-8 text-[11px] font-medium gap-1.5 cursor-pointer"
              >
                {isDetecting ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <Crosshair className="w-3 h-3 text-primary" />
                )}
                <span>Locate Me</span>
              </Button>

              <Button
                asChild
                variant="secondary"
                size="sm"
                onClick={() => setOpen(false)}
                className="flex-1 h-8 text-[11px] font-medium gap-1 cursor-pointer bg-primary/10 text-primary hover:bg-primary/20"
              >
                <Link href="/travel-essentials?tab=weather">
                  <span>Full Radar</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center space-y-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">Detecting local weather...</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
