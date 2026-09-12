import { ForumCategory } from "./forum-types";

export interface CategoryDefinition {
  id: ForumCategory;
  label: string;
  icon: string;
  description: string;
}

export const FORUM_CATEGORIES: CategoryDefinition[] = [
  {
    id: "ALL",
    label: "All Discussions",
    icon: "LayoutGrid",
    description: "Browse all traveler discussions across categories",
  },
  {
    id: "ROUTE_ADVICE",
    label: "Route & Pacing Advice",
    icon: "Route",
    description: "Ask experienced travelers for itinerary critiques and pacing feedback",
  },
  {
    id: "RECOMMENDATIONS",
    label: "Hidden Gems & Food",
    icon: "Sparkles",
    description: "Local culinary spots, secret viewpoints, and off-the-beaten-path suggestions",
  },
  {
    id: "PACKING_GEAR",
    label: "Gear & Packing",
    icon: "Package",
    description: "Packing strategies, essential gear recommendations, and weather preparation",
  },
  {
    id: "LIVE_REPORTS",
    label: "Live Trip Reports",
    icon: "Radio",
    description: "Real-time updates, trail conditions, transit alerts, and recent trip reports",
  },
  {
    id: "DISCUSSIONS",
    label: "General Discussion",
    icon: "MessageSquare",
    description: "Travel philosophies, culture discussions, solo travel advice, and stories",
  },
];

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  ROUTE_ADVICE:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  RECOMMENDATIONS:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  PACKING_GEAR:
    "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80",
  LIVE_REPORTS:
    "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80",
  TEMPLATES:
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
  DISCUSSIONS:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
  ALL:
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
};
