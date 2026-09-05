"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Map,
  Search,
  Loader2,
  MapPin,
  Crosshair,
  Hotel,
  Pill,
  ShoppingCart,
  DollarSign,
  Train,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapLocationSuggestion,
  NearbyEssentialPOI,
  EssentialCategory,
  fetchMapLocationSuggestions,
  fetchNearbyTravelEssentials,
  reverseGeocodeLocation,
  formatDistance,
} from "./map-service";

// Client-only dynamic import to avoid Leaflet SSR window errors
const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full flex items-center justify-center bg-muted/30 rounded-xl border border-border">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span>Initializing interactive travel map...</span>
      </div>
    </div>
  ),
});

const POPULAR_DESTINATIONS = [
  { name: "Paris, France", coords: [48.8566, 2.3522] as [number, number] },
  { name: "Tokyo, Japan", coords: [35.6762, 139.6503] as [number, number] },
  { name: "Rome, Italy", coords: [41.9028, 12.4964] as [number, number] },
  { name: "New York, USA", coords: [40.7128, -74.006] as [number, number] },
  { name: "London, UK", coords: [51.5074, -0.1278] as [number, number] },
  { name: "Dubai, UAE", coords: [25.2048, 55.2708] as [number, number] },
  { name: "Sydney, Australia", coords: [-33.8688, 151.2093] as [number, number] },
];

const CATEGORY_TABS: {
  id: "all" | EssentialCategory;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: "all", label: "All Essentials", icon: Sparkles, color: "text-primary" },
  { id: "hotel", label: "Hotels & Stays", icon: Hotel, color: "text-indigo-500" },
  { id: "pharmacy", label: "Pharmacies & Chemists", icon: Pill, color: "text-rose-500" },
  { id: "supermarket", label: "General Stores", icon: ShoppingCart, color: "text-emerald-500" },
  { id: "atm", label: "ATMs & Cash", icon: DollarSign, color: "text-amber-500" },
  { id: "transit", label: "Transit & Metro", icon: Train, color: "text-sky-500" },
];

