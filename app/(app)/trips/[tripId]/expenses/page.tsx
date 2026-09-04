import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { verifyTripOwnership } from "@/features/trip-workspace/common/auth-check";
import { ExpenseTracker } from "@/features/trip-workspace/expenses/components/expense-tracker";

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
  const { authorized, trip } = await verifyTripOwnership(tripId);

  if (!authorized || !trip) {
    notFound();
  }

  const items = await db.expense.findMany({
    where: { tripId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-4">
      <ExpenseTracker tripId={trip.id} items={items} />
    </div>
  );
}
