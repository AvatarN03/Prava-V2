import { db, getDb } from "@/lib/db";

function getClient(): any {
  let client = db as any;
  if (!client?.subscription) {
    client = getDb() as any;
  }
  return client;
}

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

export interface UserTierAndQuotas {
  isPro: boolean;
  tier: "free" | "pro";
  tierName: "Free Explorer" | "Pro Wanderer";
  tripsQuota: number;
  aiCreditsQuota: number;
  subscription: UserSubscriptionDetails | null;
}

/**
 * Retrieve the latest database-backed subscription for an authenticated Prava user.
 */
export async function getUserSubscription(
  userId: string
): Promise<UserSubscriptionDetails | null> {
  if (!userId) return null;

  try {
    const client = getClient();
    if (!client?.subscription) {
      return null;
    }

    const subscription = await client.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return subscription as UserSubscriptionDetails | null;
  } catch (error) {
    console.error("Error retrieving user subscription from database:", error);
    return null;
  }
}

/**
 * Single source of truth for Pro entitlement checking across Prava.
 *
 * Rules:
 * 1. Must have a persisted Subscription record in PostgreSQL.
 * 2. Status must be "active" or "trialing".
 * 3. currentPeriodEnd (if populated) must be in the future.
 * 4. Never trusts client parameters, local storage, or browser-supplied headers.
 */
export async function hasActiveProSubscription(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const client = getClient();
    if (!client?.subscription) {
      return false;
    }

    const now = new Date();
    const activeSubscription = await client.subscription.findFirst({
      where: {
        userId,
        status: { in: ["active", "trialing"] },
        OR: [
          { currentPeriodEnd: null },
          { currentPeriodEnd: { gt: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return Boolean(activeSubscription);
  } catch (error) {
    console.error("Error checking active pro subscription:", error);
    return false;
  }
}

/**
 * Returns tier metadata and quota allowances for an authenticated user.
 */
export async function getUserTierAndQuotas(userId: string): Promise<UserTierAndQuotas> {
  const isPro = await hasActiveProSubscription(userId);
  const subscription = await getUserSubscription(userId);

  return {
    isPro,
    tier: isPro ? "pro" : "free",
    tierName: isPro ? "Pro Wanderer" : "Free Explorer",
    tripsQuota: isPro ? 25 : 10,
    aiCreditsQuota: isPro ? 150 : 30,
    subscription,
  };
}