export function MapView() {
  const [center, setCenter] = useState<[number, number]>([35.6762, 139.6503]); // Tokyo default
  const [zoom, setZoom] = useState<number>(14);
  const [locationName, setLocationName] = useState<string>("Tokyo, Japan");
  const [isUserDeviceLocation, setIsUserDeviceLocation] = useState(false);
  const [deviceCoords, setDeviceCoords] = useState<[number, number] | null>(null);

  // Search & Autocomplete suggestions state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<MapLocationSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Geolocation states
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Nearby Travel Essentials POI state
  const [pois, setPois] = useState<NearbyEssentialPOI[]>([]);
  const [isLoadingPois, setIsLoadingPois] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | EssentialCategory>("all");
  const [selectedPoi, setSelectedPoi] = useState<NearbyEssentialPOI | null>(null);

  // Debounced fetch for suggestions when user types >= 3 characters
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const results = await fetchMapLocationSuggestions(trimmed);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error("Failed to load map suggestions:", err);
      } finally {
        setIsSuggesting(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to dismiss suggestions dropdown
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

  // Fetch nearby travel essentials whenever center coordinates change
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingPois(true);
    setSelectedPoi(null);

    fetchNearbyTravelEssentials(center[0], center[1])
      .then((data) => {
        if (!isCancelled) {
          setPois(data);
          setIsLoadingPois(false);
        }
      })
      .catch((err) => {
        console.error("Error loading nearby essentials:", err);
        if (!isCancelled) setIsLoadingPois(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [center]);

  // Handle location search selection
  const handleSelectLocation = (
    name: string,
    coords: [number, number],
    isDevice: boolean = false
  ) => {
    setCenter(coords);
    setZoom(14);
    setLocationName(name);
    setIsUserDeviceLocation(isDevice);
    setShowDropdown(false);
    setSearchQuery("");
    setLocationError(null);
  };

  // Handle direct search form submit
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSuggesting(true);
    try {
      const results = await fetchMapLocationSuggestions(searchQuery.trim());
      if (results.length > 0) {
        const first = results[0];
        handleSelectLocation(first.displayName, [first.lat, first.lon]);
      } else {
        setLocationError(`Could not find "${searchQuery}". Please check the spelling.`);
      }
    } catch (err) {
      setLocationError("Failed to search location.");
    } finally {
      setIsSuggesting(false);
    }
  };

  // Handle "Locate Me" device GPS permission request
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const coords: [number, number] = [lat, lon];
        setDeviceCoords(coords);

        try {
          const geoInfo = await reverseGeocodeLocation(lat, lon);
          handleSelectLocation(geoInfo.shortName, coords, true);
        } catch {
          handleSelectLocation("My Device Location", coords, true);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location access denied. Please allow location permissions in your browser settings to pinpoint your device on the map."
          );
        } else {
          setLocationError("Unable to retrieve your location. Please check your GPS or internet connection.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Filtered POIs based on active category
  const filteredPois = useMemo(() => {
    if (activeCategory === "all") return pois;
    return pois.filter((p) => p.category === activeCategory);
  }, [pois, activeCategory]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: pois.length,
      hotel: 0,
      pharmacy: 0,
      supermarket: 0,
      atm: 0,
      transit: 0,
    };
    pois.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [pois]);

  return (
    <div className="space-y-6">
      {/* Header & Controls Strip */}
      <div className="flex flex-col gap-3 pb-2 border-b border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Map className="w-4 h-4 text-sky-500" />
                Interactive Travel Maps & Local Essentials
              </h2>
              <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0">
                Live OpenStreetMap Feed
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Explore destinations, pinpoint your device location, and discover nearby hotels, chemist stores, general markets, and transit stations.
            </p>
          </div>

          {/* Device Geolocation Locate Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant={isUserDeviceLocation ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
              onClick={handleLocateMe}
              disabled={isLocating}
              title="Request device GPS location"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              ) : (
                <Crosshair className={`w-3.5 h-3.5 ${isUserDeviceLocation ? "text-primary-foreground" : "text-sky-500"}`} />
              )}
              <span>{isLocating ? "Detecting GPS..." : isUserDeviceLocation ? "My GPS Active" : "Locate Me"}</span>
            </Button>
          </div>
        </div>

        {/* Search Bar with Autocomplete Suggestions */}
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
          <div ref={searchContainerRef} className="relative flex-1 max-w-md">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search destination (e.g. Kyoto, Barcelona, Queenstown)..."
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
                    if (e.key === "Escape") setShowDropdown(false);
                  }}
                />
                {isSuggesting && (
                  <Loader2 className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-primary animate-spin" />
                )}
              </div>
              <Button type="submit" size="sm" className="h-9 px-3.5 text-xs cursor-pointer" disabled={isSuggesting}>
                {isSuggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
              </Button>
            </form>

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-xl overflow-hidden py-1 divide-y divide-border/40 animate-in fade-in-50 zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 flex items-center justify-between">
                  <span>Destination Suggestions</span>
                  <span className="text-[9px] font-normal lowercase text-muted-foreground/70">
                    {suggestions.length} places
                  </span>
                </div>
                {suggestions.map((item, index) => (
                  <button
                    key={`${item.shortName}-${item.lat}-${item.lon}-${index}`}
                    type="button"
                    onClick={() => handleSelectLocation(item.displayName, [item.lat, item.lon])}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-3 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer group select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-foreground group-hover:text-primary">
                          {item.shortName}
                        </span>
                        {item.secondaryText && (
                          <span className="text-muted-foreground text-[11px] ml-1">
                            ({item.secondaryText})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Destination Pins */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap mr-1 font-medium">Quick pins:</span>
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                type="button"
                onClick={() => handleSelectLocation(dest.name, dest.coords)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer border ${
                  locationName === dest.name
                    ? "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400 font-semibold"
                    : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {dest.name.split(",")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Geolocation Warning / Error Alert */}
      {locationError && (
        <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{locationError}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocationError(null)}
            className="h-6 text-xs px-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Interactive Map & Nearby Essentials Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Map View (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border/80 bg-card overflow-hidden shadow-xs">
            {/* Map Top Bar */}
            <div className="p-3 border-b border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                <span className="font-semibold text-sm truncate">{locationName}</span>
                {isUserDeviceLocation && (
                  <Badge variant="outline" className="text-[10px] font-mono border-blue-500/40 text-blue-600 bg-blue-500/10">
                    GPS Active
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
                <span>
                  {center[0].toFixed(4)}° N, {center[1].toFixed(4)}° E
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">1.5 km radius scan</span>
              </div>
            </div>

            {/* Interactive Leaflet Map Component */}
            <MapInner
              center={center}
              zoom={zoom}
              locationName={locationName}
              isUserDeviceLocation={isUserDeviceLocation}
              deviceCoords={deviceCoords}
              pois={filteredPois}
              selectedPoi={selectedPoi}
              onSelectPoi={setSelectedPoi}
            />

            {/* Map Bottom Legend */}
            <div className="p-2.5 border-t border-border/50 bg-muted/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground px-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-medium text-foreground">Marker Legend:</span>
                <span className="flex items-center gap-1">🏨 Hotels</span>
                <span className="flex items-center gap-1">💊 Pharmacies</span>
                <span className="flex items-center gap-1">🛒 General Stores</span>
                <span className="flex items-center gap-1">🏧 ATMs</span>
                <span className="flex items-center gap-1">🚆 Transit</span>
              </div>
              <span>Click any marker to inspect</span>
            </div>
          </Card>
        </div>

        {/* Right: Nearby Travel Essentials Explorer (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          <Card className="border-border/80 bg-card shadow-xs flex-1 flex flex-col">
            <CardHeader className="p-4 pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <CardTitle className="text-sm font-semibold">
                    Nearby Travel Essentials
                  </CardTitle>
                </div>
                {isLoadingPois && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                )}
              </div>
              <CardDescription className="text-xs">
                Essential amenities within 1.5 km of {locationName.split(",")[0]}.
              </CardDescription>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2">
                {CATEGORY_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const count = categoryCounts[tab.id] ?? 0;
                  const isCurrent = activeCategory === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCategory(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border select-none ${
                        isCurrent
                          ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                          : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted"
                      }`}
                    >
                      <Icon className={`w-3 h-3 ${isCurrent ? "text-primary-foreground" : tab.color}`} />
                      <span>{tab.label.split(" ")[0]}</span>
                      <span className={`text-[10px] px-1 py-0 rounded-full font-mono ${isCurrent ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="p-3 flex-1 flex flex-col max-h-[440px] overflow-y-auto thin-scrollbar">
              {isLoadingPois ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span>Scanning local area for travel essentials...</span>
                </div>
              ) : filteredPois.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">No places found in this category.</p>
                  <p className="text-[11px]">Try switching to &quot;All Essentials&quot; or search a busier city area.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPois.map((poi) => {
                    const isSelected = selectedPoi?.id === poi.id;
                    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${poi.name} ${poi.lat},${poi.lon}`
                    )}`;

                    return (
                      <div
                        key={poi.id}
                        onClick={() => setSelectedPoi(poi)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                          isSelected
                            ? "border-sky-500 bg-sky-500/5 shadow-xs ring-1 ring-sky-500/30"
                            : "border-border/70 bg-card hover:bg-muted/40 hover:border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                              {poi.categoryLabel}
                            </span>
                            <h4 className={`text-xs font-bold leading-snug truncate ${isSelected ? "text-sky-600 dark:text-sky-400" : "text-foreground"}`}>
                              {poi.name}
                            </h4>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 block">
                              {formatDistance(poi.distanceMeters)}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center justify-end gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> ~{poi.walkingMinutes}m
                            </span>
                          </div>
                        </div>

                        {poi.address && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {poi.address}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                          {poi.openingHours ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              {poi.openingHours}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Standard Hours</span>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPoi(poi);
                              }}
                              className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                            >
                              Show on Map
                            </button>
                            <a
                              href={gmapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                            >
                              Directions <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
