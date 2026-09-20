"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";

import {
  Bookmark,
  BookOpen,
  CloudSun,
  Coins,
  Languages,
  Loader2,
  Map,
} from "lucide-react";
import type { Link as PrismaLink } from "@prisma/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type {
  CitySuggestion,
  CurrencyPerformanceData,
  FxRates,
  WeatherData,
} from "@/features/travel-essentials/types";

// Tab skeleton fallback for on-demand bundle loading
function TabLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-28 w-full bg-muted/40 rounded-xl border border-border/50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading module...</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="h-20 bg-muted/30 rounded-xl border border-border/40" />
        <div className="h-20 bg-muted/30 rounded-xl border border-border/40" />
        <div className="h-20 bg-muted/30 rounded-xl border border-border/40" />
      </div>
    </div>
  );
}

// Next.js dynamic imports for lazy loading tab bundles without bloating initial page load
const CurrencyConverter = dynamic(
  () =>
    import("@/features/travel-essentials/currency/currency-converter").then(
      (m) => m.CurrencyConverter
    ),
  { loading: () => <TabLoadingSkeleton /> }
);

const WeatherView = dynamic(
  () => import("@/features/travel-essentials/weather/weather-view").then((m) => m.WeatherView),
  { loading: () => <TabLoadingSkeleton /> }
);

const CountryGuideView = dynamic(
  () =>
    import("@/features/travel-essentials/country-guide/country-guide-view").then(
      (m) => m.CountryGuideView
    ),
  { loading: () => <TabLoadingSkeleton /> }
);

const LanguageView = dynamic(
  () =>
    import("@/features/travel-essentials/language/language-view").then((m) => m.LanguageView),
  { loading: () => <TabLoadingSkeleton /> }
);

const MapView = dynamic(
  () => import("@/features/travel-essentials/maps/map-view").then((m) => m.MapView),
  { ssr: false, loading: () => <TabLoadingSkeleton /> }
);

const VaultView = dynamic(
  () =>
    import("@/features/travel-essentials/vault/components/vault-view").then(
      (m) => m.VaultView
    ),
  { loading: () => <TabLoadingSkeleton /> }
);

export type TabType = "currency" | "weather" | "guide" | "language" | "maps" | "vault";

interface TravelEssentialsShellProps {
  initialTab?: TabType;
  initialWeather: WeatherData | null;
  initialFxRates: FxRates | null;
  initialVaultLinks?: PrismaLink[];
  preferredCurrency?: string;
  onWeatherSearch: (city: string) => Promise<WeatherData | null>;
  onCitySuggestions?: (query: string) => Promise<CitySuggestion[]>;
  onFxRefresh: (base: string) => Promise<FxRates | null>;
  onFetchPerformance?: (
    base: string,
    target: string,
    range: "7D" | "1M" | "3M" | "1Y"
  ) => Promise<CurrencyPerformanceData | null>;
}

// Curated priority order: Most frequent tools first (Currency -> Weather -> Country Guide -> Language -> Maps -> Vault)
const TABS: { id: TabType; label: string; description: string; icon: React.ElementType; iconColor: string }[] = [
  { id: "currency", label: "Currency", description: "Live ECB rates & conversions", icon: Coins, iconColor: "text-emerald-500" },
  { id: "weather", label: "Weather", description: "Forecasts & packing tips", icon: CloudSun, iconColor: "text-amber-500" },
  { id: "guide", label: "Country Guide", description: "Visas, plugs & emergency facts", icon: BookOpen, iconColor: "text-indigo-500" },
  { id: "language", label: "Language", description: "Local phrases & phrasebooks", icon: Languages, iconColor: "text-violet-500" },
  { id: "maps", label: "Maps", description: "Interactive POI radar & amenities", icon: Map, iconColor: "text-sky-500" },
  { id: "vault", label: "Resource Vault", description: "Saved links, docs & bookings", icon: Bookmark, iconColor: "text-blue-500" },
];

