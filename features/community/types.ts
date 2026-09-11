export interface CommunityTripItem {
  id: string;
  title: string;
  description: string | null;
  destination: string | null;
  durationDays: number;
  region: "Asia" | "Europe" | "Americas" | "Middle East" | "Oceania" | "Africa";
  category: "Cultural" | "Adventure" | "Relaxation" | "Food & Wine" | "Budget" | "Scenic";
  authorName: string;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
  authorBio?: string | null;
  isCreatorPublic?: boolean;
  coverImageUrl?: string | null;
  isTemplate: boolean;
  activityCount: number;
  accommodationCount: number;
  checklistCount: number;
  estimatedBudget?: string;
  highlights: string[];
  itineraryPreview: {
    day: number;
    title: string;
    description?: string;
    category?: string;
  }[];
  packingHighlights?: string[];
  tips?: string[];
}

export interface CommunityCreatorItem {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  publishedTripsCount: number;
  publishedStoriesCount: number;
  topDestinations: string[];
}

export type CommunityRegionFilter = "ALL" | "Asia" | "Europe" | "Americas" | "Middle East" | "Oceania";
export type CommunityCategoryFilter = "ALL" | "Cultural" | "Adventure" | "Relaxation" | "Food & Wine" | "Scenic";
export type CommunityTabFilter = "all" | "itineraries" | "stories" | "creators";

