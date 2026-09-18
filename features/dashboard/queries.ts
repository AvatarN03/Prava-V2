import {
  Accommodation,
  ChecklistItem,
  Expense,
  ItineraryItem,
  Link,
  Note,
  Trip,
} from "@prisma/client";

import { syncUserProfile } from "@/lib/auth/sync-profile";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export type TripSummaryItem = Trip;

export interface CategoryExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface UpcomingTripDetails extends Trip {
  itinerary: ItineraryItem[];
  expenses: Expense[];
  checklistItems: ChecklistItem[];
  accommodations: Accommodation[];
  notes: Note[];
  links: Link[];
  countdownDays: number | null;
  durationDays: number | null;
  readiness: {
    totalItems: number;
    completedItems: number;
    percentage: number;
    staysCount: number;
    transitCount: number;
    tasksRemaining: number;
  };
  financials: {
    currency: string;
    totalSpent: number;
    allocatedBudget: number;
    remainingBudget: number;
    percentUtilized: number;
    categoryBreakdown: CategoryExpenseBreakdown[];
  };
  nextCheckpoint: {
    title: string;
    dueDate: Date | null;
    daysRemaining: number | null;
  } | null;
  featuredStop: {
    title: string;
    subtitle: string;
  } | null;
}

export interface DashboardSummary {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    defaultCurrency: string;
  } | null;
  metrics: {
    totalTrips: number;
    activeTrips: number;
    planningTrips: number;
    completedTrips: number;
    totalSpend: number;
    tripSpend: number;
    generalSpend: number;
    pendingTasksCount: number;
    totalItineraryCount: number;
  };
  upcomingTrip: UpcomingTripDetails | null;
  recentTrips: Trip[];
  urgentTasks: (ChecklistItem & { tripTitle: string })[];
  allTrips: Trip[];
  generalExpenses: Expense[];
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
        tripSpend: 0,
        generalSpend: 0,
        pendingTasksCount: 0,
        totalItineraryCount: 0,
      },
      upcomingTrip: null,
      recentTrips: [],
      urgentTasks: [],
      allTrips: [],
      generalExpenses: [],
    };
  }

  // Ensure profile is synced safely
  let profile = null;
  try {
    profile = await syncUserProfile(user);
  } catch {
    profile = await db.profile.findUnique({
      where: { id: user.id },
      select: { id: true, fullName: true, defaultCurrency: true },
    });
  }

  const profileId = profile?.id || user.id;
  const defaultCurrency = profile?.defaultCurrency || "INR";

  // Fetch all user trips with relations
  const [trips, generalExpenses] = await Promise.all([
    db.trip.findMany({
      where: { profileId },
      include: {
        itinerary: {
          orderBy: [{ dayNumber: "asc" }, { order: "asc" }],
        },
        accommodations: {
          orderBy: { checkIn: "asc" },
        },
        expenses: {
          orderBy: { date: "desc" },
        },
        checklistItems: {
          orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
        },
        notes: {
          orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
          take: 3,
        },
        links: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.expense.findMany({
      where: {
        profileId: user.id,
        tripId: null,
      },
      orderBy: { date: "desc" },
    }),
  ]);

  const totalTrips = trips.length;
  const activeTrips = trips.filter((t) => t.status === "ACTIVE").length;
  const planningTrips = trips.filter((t) => t.status === "PLANNING").length;
  const completedTrips = trips.filter((t) => t.status === "COMPLETED").length;

  let tripSpend = 0;
  let pendingTasksCount = 0;
  let totalItineraryCount = 0;
  const urgentTasks: (ChecklistItem & { tripTitle: string })[] = [];

  trips.forEach((trip) => {
    tripSpend += trip.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const pendingItems = trip.checklistItems.filter((i) => !i.isCompleted);
    pendingTasksCount += pendingItems.length;
    totalItineraryCount += trip.itinerary.length;

    pendingItems.forEach((task) => {
      urgentTasks.push({
        ...task,
        tripTitle: trip.title,
      });
    });
  });

  const generalSpend = generalExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSpend = tripSpend + generalSpend;

  // Identify next upcoming/active trip:
  // First priority: ACTIVE trip, then PLANNING trip with earliest start date, else most recent trip
  const now = new Date();
  const activeTrip = trips.find((t) => t.status === "ACTIVE");
  const upcomingPlanning = trips
    .filter((t) => t.status === "PLANNING" && t.startDate && new Date(t.startDate) >= now)
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())[0];

  const selectedTrip = activeTrip || upcomingPlanning || trips[0] || null;

  let upcomingTripDetails: UpcomingTripDetails | null = null;

  if (selectedTrip) {
    // 1. Countdown Days calculation
    let countdownDays: number | null = null;
    if (selectedTrip.startDate) {
      const startMs = new Date(selectedTrip.startDate).getTime();
      const diffMs = startMs - now.getTime();
      countdownDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    // 2. Duration Days calculation
    let durationDays: number | null = null;
    if (selectedTrip.startDate && selectedTrip.endDate) {
      const s = new Date(selectedTrip.startDate).getTime();
      const e = new Date(selectedTrip.endDate).getTime();
      durationDays = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
    }

    // 3. Readiness calculations
    const totalItin = selectedTrip.itinerary.length;
    const totalAcc = selectedTrip.accommodations.length;
    const totalTasks = selectedTrip.checklistItems.length;
    const completedTasks = selectedTrip.checklistItems.filter((c) => c.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;

    // A balanced readiness formula: completed items / total items
    // If no items at all, readiness defaults to 0%
    const totalItems = totalItin + totalAcc + totalTasks;
    const completedItems = totalItin + totalAcc + completedTasks;
    const readinessPercentage =
      totalItems > 0 ? Math.min(100, Math.round((completedItems / totalItems) * 100)) : 0;

    const transitCount = selectedTrip.itinerary.filter(
      (i) =>
        i.category?.toUpperCase() === "TRAVEL" ||
        i.category?.toUpperCase() === "TRANSIT" ||
        i.category?.toUpperCase() === "FLIGHT"
    ).length;

    // 4. Financial breakdown
    const tripCurrency =
      selectedTrip.expenses[0]?.currency || defaultCurrency;
    const tripTotalSpent = selectedTrip.expenses.reduce((acc, curr) => acc + curr.amount, 0);

    // Realistic allocated budget baseline based on currency:
    const isINR = tripCurrency.toUpperCase() === "INR";
    const defaultBaseBudget = isINR ? 75000 : 1500;
    const bufferStep = isINR ? 10000 : 500;
    const roundCeil = isINR ? 1000 : 100;

    const allocatedBudget =
      tripTotalSpent > 0
        ? Math.max(
            Math.ceil((tripTotalSpent * 1.35) / roundCeil) * roundCeil,
            tripTotalSpent + bufferStep
          )
        : defaultBaseBudget;

    const remainingBudget = Math.max(0, allocatedBudget - tripTotalSpent);
    const percentUtilized =
      allocatedBudget > 0
        ? Math.min(100, Math.round((tripTotalSpent / allocatedBudget) * 1000) / 10)
        : 0;

    // Categorized breakdown
    const categoryTotals = new Map<string, number>();
    selectedTrip.expenses.forEach((e) => {
      const cat = e.category || "OTHER";
      categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + e.amount);
    });

    const categoryBreakdown: CategoryExpenseBreakdown[] = Array.from(
      categoryTotals.entries()
    ).map(([category, amount]) => ({
      category,
      amount,
      percentage:
        tripTotalSpent > 0 ? Math.round((amount / tripTotalSpent) * 100) : 0,
    }));

    // 5. Next Checkpoint calculation
    // Earliest pending task with a due date or fallback to first activity
    const pendingWithDue = selectedTrip.checklistItems
      .filter((c) => !c.isCompleted && c.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];

    let nextCheckpoint: UpcomingTripDetails["nextCheckpoint"] = null;
    if (pendingWithDue && pendingWithDue.dueDate) {
      const dueMs = new Date(pendingWithDue.dueDate).getTime();
      const daysRem = Math.ceil((dueMs - now.getTime()) / (1000 * 60 * 60 * 24));
      nextCheckpoint = {
        title: pendingWithDue.title,
        dueDate: pendingWithDue.dueDate,
        daysRemaining: daysRem,
      };
    } else if (selectedTrip.itinerary[0]) {
      nextCheckpoint = {
        title: selectedTrip.itinerary[0].title,
        dueDate: selectedTrip.itinerary[0].date,
        daysRemaining: countdownDays,
      };
    }

    // 6. Featured Stop calculation
    let featuredStop: UpcomingTripDetails["featuredStop"] = null;
    if (selectedTrip.itinerary[0]) {
      featuredStop = {
        title: selectedTrip.itinerary[0].title,
        subtitle:
          selectedTrip.itinerary[0].location ||
          (selectedTrip.itinerary[0].dayNumber
            ? `Day ${selectedTrip.itinerary[0].dayNumber} Stop`
            : "Featured Itinerary Activity"),
      };
    } else if (selectedTrip.destination) {
      featuredStop = {
        title: selectedTrip.destination,
        subtitle: "Key Travel Destination",
      };
    }

    upcomingTripDetails = {
      ...selectedTrip,
      countdownDays,
      durationDays,
      readiness: {
        totalItems,
        completedItems,
        percentage: readinessPercentage,
        staysCount: totalAcc,
        transitCount,
        tasksRemaining: pendingTasks,
      },
      financials: {
        currency: tripCurrency,
        totalSpent: tripTotalSpent,
        allocatedBudget,
        remainingBudget,
        percentUtilized,
        categoryBreakdown,
      },
      nextCheckpoint,
      featuredStop,
    };
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      fullName: profile?.fullName ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      defaultCurrency,
    },
    metrics: {
      totalTrips,
      activeTrips,
      planningTrips,
      completedTrips,
      totalSpend,
      tripSpend,
      generalSpend,
      pendingTasksCount,
      totalItineraryCount,
    },
    upcomingTrip: upcomingTripDetails,
    recentTrips: trips.slice(0, 5),
    urgentTasks: urgentTasks.slice(0, 5),
    allTrips: trips,
    generalExpenses,
  };
}
