import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "@/features/trip-workspace/common/auth-check";
import { ExpenseTracker } from "@/features/trip-workspace/expenses/components/expense-tracker";
import { fetchFxRates } from "@/features/travel-essentials/currency/currency-service";

interface ExpensesPageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export const metadata = {
  title: "Expenses | Trip Workspace",
  description: "Track your trip budget, costs, and expenditures.",
};

export default async function ExpensesPage({ params }: ExpensesPageProps) {
  const { tripId } = await params;
  const { authorized, trip, user } = await verifyTripOwnership(tripId);

  if (!authorized || !trip) {
    notFound();
  }

  // Fetch user profile to get default preferred currency
  const profile = user
    ? await db.profile.findUnique({
        where: { id: user.id },
        select: { defaultCurrency: true },
      })
    : null;

  const userCurrency = profile?.defaultCurrency || "USD";

  const [items, fxRatesData] = await Promise.all([
    db.expense.findMany({
      where: { tripId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    fetchFxRates(userCurrency),
  ]);

  return (
    <div className="space-y-4">
      <ExpenseTracker
        tripId={trip.id}
        items={items}
        userCurrency={userCurrency}
        fxRates={fxRatesData?.rates || {}}
        tripTitle={trip.title}
      />
    </div>
  );
}
