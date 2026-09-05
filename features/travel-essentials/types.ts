export interface HourlyForecastItem {
  time: string; // e.g. "14:00"
  fullTime: string; // e.g. "2026-09-05 14:00"
  hour: number;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon?: string;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  uvIndex?: number;
}

export interface DailyForecastItem {
  date: string; // "YYYY-MM-DD"
  dayName: string; // "Today", "Tomorrow", "Mon", etc.
  formattedDate: string; // "Sep 5"
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon?: string;
  precipitationProbability: number;
  precipitationAmount: number;
  windSpeed: number;
  humidity: number;
  uvIndex?: number;
  sunrise?: string;
  sunset?: string;
  hourly: HourlyForecastItem[];
}

export interface WeatherData {
  city: string;
  country: string;
  coordinates?: { lat: number; lon: number };
  timezone?: string;
  source: "OpenWeather" | "Open-Meteo";
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon?: string;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  windGust?: number;
  precipitation: number;
  precipitationProbability?: number;
  pressure?: number;
  visibility?: number;
  uvIndex?: number;
  sunrise?: string;
  sunset?: string;
  updatedAt?: string;
  forecastDays: DailyForecastItem[];
  daily: {
    time: string[];
    temperatureMax: number[];
    temperatureMin: number[];
    weatherCode: number[];
    precipitationProbabilityMax: number[];
  };
}

export interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  displayName: string;
}

export interface FxRates {
  base: string;
  date: string;
  rates: Record<string, number>;
  previousRates?: Record<string, number>;
  changes?: Record<string, number>; // 24h percentage changes e.g. +0.45 or -0.12
}

export interface CurrencyHistoryPoint {
  date: string; // "YYYY-MM-DD"
  rate: number;
  formattedDate: string; // "Sep 1"
}

export interface CurrencyPerformanceData {
  base: string;
  target: string;
  range: "7D" | "1M" | "3M" | "1Y";
  startDate: string;
  endDate: string;
  currentRate: number;
  initialRate: number;
  changeAmount: number;
  changePercent: number;
  isBaseStronger: boolean;
  highRate: number;
  lowRate: number;
  points: CurrencyHistoryPoint[];
}

export interface SupportedCurrency {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
}

export interface CountryInfo {
  code: string;
  name: string;
  officialName?: string;
  capital: string;
  currency: string;
  languages: string[];
  plugTypes: string[];
  voltage: string;
  tipping: string;
  tippingPercent?: number;
  tapWater: string;
  waterSafetyStatus?: "safe" | "caution" | "unsafe";
  drivingSide: string;
  visaInfo: string;
  bestSeasons: string;
  topCustoms: string[];
  dos?: string[];
  donts?: string[];
  cashCulture?: "card_friendly" | "cash_preferred" | "mixed";
  emergencyNumber?: string;
  emergencyContacts?: EmergencyContacts;
  flag?: string;
  population?: number;
  region?: string;
  subregion?: string;
  timezones?: string[];
  googleMapsUrl?: string;
  wikipediaUrl?: string;
  officialUrl?: string;
  areaKm?: number;
  borders?: string[];
  callingCode?: string;
  governmentType?: string;
  memberships?: string[];
  descriptionShort?: string;
  descriptionLong?: string;
  landlocked?: boolean;
}

export interface EmergencyContacts {
  country: string;
  code: string;
  dialCode: string;
  police: string;
  ambulance: string;
  fire: string;
  general: string;
  notes?: string;
}

export interface LanguagePhrase {
  category: "Greetings" | "Essentials" | "Dining" | "Transit" | "Emergency" | "Numbers";
  english: string;
  translated: string;
  pronunciation: string;
}

export interface LanguageGuide {
  language: string;
  country: string;
  phrases: LanguagePhrase[];
}

export type EssentialCategory =
  | "hotel"
  | "pharmacy"
  | "supermarket"
  | "atm"
  | "transit";

export interface MapLocationSuggestion {
  displayName: string;
  shortName: string;
  secondaryText: string;
  lat: number;
  lon: number;
  type: string;
}

export interface NearbyEssentialPOI {
  id: string;
  name: string;
  category: EssentialCategory;
  categoryLabel: string;
  lat: number;
  lon: number;
  distanceMeters: number;
  walkingMinutes: number;
  address?: string;
  openingHours?: string;
  phone?: string;
}

