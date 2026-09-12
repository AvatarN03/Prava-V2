import { Trip as PrismaTrip, TripStatus as PrismaTripStatus } from "@prisma/client";

export type TripStatus = PrismaTripStatus;

export interface TripCounts {
  itinerary: number;
  accommodations: number;
  checklistItems: number;
  notes: number;
  expenses: number;
  linkedBlogPosts?: number;
  links?: number;
}

export type TripWithCounts = PrismaTrip & {
  _count?: TripCounts;
  totalSpend?: number;
  completedTasksCount?: number;
};

export type Trip = TripWithCounts;

export type TripViewMode = "grid" | "table";
export type TripSortOption = "departure" | "recent_updated" | "newest" | "alphabetical";

export interface TripUsageQuota {
  count: number;
  maxTrips: number;
  isPro: boolean;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

