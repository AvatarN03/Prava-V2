import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { Trip, Expense, ChecklistItem, ItineraryItem } from "@prisma/client";

export interface DashboardSummary {
  user: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
  metrics: {
    totalTrips: number;
    activeTrips: number;
    planningTrips: number;
    completedTrips: number;
    totalSpend: number;
    pendingTasksCount: number;
    totalItineraryCount: number;
  };
  upcomingTrip: (Trip & {
    itinerary: ItineraryItem[];
    expenses: Expense[];
    checklistItems: ChecklistItem[];
  }) | null;
  recentTrips: Trip[];
  urgentTasks: (ChecklistItem & { tripTitle: string })[];
  allTrips: (Trip & {
    itinerary: ItineraryItem[];
    expenses: Expense[];
    checklistItems: ChecklistItem[];
  })[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      metrics: {
        totalTrips: 0,
        activeTrips: 0,
        planningTrips: 0,
        completedTrips: 0,
        totalSpend: 0,
        pendingTasksCount: 0,
        totalItineraryCount: 0,
      },
      upcomingTrip: null,
      recentTrips: [],
      urgentTasks: [],
      allTrips: [],
    };
  }

  // Fetch all user trips with relations
  const trips = await db.trip.findMany({
    where: { profileId: user.id },
    include: {
      itinerary: {
        orderBy: [{ dayNumber: "asc" }, { order: "asc" }],
      },
      expenses: true,
      checklistItems: {
        where: { isCompleted: false },
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalTrips = trips.length;
  const activeTrips = trips.filter((t) => t.status === "ACTIVE").length;
  const planningTrips = trips.filter((t) => t.status === "PLANNING").length;
  const completedTrips = trips.filter((t) => t.status === "COMPLETED").length;

  let totalSpend = 0;
  let pendingTasksCount = 0;
  let totalItineraryCount = 0;
  const urgentTasks: (ChecklistItem & { tripTitle: string })[] = [];

  trips.forEach((trip) => {
    totalSpend += trip.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    pendingTasksCount += trip.checklistItems.length;
    totalItineraryCount += trip.itinerary.length;

    trip.checklistItems.forEach((task) => {
      urgentTasks.push({
        ...task,
        tripTitle: trip.title,
      });
    });
  });

  // Identify next upcoming/active trip:
  // First priority: ACTIVE trip, then PLANNING trip with earliest start date, else most recent trip
  const now = new Date();
  const activeTrip = trips.find((t) => t.status === "ACTIVE");
  const upcomingPlanning = trips
    .filter((t) => t.status === "PLANNING" && t.startDate && new Date(t.startDate) >= now)
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())[0];

  const upcomingTrip = activeTrip || upcomingPlanning || trips[0] || null;

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    },
    metrics: {
      totalTrips,
      activeTrips,
      planningTrips,
      completedTrips,
      totalSpend,
      pendingTasksCount,
      totalItineraryCount,
    },
    upcomingTrip: upcomingTrip
      ? {
          ...upcomingTrip,
          itinerary: upcomingTrip.itinerary,
          expenses: upcomingTrip.expenses,
          checklistItems: upcomingTrip.checklistItems,
        }
      : null,
    recentTrips: trips.slice(0, 5),
    urgentTasks: urgentTasks.slice(0, 5),
    allTrips: trips,
  };
}
