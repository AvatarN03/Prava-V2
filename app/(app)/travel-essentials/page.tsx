import { Suspense } from "react";

import { TravelEssentialsShell } from "./travel-essentials-shell";

import { getCurrentProfile } from "@/features/profile/actions";
import { fetchCurrencyPerformance, fetchFxRates } from "@/features/travel-essentials/currency/currency-service";
import { getVaultLinks } from "@/features/travel-essentials/vault/actions";
import { fetchCitySuggestions, fetchWeather } from "@/features/travel-essentials/weather/weather-service";

export const metadata = {
  title: "Prava Travel Essentials",
  description:
    "Real-time travel companion utilities: live weather forecasts, currency conversions, interactive maps, country guides, emergency contacts, local phrasebooks, and your global resource vault.",
};

const VALID_TABS = ["currency", "weather", "guide", "language", "maps", "vault"] as const;
type TabType = (typeof VALID_TABS)[number];

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function TravelEssentialsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const requestedTab = resolvedParams?.tab === "emergency" ? "guide" : resolvedParams?.tab;
  const activeTab: TabType = VALID_TABS.includes(requestedTab as TabType)
    ? (requestedTab as TabType)
    : "currency";

  const profileRes = await getCurrentProfile();
  const preferredCurrency =
    profileRes.success && profileRes.profile?.defaultCurrency
      ? profileRes.profile.defaultCurrency
      : "INR";

  // On-demand SSR fetching based on requested tab
  let initialWeather = null;
  let initialFxRates = null;
  let initialVaultLinks = null;

  if (activeTab === "currency") {
    initialFxRates = await fetchFxRates(preferredCurrency);
  } else if (activeTab === "weather") {
    initialWeather = await fetchWeather("Mumbai");
  } else if (activeTab === "vault") {
    const vaultRes = await getVaultLinks();
    initialVaultLinks = vaultRes.data || [];
  }

  async function searchWeatherAction(city: string) {
    "use server";
    return await fetchWeather(city);
  }

  async function searchCitySuggestionsAction(query: string) {
    "use server";
    return await fetchCitySuggestions(query);
  }

  async function refreshRatesAction(base: string) {
    "use server";
    return await fetchFxRates(base);
  }

  async function fetchPerformanceAction(
    base: string,
    target: string,
    range: "7D" | "1M" | "3M" | "1Y"
  ) {
    "use server";
    return await fetchCurrencyPerformance(base, target, range);
  }

  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-10 w-48 bg-muted rounded-md" />
          <div className="h-10 w-full bg-muted rounded-xl" />
          <div className="h-64 w-full bg-muted rounded-xl" />
        </div>
      }
    >
      <TravelEssentialsShell
        initialTab={activeTab}
        initialWeather={initialWeather}
        initialFxRates={initialFxRates}
        initialVaultLinks={initialVaultLinks || []}
        preferredCurrency={preferredCurrency}
        onWeatherSearch={searchWeatherAction}
        onCitySuggestions={searchCitySuggestionsAction}
        onFxRefresh={refreshRatesAction}
        onFetchPerformance={fetchPerformanceAction}
      />
    </Suspense>
  );
}
