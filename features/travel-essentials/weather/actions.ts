"use server";

import { fetchWeather, fetchWeatherByCoords } from "./weather-service";

import type { WeatherData } from "../types";

export async function getWeatherAction(query: string = "Mumbai"): Promise<WeatherData | null> {
  try {
    return await fetchWeather(query);
  } catch (error) {
    console.error("Failed to fetch weather in server action:", error);
    return null;
  }
}

export async function getWeatherByCoordsAction(
  lat: number,
  lon: number,
  cityName?: string
): Promise<WeatherData | null> {
  try {
    return await fetchWeatherByCoords(lat, lon, cityName);
  } catch (error) {
    console.error("Failed to fetch weather by coords in server action:", error);
    return null;
  }
}
