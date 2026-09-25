export interface UserSubscriptionDetails {
  id: string;
  userId: string;
  polarSubscriptionId: string;
  polarCustomerId: string;
  polarProductId: string;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionTier = "free" | "pro";
export type SubscriptionTierName = "Free Explorer" | "Pro Wanderer";

export interface UserTierAndQuotas {
  isPro: boolean;
  tier: SubscriptionTier;
  tierName: SubscriptionTierName;
  tripsQuota: number;
  aiCreditsQuota: number;
  subscription: UserSubscriptionDetails | null;
}
