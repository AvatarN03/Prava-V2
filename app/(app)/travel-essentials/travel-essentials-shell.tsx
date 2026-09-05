"use client";

import { useState } from "react";
import {
  CloudSun,
  Coins,
  Map,
  BookOpen,
  ShieldAlert,
  Languages,
  Compass,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WeatherData, FxRates, CitySuggestion } from "@/features/travel-essentials/types";
import { WeatherView } from "@/features/travel-essentials/weather/weather-view";
import { CurrencyConverter } from "@/features/travel-essentials/currency/currency-converter";
import { MapView } from "@/features/travel-essentials/maps/map-view";
import { CountryGuideView } from "@/features/travel-essentials/country-guide/country-guide-view";
import { EmergencyView } from "@/features/travel-essentials/emergency/emergency-view";
import { LanguageView } from "@/features/travel-essentials/language/language-view";

interface TravelEssentialsShellProps {
  initialWeather: WeatherData | null;
  initialFxRates: FxRates | null;
  onWeatherSearch: (city: string) => Promise<WeatherData | null>;
  onCitySuggestions?: (query: string) => Promise<CitySuggestion[]>;
  onFxRefresh: (base: string) => Promise<FxRates | null>;
}

type TabType = "weather" | "currency" | "maps" | "guide" | "emergency" | "language";

const TABS: { id: TabType; label: string; icon: React.ElementType; iconColor: string }[] = [
  { id: "weather", label: "Weather", icon: CloudSun, iconColor: "text-amber-500" },
  { id: "currency", label: "Currency", icon: Coins, iconColor: "text-emerald-500" },
  { id: "maps", label: "Maps", icon: Map, iconColor: "text-sky-500" },
  { id: "guide", label: "Country Guide", icon: BookOpen, iconColor: "text-indigo-500" },
  { id: "emergency", label: "Emergency", icon: ShieldAlert, iconColor: "text-rose-500" },
  { id: "language", label: "Language", icon: Languages, iconColor: "text-violet-500" },
];

export function TravelEssentialsShell({
  initialWeather,
  initialFxRates,
  onWeatherSearch,
  onCitySuggestions,
  onFxRefresh,
}: TravelEssentialsShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>("weather");

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
        onValueChange={(val) => setActiveTab(val as TabType)}
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

        {/* Tab Contents */}
        <TabsContent value="weather" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <WeatherView
            initialData={initialWeather}
            onSearch={onWeatherSearch}
            onCitySuggestions={onCitySuggestions}
          />
        </TabsContent>

        <TabsContent value="currency" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <CurrencyConverter initialRates={initialFxRates} onRefresh={onFxRefresh} />
        </TabsContent>

        <TabsContent value="maps" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <MapView />
        </TabsContent>

        <TabsContent value="guide" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <CountryGuideView />
        </TabsContent>

        <TabsContent value="emergency" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <EmergencyView />
        </TabsContent>

        <TabsContent value="language" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <LanguageView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
