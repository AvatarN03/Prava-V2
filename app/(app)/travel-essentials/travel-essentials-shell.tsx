"use client";

import { useState, useEffect, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  CloudSun,
  Coins,
  Map,
  BookOpen,
  ShieldAlert,
  Languages,
  Compass,
  Loader2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  WeatherData,
  FxRates,
  CitySuggestion,
  CurrencyPerformanceData,
} from "@/features/travel-essentials/types";

// Tab skeleton fallback for lazy loading
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

// Next.js dynamic imports for on-demand bundle & component loading
const WeatherView = dynamic(
  () => import("@/features/travel-essentials/weather/weather-view").then((m) => m.WeatherView),
  { loading: () => <TabLoadingSkeleton /> }
);

const CurrencyConverter = dynamic(
  () =>
    import("@/features/travel-essentials/currency/currency-converter").then(
      (m) => m.CurrencyConverter
    ),
  { loading: () => <TabLoadingSkeleton /> }
);

const MapView = dynamic(
  () => import("@/features/travel-essentials/maps/map-view").then((m) => m.MapView),
  { ssr: false, loading: () => <TabLoadingSkeleton /> }
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

export type TabType = "weather" | "currency" | "maps" | "guide" | "language";

interface TravelEssentialsShellProps {
  initialTab?: TabType;
  initialWeather: WeatherData | null;
  initialFxRates: FxRates | null;
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

const TABS: { id: TabType; label: string; icon: React.ElementType; iconColor: string }[] = [
  { id: "weather", label: "Weather", icon: CloudSun, iconColor: "text-amber-500" },
  { id: "currency", label: "Currency", icon: Coins, iconColor: "text-emerald-500" },
  { id: "maps", label: "Maps", icon: Map, iconColor: "text-sky-500" },
  { id: "guide", label: "Country Guide", icon: BookOpen, iconColor: "text-indigo-500" },
  { id: "language", label: "Language", icon: Languages, iconColor: "text-violet-500" },
];

export function TravelEssentialsShell({
  initialTab = "weather",
  initialWeather,
  initialFxRates,
  preferredCurrency = "USD",
  onWeatherSearch,
  onCitySuggestions,
  onFxRefresh,
  onFetchPerformance,
}: TravelEssentialsShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL query parameter if present, otherwise initialTab
  const rawQueryTab = searchParams.get("tab");
  const currentQueryTab: TabType | null =
    rawQueryTab === "emergency"
      ? "guide"
      : (rawQueryTab as TabType | null);

  const activeTab: TabType =
    currentQueryTab && TABS.some((t) => t.id === currentQueryTab)
      ? currentQueryTab
      : initialTab;

  const handleTabChange = (val: string) => {
    const nextTab = val as TabType;
    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === "weather") {
      params.delete("tab");
    } else {
      params.set("tab", nextTab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 pb-2 border-b border-border/80">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Compass className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Travel Essentials
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          A dedicated toolkit for smooth journeys. Check live forecasts, convert currencies, explore maps, and access emergency contacts and phrasebooks.
        </p>
      </div>

      {/* Shadcn Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full space-y-6"
      >
        <div className="overflow-x-auto pb-1 no-scrollbar">
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
        </div>

        {/* Tab Contents rendered on-demand for optimal DOM & load performance */}
        <TabsContent value="weather" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {activeTab === "weather" && (
            <WeatherView
              initialData={initialWeather}
              onSearch={onWeatherSearch}
              onCitySuggestions={onCitySuggestions}
            />
          )}
        </TabsContent>

        <TabsContent value="currency" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {activeTab === "currency" && (
            <CurrencyConverter
              initialRates={initialFxRates}
              userPreferredCurrency={preferredCurrency}
              onRefresh={onFxRefresh}
              onFetchPerformance={onFetchPerformance}
            />
          )}
        </TabsContent>

        <TabsContent value="maps" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {activeTab === "maps" && <MapView />}
        </TabsContent>

        <TabsContent value="guide" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {activeTab === "guide" && <CountryGuideView />}
        </TabsContent>

        <TabsContent value="language" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {activeTab === "language" && <LanguageView />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