export function TravelEssentialsShell({
  initialTab = "currency",
  initialWeather,
  initialFxRates,
  initialVaultLinks = [],
  preferredCurrency = "INR",
  onWeatherSearch,
  onCitySuggestions,
  onFxRefresh,
  onFetchPerformance,
}: TravelEssentialsShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize active tab from search params if available, fallback to initialTab
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const rawQueryTab = searchParams.get("tab");
    const normalized =
      rawQueryTab === "emergency" ? "guide" : (rawQueryTab as TabType | null);
    if (normalized && TABS.some((t) => t.id === normalized)) {
      return normalized;
    }
    return initialTab;
  });

  // Track visited tabs to lazy-mount components on their first click, then retain them in DOM
  const [visitedTabs, setVisitedTabs] = useState<Set<TabType>>(() => new Set([activeTab]));

  // Find metadata for the currently active tab
  const activeTabMeta = TABS.find((t) => t.id === activeTab) || TABS[0];
  const ActiveIcon = activeTabMeta.icon;

  // Instant client-side tab switching with shallow URL synchronization
  const handleTabChange = (val: string) => {
    const nextTab = val as TabType;
    setActiveTab(nextTab);
    setVisitedTabs((prev) => {
      if (prev.has(nextTab)) return prev;
      const nextSet = new Set(prev);
      nextSet.add(nextTab);
      return nextSet;
    });

    // Shallow history replace — updates address bar without triggering Next.js server component re-renders
    if (typeof window !== "undefined") {
      const url = nextTab === "currency" ? pathname : `${pathname}?tab=${nextTab}`;
      window.history.replaceState(null, "", url);
    }
  };

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("tab");
      const normalized = raw === "emergency" ? "guide" : (raw as TabType | null);
      const target: TabType =
        normalized && TABS.some((t) => t.id === normalized) ? normalized : "currency";
      setActiveTab(target);
      setVisitedTabs((prev) => {
        if (prev.has(target)) return prev;
        const nextSet = new Set(prev);
        nextSet.add(target);
        return nextSet;
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 pb-2 border-b border-border/80">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Prava Travel Essentials
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          A dedicated toolkit for smooth journeys. Check live forecasts, convert currencies, explore maps, and access emergency contacts and phrasebooks.
        </p>
      </div>

      {/* Navigation Controls: Mobile Select Dropdown (< sm) & Desktop Tab Strip (>= sm) */}
      <div className="space-y-3">
        {/* Mobile Tool Selector (< sm) */}
        <div className="sm:hidden space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Travel Tool
            </span>
            <span className="text-[11px] font-medium text-primary">
              {TABS.findIndex((t) => t.id === activeTab) + 1} of {TABS.length} tools
            </span>
          </div>

          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full h-12 bg-card border-border shadow-xs px-3 rounded-lg text-left cursor-pointer focus:ring-[#2D9BF0]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60 shrink-0">
                  <ActiveIcon className={`w-4 h-4 ${activeTabMeta.iconColor}`} />
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="truncate text-xs font-bold text-foreground">
                    {activeTabMeta.label}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground font-normal">
                    {activeTabMeta.description}
                  </span>
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="w-[calc(100vw-2rem)] max-w-sm">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SelectItem
                    key={tab.id}
                    value={tab.id}
                    className="cursor-pointer py-2.5 text-xs font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/50 shrink-0">
                        <Icon className={`w-3.5 h-3.5 ${tab.iconColor}`} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-foreground text-xs">{tab.label}</span>
                        <span className="text-[10px] text-muted-foreground">{tab.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tabs (> sm) */}
        <div className="hidden sm:block overflow-x-auto pb-1 no-scrollbar">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="h-10 bg-muted/70 p-1 rounded-xl border border-border/60 inline-flex items-center gap-1 w-auto min-w-full sm:min-w-0 justify-start">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-150 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs cursor-pointer select-none"
                  >
                    <Icon className={`w-3.5 h-3.5 ${tab.iconColor} shrink-0`} />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Contents: Retained in DOM once visited with zero skeleton flash & instant 0ms switching */}
      <div className="w-full">
        {/* Currency Converter */}
        <div className={activeTab === "currency" ? "block" : "hidden"}>
          {visitedTabs.has("currency") && (
            <CurrencyConverter
              initialRates={initialFxRates}
              userPreferredCurrency={preferredCurrency}
              onRefresh={onFxRefresh}
              onFetchPerformance={onFetchPerformance}
            />
          )}
        </div>

        {/* Weather Forecasts */}
        <div className={activeTab === "weather" ? "block" : "hidden"}>
          {visitedTabs.has("weather") && (
            <WeatherView
              initialData={initialWeather}
              onSearch={onWeatherSearch}
              onCitySuggestions={onCitySuggestions}
            />
          )}
        </div>

        {/* Country Guide */}
        <div className={activeTab === "guide" ? "block" : "hidden"}>
          {visitedTabs.has("guide") && <CountryGuideView />}
        </div>

        {/* Language Phrasebook */}
        <div className={activeTab === "language" ? "block" : "hidden"}>
          {visitedTabs.has("language") && <LanguageView />}
        </div>

        {/* Interactive Maps */}
        <div className={activeTab === "maps" ? "block" : "hidden"}>
          {visitedTabs.has("maps") && <MapView />}
        </div>

        {/* Resource Vault */}
        <div className={activeTab === "vault" ? "block" : "hidden"}>
          {visitedTabs.has("vault") && <VaultView initialLinks={initialVaultLinks} />}
        </div>
      </div>
    </div>
  );
}
