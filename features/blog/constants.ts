export const DEFAULT_STORY_COVER =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";

export const STORY_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type StoryStatus = (typeof STORY_STATUSES)[number];
