import type { UnsplashImage } from "./types";

export const RAW_FALLBACKS: [string, string, string, string][] = [
  ["1488646953014-85cb44e25828", "Traveler overlooking picturesque European canals", "Francesca Tirico", "francescatirico"],
  ["1507525428034-b723cf961d3e", "Tropical turquoise ocean beach getaway", "Sean Oulashin", "oulashin"],
  ["1464822759023-fed622ff2c3b", "Majestic scenic mountain peaks under sunrise glow", "Kalem Morgan", "kalemmorgandev"],
  ["1493976040374-85c8e12f0c0e", "Traditional lantern lit historic alleyway in Japan", "Sorasak", "sorasak"],
  ["1512453979798-5ea266f8880c", "Modern city skyline at sunset", "Aleksandar Pasaric", "apasaric"],
  ["1506744038136-46273834b3fb", "Scenic glacial lake and alpine forest landscape", "Bailey Zindel", "baileyzindel"],
  ["1533105079780-92b9be482077", "Whitewashed coastal Greek island village at sunset", "Constantin Popp", "constantinpopp"],
  ["1476514525535-07fb3b4ae5f1", "Boat gliding through emerald mountain lake", "Luca Bravo", "lucabravo"],
  ["1528127269322-539801943592", "Lush tropical rice terraces and palm trees", "Ales Krivec", "aleskrivec"],
  ["1508672019048-805b876b67e2", "Wanderlust backpacker looking at mountain horizon", "Sylvia Yang", "sylviayang"],
  ["1502602898657-3e91760cbb34", "Eiffel Tower in romantic Paris morning light", "Chris Karidis", "chriskaridis"],
  ["1534447677768-be436bb09401", "Atmospheric Northern lights glowing over icy mountain landscape", "Vincent Guth", "vincentguth"],
];

export const TOUR_VIBE_FALLBACKS: UnsplashImage[] = RAW_FALLBACKS.map(([photoId, alt, name, username], i) => ({
  id: `fb-${i + 1}`,
  url: `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1080&q=80`,
  thumbUrl: `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=300&q=80`,
  alt,
  photographerName: name,
  photographerUrl: `https://unsplash.com/@${username}`,
}));

export const TOUR_VIBES = [
  "scenic",
  "wanderlust",
  "landscape",
  "adventure",
  "explore",
  "vacation",
  "coastal",
  "mountain",
  "city",
];
