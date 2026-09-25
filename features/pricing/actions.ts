"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { getPolarClient } from "@/lib/polar";
import {
  getUserTierAndQuotas,
  getUserSubscription,
  hasActiveProSubscription,
} from "@/services/subscription/subscription-service";
import {
  fetchFxRates,
  SUPPORTED_CURRENCIES,
} from "@/features/travel-essentials/currency/currency-service";

export interface MonthlyHistoryItem {
  id: string;
  month: string;
  period: string;
  plan: "Free Explorer" | "Pro Wanderer";
  tripsCreated: number;
  tripsUsed: number;
  tripsQuota: number;
  aiCreditsUsed: number;
  aiCreditsQuota: number;
  aiCreditsRemaining: number;
  status: "Active Cycle" | "Completed";
}

export interface TripAiUsageItem {
  id: string;
  title: string;
  destination: string | null;
  createdAt: string;
  coverImageUrl?: string | null;
  creditsUsed: number;
  percentageOfQuota: number;
}

export interface AccountUsageData {
  tier: "free" | "pro";
  tierName: "Free Explorer" | "Pro Wanderer";
  tripsUsed: number;
  tripsQuota: number;
  tripsRemaining: number;
  aiCreditsUsed: number;
  aiCreditsQuota: number;
  aiCreditsRemaining: number;
  storiesCount: number;
  totalExpensesLogged: number;
  billingCycleStart: string;
  billingCycleEnd: string;
  nextRenewalDate?: string;
  daysUntilRenewal?: number;
  currentMonthName: string;
  monthlyHistory: MonthlyHistoryItem[];
  tripUsage: TripAiUsageItem[];
  subscription?: {
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export async function getAccountUsage(): Promise<{
  success: boolean;
  data?: AccountUsageData;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const now = new Date();

    // Determine tier and quotas strictly through the database entitlement authority
    const { isPro, tier, tierName, tripsQuota, aiCreditsQuota, subscription } =
      await getUserTierAndQuotas(user.id);

    // Query all subscriptions for user to evaluate historical Pro intervals
    const userSubscriptions = await db.subscription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const userMetadata = user.user_metadata || {};
    const metaProSince = userMetadata.pro_since ? new Date(userMetadata.pro_since) : null;
    const isMetaPro = userMetadata.tier === "pro" || userMetadata.is_pro === true;

    // Determine cycle anchor day
    // If subscription has a currentPeriodStart or createdAt, use that day of the month (e.g. 15th).
    // Otherwise, default to 1 (1st of the month).
    let anchorDay = 1;
    if (subscription?.currentPeriodStart) {
      anchorDay = new Date(subscription.currentPeriodStart).getDate();
    } else if (subscription?.createdAt) {
      anchorDay = new Date(subscription.createdAt).getDate();
    } else if (userSubscriptions.length > 0 && userSubscriptions[0].currentPeriodStart) {
      anchorDay = new Date(userSubscriptions[0].currentPeriodStart).getDate();
    } else if (userSubscriptions.length > 0 && userSubscriptions[0].createdAt) {
      anchorDay = new Date(userSubscriptions[0].createdAt).getDate();
    } else if (metaProSince) {
      anchorDay = metaProSince.getDate();
    }

    // Helper to calculate cycle start, end, and renewal dates
    let baseYear = now.getFullYear();
    let baseMonth = now.getMonth();
    if (anchorDay > 1 && now.getDate() < anchorDay) {
      baseMonth -= 1;
    }

    const getCycleWindow = (i: number) => {
      const cycleStartYear = baseYear;
      const cycleStartMonth = baseMonth - i;

      if (anchorDay === 1) {
        const start = new Date(cycleStartYear, cycleStartMonth, 1, 0, 0, 0, 0);
        const end = new Date(cycleStartYear, cycleStartMonth + 1, 0, 23, 59, 59, 999);
        const nextRenewal = new Date(cycleStartYear, cycleStartMonth + 1, 1);
        return { start, end, nextRenewal };
      } else {
        const daysInStartMonth = new Date(cycleStartYear, cycleStartMonth + 1, 0).getDate();
        const clampedStartDay = Math.min(anchorDay, daysInStartMonth);
        const start = new Date(cycleStartYear, cycleStartMonth, clampedStartDay, 0, 0, 0, 0);

        const daysInEndMonth = new Date(cycleStartYear, cycleStartMonth + 2, 0).getDate();
        const clampedEndDay = Math.min(anchorDay - 1, daysInEndMonth);
        const end = new Date(cycleStartYear, cycleStartMonth + 1, clampedEndDay, 23, 59, 59, 999);

        const clampedRenewalDay = Math.min(anchorDay, daysInEndMonth);
        const nextRenewal = new Date(cycleStartYear, cycleStartMonth + 1, clampedRenewalDay);
        return { start, end, nextRenewal };
      }
    };

    const activeCycle = getCycleWindow(0);

    // Function to check if user held Pro entitlement during a cycle window
    const wasProDuringCycle = (cStart: Date, cEnd: Date): boolean => {
      // 1. Check database subscriptions
      for (const sub of userSubscriptions) {
        const subStatus = sub.status.toLowerCase();
        const subStart = sub.currentPeriodStart
          ? new Date(sub.currentPeriodStart)
          : new Date(sub.createdAt);

        let subEnd: Date;
        if (["active", "trialing"].includes(subStatus)) {
          subEnd = sub.currentPeriodEnd
            ? new Date(sub.currentPeriodEnd)
            : new Date(8640000000000000);
        } else {
          subEnd = sub.currentPeriodEnd
            ? new Date(sub.currentPeriodEnd)
            : new Date(sub.updatedAt);
        }

        if (cStart <= subEnd && cEnd >= subStart) {
          return true;
        }
      }

      // 2. Check metadata fallback (simulation / metadata tier)
      if (isMetaPro && metaProSince) {
        if (cEnd >= metaProSince) {
          return true;
        }
      } else if (isMetaPro && isPro) {
        if (cEnd >= activeCycle.start) {
          return true;
        }
      }

      return false;
    };

    // Real-time trip count (active workspaces)
    const tripsUsed = await db.trip.count({
      where: { profileId: user.id },
    });

    // Real-time AI user messages in active billing cycle
    const rawAiCredits = await db.aiMessage.count({
      where: {
        role: "user",
        conversation: { profileId: user.id },
        createdAt: { gte: activeCycle.start, lte: activeCycle.end },
      },
    });

    const aiCreditsUsed = Math.min(aiCreditsQuota, rawAiCredits);

    // Real-time published stories count
    const storiesCount = await db.blogPost.count({
      where: { profileId: user.id },
    });

    // Real-time expenses count
    const totalExpensesLogged = await db.expense.count({
      where: { trip: { profileId: user.id } },
    });

    const tripsRemaining = Math.max(0, tripsQuota - tripsUsed);
    const aiCreditsRemaining = Math.max(0, aiCreditsQuota - aiCreditsUsed);

    // Generate monthly history logs for the last 6 cycles with REAL database counts and accurate tiers
    const monthlyHistory: MonthlyHistoryItem[] = [];

    for (let i = 0; i < 6; i++) {
      const cycle = getCycleWindow(i);
      const isCyclePro = i === 0 ? isPro : wasProDuringCycle(cycle.start, cycle.end);
      const cycleTierName: "Free Explorer" | "Pro Wanderer" = isCyclePro
        ? "Pro Wanderer"
        : "Free Explorer";
      const cycleQuota = isCyclePro ? 150 : 30;

      let mAiUsed = 0;
      let mTripsCreated = 0;

      if (i === 0) {
        mAiUsed = aiCreditsUsed;
        mTripsCreated = await db.trip.count({
          where: {
            profileId: user.id,
            createdAt: { gte: cycle.start, lte: cycle.end },
          },
        });
      } else {
        try {
          const rawPastAi = await db.aiMessage.count({
            where: {
              role: "user",
              conversation: { profileId: user.id },
              createdAt: { gte: cycle.start, lte: cycle.end },
            },
          });
          mAiUsed = Math.min(cycleQuota, rawPastAi);

          mTripsCreated = await db.trip.count({
            where: {
              profileId: user.id,
              createdAt: { gte: cycle.start, lte: cycle.end },
            },
          });
        } catch {
          mAiUsed = 0;
          mTripsCreated = 0;
        }
      }

      const monthLabel =
        anchorDay === 1
          ? cycle.start.toLocaleDateString("en-US", { month: "long", year: "numeric" })
          : `${cycle.start.toLocaleDateString("en-US", {
              month: "short",
            })} – ${cycle.end.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}`;

      const periodLabel = `${cycle.start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${cycle.end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          cycle.start.getFullYear() !== cycle.end.getFullYear()
            ? "numeric"
            : undefined,
      })}`;

      monthlyHistory.push({
        id: `cycle-${cycle.start.getFullYear()}-${cycle.start.getMonth()}-${cycle.start.getDate()}`,
        month: monthLabel,
        period: periodLabel,
        plan: cycleTierName,
        tripsCreated: mTripsCreated,
        tripsUsed: mTripsCreated,
        tripsQuota: isCyclePro ? 25 : 10,
        aiCreditsUsed: mAiUsed,
        aiCreditsQuota: cycleQuota,
        aiCreditsRemaining: Math.max(0, cycleQuota - mAiUsed),
        status: i === 0 ? "Active Cycle" : "Completed",
      });
    }

    // Query user's trips and aggregate AI credit usage per trip
    const userTrips = await db.trip.findMany({
      where: { profileId: user.id },
      select: {
        id: true,
        title: true,
        destination: true,
        createdAt: true,
        coverImageUrl: true,
        aiConversations: {
          select: {
            messages: {
              where: { role: "user" },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const tripUsage: TripAiUsageItem[] = userTrips.map((t) => {
      const credits = t.aiConversations.reduce(
        (sum, c) => sum + (c.messages?.length || 0),
        0
      );
      return {
        id: t.id,
        title: t.title,
        destination: t.destination,
        createdAt: t.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        coverImageUrl: t.coverImageUrl,
        creditsUsed: credits,
        percentageOfQuota: Math.min(
          100,
          Math.round((credits / aiCreditsQuota) * 100)
        ),
      };
    });

    const billingCycleStart = activeCycle.start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const billingCycleEnd = activeCycle.end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const nextRenewalDate = activeCycle.nextRenewal.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const daysUntilRenewal = Math.max(
      1,
      Math.ceil((activeCycle.nextRenewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
    const currentMonthName = activeCycle.start.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return {
      success: true,
      data: {
        tier,
        tierName,
        tripsUsed,
        tripsQuota,
        tripsRemaining,
        aiCreditsUsed,
        aiCreditsQuota,
        aiCreditsRemaining,
        storiesCount,
        totalExpensesLogged,
        billingCycleStart,
        billingCycleEnd,
        nextRenewalDate,
        daysUntilRenewal,
        currentMonthName,
        monthlyHistory,
        tripUsage,
        subscription: subscription
          ? {
              status: subscription.status,
              currentPeriodEnd: subscription.currentPeriodEnd
                ? subscription.currentPeriodEnd.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : null,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            }
          : null,
      },
    };
  } catch (error) {
    console.error("Error fetching account usage:", error);
    return { success: false, error: "Failed to load usage data" };
  }
}

export interface ConvertedPricingDTO {
  currencyCode: string;
  currencySymbol: string;
  rateFromInr: number;
  monthlyInr: number;
  annualInr: number;
  monthlyConverted: number;
  annualConverted: number;
  annualMonthlyEquivalent: number;
  savingsAmount: string;
  formattedMonthly: string;
  formattedAnnual: string;
  formattedAnnualMonthly: string;
}

export async function getUserPricingCurrency(requestedCurrency?: string): Promise<ConvertedPricingDTO> {
  const defaultPricing: ConvertedPricingDTO = {
    currencyCode: "INR",
    currencySymbol: "₹",
    rateFromInr: 1.0,
    monthlyInr: 200,
    annualInr: 2000,
    monthlyConverted: 200,
    annualConverted: 2000,
    annualMonthlyEquivalent: 167,
    savingsAmount: "₹400",
    formattedMonthly: "₹200",
    formattedAnnual: "₹2,000",
    formattedAnnualMonthly: "₹167",
  };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Default to INR as the primary base currency for the application
    let userCurrency = requestedCurrency ? requestedCurrency.toUpperCase() : "INR";
    if (!requestedCurrency && user) {
      const profile = await db.profile.findUnique({
        where: { id: user.id },
        select: { defaultCurrency: true },
      });
      if (profile?.defaultCurrency) {
        userCurrency = profile.defaultCurrency.toUpperCase();
      }
    }

    if (userCurrency === "INR") {
      return defaultPricing;
    }

    const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === userCurrency) || {
      code: userCurrency,
      symbol: userCurrency,
    };

    // Calculate conversion from INR base (₹200 monthly, ₹2,000 yearly)
    const usdRates = await fetchFxRates("USD");
    const inrPerUsd = usdRates?.rates["INR"] || 83.5;
    const targetPerUsd = usdRates?.rates[userCurrency] || (userCurrency === "USD" ? 1.0 : 1.0);
    const rateFromInr = targetPerUsd / inrPerUsd;

    const monthlyConverted = Math.round(200 * rateFromInr * 10) / 10;
    const annualConverted = Math.round(2000 * rateFromInr);
    const annualMonthlyEquivalent = Math.round((annualConverted / 12) * 10) / 10;
    const savingsVal = Math.round((200 * 12 - 2000) * rateFromInr);

    const formatPrice = (val: number) => {
      if (val < 10) {
        return `${currencyInfo.symbol}${val.toFixed(2)}`;
      }
      return `${currencyInfo.symbol}${Math.round(val).toLocaleString()}`;
    };

    return {
      currencyCode: userCurrency,
      currencySymbol: currencyInfo.symbol,
      rateFromInr,
      monthlyInr: 200,
      annualInr: 2000,
      monthlyConverted,
      annualConverted,
      annualMonthlyEquivalent,
      savingsAmount: `${currencyInfo.symbol}${savingsVal.toLocaleString()}`,
      formattedMonthly: formatPrice(monthlyConverted),
      formattedAnnual: formatPrice(annualConverted),
      formattedAnnualMonthly: formatPrice(annualMonthlyEquivalent),
    };
  } catch (err) {
    console.error("Error determining user pricing currency:", err);
    return defaultPricing;
  }
}

export interface PolarCheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  isSimulation?: boolean;
  message?: string;
  error?: string;
}

/**
 * Creates a Polar Checkout session URL for the Prava Pro product using the official Polar SDK.
 */
export async function createPolarCheckoutSession(params?: {
  billingCycle?: "monthly" | "annual";
  redirectUrl?: string;
}): Promise<PolarCheckoutResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please log in to upgrade to Pro Wanderer." };
    }

    // 1. Guard against duplicate active subscriptions
    const alreadyPro = await hasActiveProSubscription(user.id);
    if (alreadyPro) {
      return {
        success: false,
        error:
          "You already have an active Pro Wanderer subscription. Please use 'Manage Subscription' to update your plan or billing.",
      };
    }

    const billingCycle = params?.billingCycle || "annual";
    const productId = process.env.POLAR_PRODUCT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${appUrl}/subscription?checkout=success&checkout_id={CHECKOUT_ID}`;

    // 2. Primary Flow: Official Polar SDK Checkout Session
    if (process.env.POLAR_ACCESS_TOKEN && productId) {
      try {
        const polar = getPolarClient();
        const checkout = await polar.checkouts.create({
          products: [productId],
          customerEmail: user.email || undefined,
          externalCustomerId: user.id,
          metadata: {
            userId: user.id,
            billingCycle,
          },
          successUrl,
        });

        if (checkout && checkout.url) {
          return {
            success: true,
            checkoutUrl: checkout.url,
          };
        }
      } catch (polarErr: unknown) {
        console.error("Polar SDK checkout initiation error:", polarErr);
        // If SDK call fails, surface helpful message
        const errMessage =
          polarErr instanceof Error ? polarErr.message : "Failed to initiate Polar checkout";
        return { success: false, error: errMessage };
      }
    }

    // 3. Fallback: Direct configured checkout link if provided in env
    const annualCheckoutUrl =
      process.env.POLAR_CHECKOUT_ANNUAL_URL ||
      process.env.NEXT_PUBLIC_POLAR_CHECKOUT_ANNUAL_URL;
    const monthlyCheckoutUrl =
      process.env.POLAR_CHECKOUT_MONTHLY_URL ||
      process.env.NEXT_PUBLIC_POLAR_CHECKOUT_MONTHLY_URL;

    const baseCheckoutUrl = billingCycle === "annual" ? annualCheckoutUrl : monthlyCheckoutUrl;

    if (baseCheckoutUrl && baseCheckoutUrl.startsWith("http")) {
      const url = new URL(baseCheckoutUrl);
      if (user.email) {
        url.searchParams.set("customer_email", user.email);
      }
      url.searchParams.set("client_reference_id", user.id);
      url.searchParams.set("metadata[userId]", user.id);
      url.searchParams.set("metadata[billingCycle]", billingCycle);
      if (params?.redirectUrl) {
        url.searchParams.set("success_url", params.redirectUrl);
      }
      return {
        success: true,
        checkoutUrl: url.toString(),
      };
    }

    // 4. Dev simulation fallback when no Polar keys are configured
    const planCostDesc =
      billingCycle === "annual"
        ? "₹2,000 / year (₹167/mo • Save ₹400 discount)"
        : "₹200 / month";

    return {
      success: true,
      isSimulation: true,
      message: `Polar Checkout sandbox ready for Pro Wanderer (${planCostDesc}). Configure POLAR_ACCESS_TOKEN and POLAR_PRODUCT_ID in .env to initiate live sandbox checkout sessions.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return { success: false, error: message };
  }
}

/**
 * Creates an authenticated Polar Customer Portal session for managing/canceling active subscriptions.
 * Includes graceful fallback to Polar's hosted Customer Portal if POLAR_ACCESS_TOKEN lacks customer_sessions:write scope.
 */
export async function createPolarCustomerPortalSession(): Promise<{
  success: boolean;
  portalUrl?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please log in to access your billing portal." };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${appUrl}/subscription`;
    const isSandbox = (process.env.POLAR_SERVER || "sandbox") === "sandbox";
    const fallbackHostedPortalUrl = isSandbox
      ? "https://sandbox.polar.sh/portal"
      : "https://polar.sh/portal";

    const sub = await getUserSubscription(user.id);

    // If no access token is configured, direct to hosted portal
    if (!process.env.POLAR_ACCESS_TOKEN) {
      return {
        success: true,
        portalUrl: fallbackHostedPortalUrl,
      };
    }

    let session: any = null;
    let scopeErrorOccurred = false;

    try {
      const polar = getPolarClient();

      // Strategy 1: Try creating customer session with customerId
      if (sub?.polarCustomerId) {
        try {
          session = await polar.customerSessions.create({
            customerId: sub.polarCustomerId,
            returnUrl,
          });
        } catch (firstErr: any) {
          const errMsg = firstErr?.message || JSON.stringify(firstErr);
          console.warn("[Polar Customer Portal] Session creation via customerId failed:", errMsg);
          if (errMsg.includes("insufficient_scope") || firstErr?.status === 403) {
            scopeErrorOccurred = true;
          }
        }
      }

      // Strategy 2: If Strategy 1 did not produce a session and not a scope restriction, try externalCustomerId
      if (!session?.customerPortalUrl && !scopeErrorOccurred) {
        try {
          session = await polar.customerSessions.create({
            externalCustomerId: user.id,
            returnUrl,
          });
        } catch (secondErr: any) {
          const errMsg = secondErr?.message || JSON.stringify(secondErr);
          console.warn("[Polar Customer Portal] Session creation via externalCustomerId failed:", errMsg);
          if (errMsg.includes("insufficient_scope") || secondErr?.status === 403) {
            scopeErrorOccurred = true;
          }
        }
      }
    } catch (polarInitErr) {
      console.warn("[Polar Customer Portal] Polar client initialization warning:", polarInitErr);
    }

    // 1-Click Authenticated Session
    if (session?.customerPortalUrl) {
      return {
        success: true,
        portalUrl: session.customerPortalUrl,
      };
    }

    // Try resolving organization slug for hosted portal fallback
    let orgSlug =
      process.env.POLAR_ORGANIZATION_SLUG ||
      process.env.NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG;

    if (!orgSlug) {
      try {
        const polar = getPolarClient();
        const orgs = await polar.organizations.listOrganizations({});
        for await (const page of orgs) {
          const item = page.result?.items?.[0];
          if (item && "slug" in item && typeof item.slug === "string") {
            orgSlug = item.slug;
            break;
          }
        }
      } catch (orgErr) {
        console.warn("[Polar Customer Portal] Could not resolve organization slug:", orgErr);
      }
    }

    if (orgSlug) {
      const orgPortalUrl = `https://${isSandbox ? "sandbox.polar.sh" : "polar.sh"}/${orgSlug}/portal`;
      return {
        success: true,
        portalUrl: orgPortalUrl,
      };
    }

    // If session failed due to insufficient_scope and no org slug is known, inform user cleanly
    if (scopeErrorOccurred) {
      return {
        success: false,
        error:
          "Polar Access Token requires 'customer_sessions:write' permission in Polar Dashboard -> Settings -> Access Tokens to open the customer billing portal.",
      };
    }

    return {
      success: false,
      error:
        "Unable to generate customer portal session. Please ensure your Polar subscription is active and POLAR_ACCESS_TOKEN has customer_sessions:write scope.",
    };
  } catch (err: unknown) {
    console.error("Error creating customer portal session:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to open billing portal. Please check your Polar access token scopes.",
    };
  }
}


/**
 * Development simulation action to activate Pro Wanderer tier
 */
export async function simulatePolarUpgrade(params: {
  billingCycle: "monthly" | "annual";
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        tier: "pro",
        is_pro: true,
        billing_cycle: params.billingCycle,
        pro_since: new Date().toISOString(),
      },
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to activate Pro tier";
    return { success: false, error: message };
  }
}

/**
 * Development simulation action to revert to Free Explorer tier
 */
export async function simulatePolarDowngrade(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        tier: "free",
        is_pro: false,
      },
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to downgrade tier";
    return { success: false, error: message };
  }
}
