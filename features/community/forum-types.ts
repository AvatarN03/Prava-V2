export type ForumCategory =
  | "ALL"
  | "DISCUSSIONS"
  | "ROUTE_ADVICE"
  | "RECOMMENDATIONS"
  | "PACKING_GEAR"
  | "LIVE_REPORTS"
  | "TEMPLATES";

export interface ForumReply {
  id: string;
  authorName: string;
  authorUsername?: string;
  authorAvatarUrl?: string | null;
  isCreatorPublic?: boolean;
  content: string;
  createdAt: string;
  upvotes: number;
  isHelpful?: boolean;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: ForumCategory;
  categoryLabel: string;
  tags: string[];
  destination?: string;
  coverImageUrl?: string | null;
  authorName: string;
  authorUsername?: string;
  authorAvatarUrl?: string | null;
  isCreatorPublic?: boolean;
  authorBio?: string;
  createdAt: string;
  upvotes: number;
  views: number;
  repliesCount: number;
  replies: ForumReply[];
  isPinned?: boolean;
  linkedTrip?: {
    id: string;
    title: string;
    destination: string;
    durationDays: number;
    activityCount: number;
    accommodationCount: number;
    estimatedBudget?: string;
    category?: string;
    coverImageUrl?: string | null;
  } | null;
}
