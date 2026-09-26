import type { StoryStatus } from "./constants";

export type { StoryStatus };

export interface StoryLinkedTrip {
  id: string;
  title: string;
  destination: string | null;
  coverImageUrl?: string | null;
  isPublic?: boolean;
}

export interface StoryAuthorProfile {
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
}

export interface StoryItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content?: string;
  coverImageUrl: string | null;
  tags: string[];
  status?: StoryStatus;
  publishedAt: Date | string | null;
  updatedAt?: Date | string;
  profile?: StoryAuthorProfile | null;
  linkedTrip?: StoryLinkedTrip | null;
}

export type StoryCardItem = StoryItem;
