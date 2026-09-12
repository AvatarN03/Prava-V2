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
  postId: string;
  authorId: string;
  authorName: string;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
  isCreatorPublic?: boolean;
  content: string;
  createdAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  isEdited?: boolean;
  isAuthor?: boolean;
}

export interface ForumPost {
  id: string;
  authorId: string;
  slug: string;
  title: string;
  content: string;
  category: ForumCategory;
  categoryLabel: string;
  tags: string[];
  destination?: string | null;
  coverImageUrl?: string | null;
  images?: string[];
  authorName: string;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
  isCreatorPublic?: boolean;
  authorBio?: string | null;
  createdAt: string;
  upvotes: number;
  views: number;
  repliesCount: number;
  hasUpvoted?: boolean;
  hasSaved?: boolean;
  isEdited?: boolean;
  isAuthor?: boolean;
  replies?: ForumReply[];
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

export interface UserTripOption {
  id: string;
  title: string;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  activityCount: number;
  coverImageUrl: string | null;
}

export interface CreateDiscussionInput {
  title: string;
  content: string;
  category: ForumCategory;
  destination?: string;
  tags?: string[];
  images?: string[];
  linkedTripId?: string | null;
  coverImageUrl?: string | null;
}

export interface UpdateDiscussionInput {
  title: string;
  content: string;
  category: ForumCategory;
  destination?: string;
  tags?: string[];
  images?: string[];
  linkedTripId?: string | null;
  coverImageUrl?: string | null;
}

export interface SaveTipToTripInput {
  tripId: string;
  tipContent: string;
  sourceTitle: string;
  authorName: string;
}
