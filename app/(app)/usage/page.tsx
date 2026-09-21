import { getAccountUsage } from "@/features/pricing/actions";
import { UsageView } from "@/features/pricing/components/usage-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Usage",
  description:
    "Track your monthly AI assistant credits, workspace trip capacity, stories, and monthly logs.",
};

export default async function UsagePage() {
  const usageRes = await getAccountUsage();

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
  };

  const usageData = usageRes.success && usageRes.data ? usageRes.data : fallbackUsage;

  return <UsageView initialUsage={usageData} />;
}
