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
 * Synchronizes and deduplicates subscription records for a user.
 * If multiple subscriptions exist in PostgreSQL for the same user, it identifies
 * the single canonical subscription (prioritizing active/trialing with latest period end or updatedAt),
 * and permanently prunes any stale/superseded duplicate records.
 */
export async function syncAndDeduplicateUserSubscriptions(
  userId: string
): Promise<UserSubscriptionDetails | null> {
  if (!userId) return null;

  try {
    const client = getClient();
    if (!client?.subscription) return null;

    const subscriptions: UserSubscriptionDetails[] = await client.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!subscriptions || subscriptions.length === 0) {
      return null;
    }

    if (subscriptions.length === 1) {
      return subscriptions[0];
    }

    // Multiple records found for the user! Determine canonical subscription
    const now = new Date();
    const activeSubs = subscriptions.filter(
      (s) =>
        ["active", "trialing"].includes(s.status.toLowerCase()) &&
        (!s.currentPeriodEnd || new Date(s.currentPeriodEnd) > now)
    );

    let canonical: UserSubscriptionDetails;

    if (activeSubs.length > 0) {
      // Pick active sub with latest currentPeriodEnd, or latest updatedAt
      canonical = activeSubs.sort((a, b) => {
        const endA = a.currentPeriodEnd ? new Date(a.currentPeriodEnd).getTime() : 0;
        const endB = b.currentPeriodEnd ? new Date(b.currentPeriodEnd).getTime() : 0;
        if (endA !== endB) return endB - endA;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })[0];
    } else {
      // If no active subscriptions, pick latest updated/created subscription
      canonical = subscriptions.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
    }

    // Prune all duplicate/superseded subscriptions for this user
    const duplicateIds = subscriptions
      .filter((s) => s.id !== canonical.id)
      .map((s) => s.id);

    if (duplicateIds.length > 0) {
      try {
        await client.subscription.deleteMany({
          where: {
            id: { in: duplicateIds },
            userId,
          },
        });
        console.info(
          `[Subscription Deduplicator] Cleaned up ${duplicateIds.length} duplicate subscription(s) for user ${userId}. Retained canonical subscription: ${canonical.polarSubscriptionId} (Status: ${canonical.status})`
        );
      } catch (delError) {
        console.warn("[Subscription Deduplicator] Failed to prune duplicate subscriptions:", delError);
      }
    }

    return canonical;
  } catch (error) {
    console.error("Error in syncAndDeduplicateUserSubscriptions:", error);
    return null;
  }
}

/**
 * Retrieve the latest database-backed subscription for an authenticated Prava user.
 * Automatically runs self-healing deduplication if multiple entries exist.
 */
export async function getUserSubscription(
  userId: string
): Promise<UserSubscriptionDetails | null> {
  if (!userId) return null;

  try {
    const canonical = await syncAndDeduplicateUserSubscriptions(userId);
    return canonical;
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
    const subscription = await getUserSubscription(userId);
    if (!subscription) return false;

    const isActive = ["active", "trialing"].includes(subscription.status.toLowerCase());
    if (!isActive) return false;

    if (subscription.currentPeriodEnd) {
      return new Date(subscription.currentPeriodEnd) > new Date();
    }

    return true;
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
