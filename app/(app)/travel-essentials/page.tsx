import { fetchWeather, fetchCitySuggestions } from "@/features/travel-essentials/weather/weather-service";
import { fetchFxRates } from "@/features/travel-essentials/currency/currency-service";
import { TravelEssentialsShell } from "./travel-essentials-shell";

export const metadata = {
  title: "Travel Essentials | Prava",
  description: "Real-time travel companion utilities: live weather forecasts, currency conversions, interactive maps, country guides, emergency contacts, and local phrasebooks.",
};

export default async function TravelEssentialsPage() {
  const [initialWeather, initialFxRates] = await Promise.all([
    fetchWeather("Tokyo"),
    fetchFxRates("USD"),
  ]);

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

  return (
    <TravelEssentialsShell
      initialWeather={initialWeather}
      initialFxRates={initialFxRates}
      onWeatherSearch={searchWeatherAction}
      onCitySuggestions={searchCitySuggestionsAction}
      onFxRefresh={refreshRatesAction}
    />
  );
}
