import { Suspense } from "react";
import { getAccountUsage, getUserPricingCurrency } from "@/features/pricing/actions";
import { AccountUsageView } from "@/features/pricing/components/account-usage-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Subscription & Plans",
  description:
    "Manage your workspace membership tier, compare plan privileges, and explore Pro upgrades.",
};

export default async function SubscriptionPage() {
  const [usageRes, pricingRes] = await Promise.all([
    getAccountUsage(),
    getUserPricingCurrency(),
  ]);

  const fallbackUsage = {
    tier: "free" as const,
    tierName: "Free Explorer" as const,
    tripsUsed: 0,
    tripsQuota: 10,
    tripsRemaining: 10,
    aiCreditsUsed: 0,
    aiCreditsQuota: 30,
    aiCreditsRemaining: 30,
    storiesCount: 0,
    totalExpensesLogged: 0,
    billingCycleStart: "Current Month 1",
    billingCycleEnd: "Current Month End",
    currentMonthName: "Current Billing Month",
    monthlyHistory: [],
    tripUsage: [],
    subscription: null,
  };

  const usageData = usageRes.success && usageRes.data ? usageRes.data : fallbackUsage;

  return (
    <Suspense fallback={<div className="p-8 text-xs text-muted-foreground">Loading workspace subscriptions...</div>}>
      <AccountUsageView initialUsage={usageData} initialPricing={pricingRes} />
    </Suspense>
  );
}
