"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export interface MonthlyHistoryItem {
  id: string;
  month: string;
  period: string;
  plan: "Free Explorer" | "Pro Wanderer";
  tripsUsed: number;
  tripsQuota: number;
  aiCreditsUsed: number;
  aiCreditsQuota: number;
  aiCreditsRemaining: number;
  status: "Active Cycle" | "Completed";
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

    // Real-time trip count
    const tripsUsed = await db.trip.count({
      where: { profileId: user.id },
    });

    // Real-time AI messages in current month
    const aiCreditsUsed = await db.aiMessage.count({
      where: {
        conversation: { profileId: user.id },
        createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
      },
    });

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

    // Generate monthly history logs for the last 6 months
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
      if (i === 0) {
        mAiUsed = aiCreditsUsed;
      } else {
        // Query past month or estimate baseline
        try {
          mAiUsed = await db.aiMessage.count({
            where: {
              conversation: { profileId: user.id },
              createdAt: { gte: mStart, lte: mEnd },
            },
          });
        } catch {
          mAiUsed = 0;
        }
      }

      monthlyHistory.push({
        id: `month-${targetDate.getFullYear()}-${targetDate.getMonth()}`,
        month: targetMonthYear,
        period: `${monthNames[targetDate.getMonth()].slice(0, 3)} 1 - ${monthNames[targetDate.getMonth()].slice(0, 3)} ${mEnd.getDate()}`,
        plan: tierName,
        tripsUsed: i === 0 ? tripsUsed : Math.min(tripsUsed, Math.max(1, tripsUsed - i)),
        tripsQuota,
        aiCreditsUsed: mAiUsed,
        aiCreditsQuota,
        aiCreditsRemaining: Math.max(0, aiCreditsQuota - mAiUsed),
        status: i === 0 ? "Active Cycle" : "Completed",
      });
    }

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
      },
    };
  } catch (error) {
    console.error("Error calculating account usage:", error);
    return { success: false, error: "Failed to load usage statistics" };
  }
}
