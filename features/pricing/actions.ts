"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { getPolarClient } from "@/lib/polar/polar-client";
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
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Determine tier and quotas strictly through the database entitlement authority
    const { isPro, tier, tierName, tripsQuota, aiCreditsQuota, subscription } =
      await getUserTierAndQuotas(user.id);

    // Real-time trip count (active workspaces)
    const tripsUsed = await db.trip.count({
      where: { profileId: user.id },
    });

    // Real-time AI user messages in current month
    const rawAiCredits = await db.aiMessage.count({
      where: {
        role: "user",
        conversation: { profileId: user.id },
        createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
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

    // Generate monthly history logs for the last 6 months with REAL database counts
    const monthlyHistory: MonthlyHistoryItem[] = [];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const targetMonthYear = `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
      const mStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const mEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

      let mAiUsed = 0;
      let mTripsCreated = 0;

      if (i === 0) {
        mAiUsed = aiCreditsUsed;
        mTripsCreated = await db.trip.count({
          where: {
            profileId: user.id,
            createdAt: { gte: mStart, lte: mEnd },
          },
        });
      } else {
        try {
          const rawPastAi = await db.aiMessage.count({
            where: {
              role: "user",
              conversation: { profileId: user.id },
              createdAt: { gte: mStart, lte: mEnd },
            },
          });
          mAiUsed = Math.min(aiCreditsQuota, rawPastAi);

          mTripsCreated = await db.trip.count({
            where: {
              profileId: user.id,
              createdAt: { gte: mStart, lte: mEnd },
            },
          });
        } catch {
          mAiUsed = 0;
          mTripsCreated = 0;
        }
      }

      monthlyHistory.push({
        id: `month-${targetDate.getFullYear()}-${targetDate.getMonth()}`,
        month: targetMonthYear,
        period: `${monthNames[targetDate.getMonth()].slice(0, 3)} 1 - ${monthNames[targetDate.getMonth()].slice(0, 3)} ${mEnd.getDate()}`,
        plan: tierName,
        tripsCreated: mTripsCreated,
        tripsUsed: mTripsCreated,
        tripsQuota,
        aiCreditsUsed: mAiUsed,
        aiCreditsQuota,
        aiCreditsRemaining: Math.max(0, aiCreditsQuota - mAiUsed),
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

    const currentMonthName = `${monthNames[currentMonth]} ${currentYear}`;
    const billingCycleStart = `${monthNames[currentMonth]} 1, ${currentYear}`;
    const billingCycleEnd = `${monthNames[currentMonth]} ${endOfCurrentMonth.getDate()}, ${currentYear}`;

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

    const sub = await getUserSubscription(user.id);
    if (!sub || !sub.polarCustomerId) {
      return {
        success: false,
        error:
          "No active Polar subscription record found to manage. If you recently checked out, please allow a moment for the webhook to confirm.",
      };
    }

    if (!process.env.POLAR_ACCESS_TOKEN) {
      return {
        success: false,
        error: "POLAR_ACCESS_TOKEN is not configured on the server.",
      };
    }

    const polar = getPolarClient();
    const session = await polar.customerSessions.create({
      customerId: sub.polarCustomerId,
    });

    if (!session || !session.customerPortalUrl) {
      return { success: false, error: "Could not generate customer portal session from Polar." };
    }

    return {
      success: true,
      portalUrl: session.customerPortalUrl,
    };
  } catch (err: unknown) {
    console.error("Error creating customer portal session:", err);
    const message = err instanceof Error ? err.message : "Failed to open billing portal";
    return { success: false, error: message };
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
