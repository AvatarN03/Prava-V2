"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
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
  destination: string;
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

    // Determine tier (check metadata or default to free)
    const isPro = user.user_metadata?.tier === "pro" || user.user_metadata?.is_pro === true;
    const tier = isPro ? "pro" : "free";
    const tierName = isPro ? "Pro Wanderer" : "Free Explorer";

    // Quotas: Free = 10 trips, Pro = 25 trips; AI credits: Free = 30, Pro = 150
    const tripsQuota = isPro ? 25 : 10;
    const aiCreditsQuota = isPro ? 150 : 30;

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
  rateFromUsd: number;
  monthlyUsd: number;
  annualUsd: number;
  monthlyConverted: number;
  annualConverted: number;
  annualMonthlyEquivalent: number;
  formattedMonthly: string;
  formattedAnnual: string;
  formattedAnnualMonthly: string;
}

export async function getUserPricingCurrency(): Promise<ConvertedPricingDTO> {
  const defaultPricing: ConvertedPricingDTO = {
    currencyCode: "INR",
    currencySymbol: "₹",
    rateFromUsd: 83.5,
    monthlyUsd: 12,
    annualUsd: 99,
    monthlyConverted: 1000,
    annualConverted: 8250,
    annualMonthlyEquivalent: 688,
    formattedMonthly: "₹1,000",
    formattedAnnual: "₹8,250",
    formattedAnnualMonthly: "₹688",
  };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userCurrency = "INR";
    if (user) {
      const profile = await db.profile.findUnique({
        where: { id: user.id },
        select: { defaultCurrency: true },
      });
      if (profile?.defaultCurrency) {
        userCurrency = profile.defaultCurrency.toUpperCase();
      }
    }

    const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === userCurrency) || {
      code: userCurrency,
      symbol: userCurrency === "INR" ? "₹" : userCurrency === "USD" ? "$" : userCurrency,
    };

    if (userCurrency === "USD") {
      return {
        currencyCode: "USD",
        currencySymbol: "$",
        rateFromUsd: 1.0,
        monthlyUsd: 12,
        annualUsd: 99,
        monthlyConverted: 12,
        annualConverted: 99,
        annualMonthlyEquivalent: 8.25,
        formattedMonthly: "$12",
        formattedAnnual: "$99",
        formattedAnnualMonthly: "$8.25",
      };
    }

    const ratesData = await fetchFxRates("USD");
    const rate = ratesData?.rates[userCurrency] || (userCurrency === "INR" ? 83.5 : 1.0);

    const monthlyConverted =
      userCurrency === "INR"
        ? Math.round((12 * rate) / 10) * 10
        : Math.round(12 * rate);
    const annualConverted =
      userCurrency === "INR"
        ? Math.round((99 * rate) / 50) * 50
        : Math.round(99 * rate);
    const annualMonthlyEquivalent = Math.round(annualConverted / 12);

    return {
      currencyCode: userCurrency,
      currencySymbol: currencyInfo.symbol,
      rateFromUsd: rate,
      monthlyUsd: 12,
      annualUsd: 99,
      monthlyConverted,
      annualConverted,
      annualMonthlyEquivalent,
      formattedMonthly: `${currencyInfo.symbol}${monthlyConverted.toLocaleString()}`,
      formattedAnnual: `${currencyInfo.symbol}${annualConverted.toLocaleString()}`,
      formattedAnnualMonthly: `${currencyInfo.symbol}${annualMonthlyEquivalent.toLocaleString()}`,
    };
  } catch (err) {
    console.error("Error determining user pricing currency:", err);
    return defaultPricing;
  }
}
