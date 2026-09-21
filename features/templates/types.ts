export interface TemplateItineraryItem {
  day: number;
  title: string;
  category?: string | null;
  description?: string | null;
  location?: string | null;
  cost?: number | null;
}

export interface TemplateAccommodationItem {
  name: string;
  type?: string | null;
  address?: string | null;
  cost?: number | null;
  currency: string;
}

export interface TemplateAuthor {
  id: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isPublic: boolean;
}

export interface TemplateMetrics {
  activityCount: number;
  accommodationCount: number;
  checklistCount: number;
  notesCount: number;
  expenseTotal: number;
  currency: string;
}

export interface TemplateInclusions {
  hasStays: boolean;
  hasExpenses: boolean;
  hasChecklist: boolean;
  hasNotes: boolean;
  hasStory: boolean;
}

export interface TemplateTripItem {
  id: string;
  title: string;
  destination: string | null;
  description: string | null;
  coverImageUrl: string | null;
  durationDays: number;
  isTemplate: boolean;
  isPublic: boolean;
  isCloned?: boolean;
  isOwn?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  author: TemplateAuthor;
  metrics: TemplateMetrics;
  inclusions: TemplateInclusions;
  itinerary: TemplateItineraryItem[];
  accommodations: TemplateAccommodationItem[];
  checklistHighlights: string[];
  tips: string[];
  linkedStory: {
    slug: string;
    title: string;
  } | null;
}

export type DurationFilter =
  | "ALL"
  | "WEEKEND" // 1-3 days
  | "SHORT" // 4-7 days
  | "EXTENDED" // 8-14 days
  | "LONG"; // 15+ days

export type InclusionFilter =
  | "ALL"
  | "HAS_STAYS"
  | "HAS_EXPENSES"
  | "HAS_CHECKLIST"
  | "HAS_STORY";

export type SortOption = "NEWEST" | "MOST_ACTIONABLE" | "DURATION";
