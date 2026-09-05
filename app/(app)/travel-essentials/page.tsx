import { Suspense } from "react";
import { fetchWeather, fetchCitySuggestions } from "@/features/travel-essentials/weather/weather-service";
import { fetchFxRates, fetchCurrencyPerformance } from "@/features/travel-essentials/currency/currency-service";
import { getCurrentProfile } from "@/features/profile/actions";
import { TravelEssentialsShell } from "./travel-essentials-shell";

export const metadata = {
  title: "Travel Essentials | Prava",
  description:
    "Real-time travel companion utilities: live weather forecasts, currency conversions, interactive maps, country guides, emergency contacts, and local phrasebooks.",
};

const VALID_TABS = ["weather", "currency", "maps", "guide", "emergency", "language"] as const;
type TabType = (typeof VALID_TABS)[number];

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function TravelEssentialsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const requestedTab = resolvedParams?.tab;
  const activeTab: TabType = VALID_TABS.includes(requestedTab as TabType)
    ? (requestedTab as TabType)
    : "weather";

  const profileRes = await getCurrentProfile();
  const preferredCurrency =
    profileRes.success && profileRes.profile?.defaultCurrency
      ? profileRes.profile.defaultCurrency
      : "USD";

  // On-demand SSR fetching based on requested tab
  let initialWeather = null;
  let initialFxRates = null;

  if (activeTab === "weather") {
    initialWeather = await fetchWeather("Tokyo");
  } else if (activeTab === "currency") {
    initialFxRates = await fetchFxRates(preferredCurrency);
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
        preferredCurrency={preferredCurrency}
        onWeatherSearch={searchWeatherAction}
        onCitySuggestions={searchCitySuggestionsAction}
        onFxRefresh={refreshRatesAction}
        onFetchPerformance={fetchPerformanceAction}
      />
    </Suspense>
  );
}
