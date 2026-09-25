import type { SubscriptionTier, SubscriptionTierName } from "./types";

export interface TierLimitConfig {
  tier: SubscriptionTier;
  tierName: SubscriptionTierName;
  tripsQuota: number;
  aiCreditsQuota: number;
}

export const TIER_CONFIG: Record<SubscriptionTier, TierLimitConfig> = {
  free: {
    tier: "free",
    tierName: "Free Explorer",
    tripsQuota: 10,
    aiCreditsQuota: 30,
  },
  pro: {
    tier: "pro",
    tierName: "Pro Wanderer",
    tripsQuota: 25,
    aiCreditsQuota: 150,
  },
};
