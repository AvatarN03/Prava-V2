"use client";

import Link from "next/link";
import {
  Compass,
  Calendar,
  BedDouble,
  Receipt,
  FileText,
  CheckSquare,
  Link2,
  ArrowUpRight,
  Plus,
  Clock,
  MapPin,
  Check,
  Pin,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trip,
  ItineraryItem,
  Accommodation,
  Expense,
  Note,
  ChecklistItem,
  Link as PrismaLink,
} from "@prisma/client";
import { AddItineraryDialog } from "@/features/trip-workspace/itinerary/components/add-itinerary-dialog";
import { AddExpenseDialog } from "@/features/trip-workspace/expenses/components/add-expense-dialog";
import { AddAccommodationDialog } from "@/features/trip-workspace/accommodations/components/add-accommodation-dialog";
import { AddTaskDialog } from "@/features/trip-workspace/checklist/components/add-task-dialog";
import { TaskItem } from "@/features/trip-workspace/checklist/components/task-item";

interface OverviewDashboardProps {
  trip: Trip;
  itinerary: ItineraryItem[];
  accommodations: Accommodation[];
  expenses: Expense[];
  notes: Note[];
  checklist: ChecklistItem[];
  links: PrismaLink[];
}

export function OverviewDashboard({
  trip,
  itinerary,
  accommodations,
  expenses,
  notes,
  checklist,
  links,
}: OverviewDashboardProps) {
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const completedTasks = checklist.filter((i) => i.isCompleted).length;
  const checklistPercent = checklist.length > 0 ? Math.round((completedTasks / checklist.length) * 100) : 0;
  const pendingTasks = checklist.filter((i) => !i.isCompleted);

  // Compute Trip Timeline Context
  const now = new Date();
  const startDate = trip.startDate ? new Date(trip.startDate) : null;
  const endDate = trip.endDate ? new Date(trip.endDate) : null;

  let tripTimelineStatus: "FUTURE" | "ACTIVE_TODAY" | "PAST" | "UNSET" = "UNSET";
  let activeDayNumber = 1;
  let daysUntilStart = 0;
  let totalTripDays = 1;

  if (startDate) {
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    daysUntilStart = Math.round((startMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

    if (endDate) {
      const endMidnight = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
      totalTripDays = Math.max(1, Math.round((endMidnight - startMidnight) / (1000 * 60 * 60 * 24)) + 1);

      if (todayMidnight >= startMidnight && todayMidnight <= endMidnight) {
        tripTimelineStatus = "ACTIVE_TODAY";
        activeDayNumber = Math.min(
          totalTripDays,
          Math.max(1, Math.round((todayMidnight - startMidnight) / (1000 * 60 * 60 * 24)) + 1)
        );
      } else if (todayMidnight < startMidnight) {
        tripTimelineStatus = "FUTURE";
      } else {
        tripTimelineStatus = "PAST";
      }
    } else {
      if (daysUntilStart > 0) tripTimelineStatus = "FUTURE";
      else if (daysUntilStart === 0) tripTimelineStatus = "ACTIVE_TODAY";
      else tripTimelineStatus = "PAST";
    }
  }

  // Filter items for today if active
  const todayActivities = itinerary.filter((i) => (i.dayNumber || 1) === activeDayNumber);

  return (
    <div className="space-y-6">
      {/* Dynamic Trip Spotlight / Focus Banner */}
      {tripTimelineStatus === "ACTIVE_TODAY" && (
        <Card className="rounded-md border-primary/30 bg-gradient-to-r from-primary/5 via-sky-500/5 to-transparent p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-primary/15">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="active" className="text-[10px] font-semibold uppercase">
                    Happening Today
                  </Badge>
                  <span className="text-xs font-semibold text-foreground">
                    Day {activeDayNumber} of {totalTripDays}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  {trip.destination ? ` • ${trip.destination}` : ""}
                </p>
              </div>
            </div>

            <Link
              href={`/trips/${trip.id}/itinerary`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Open Day {activeDayNumber} Schedule <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayActivities.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {todayActivities.slice(0, 3).map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-sm border border-border/80 bg-background/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate">{act.title}</span>
                    {act.time && (
                      <span className="font-mono text-[10px] text-muted-foreground">{act.time}</span>
                    )}
                  </div>
                  {act.location && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                      <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                      <span className="truncate">{act.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground bg-background/60 p-2.5 rounded-sm border border-border/50">
              <span>No activities scheduled specifically for Day {activeDayNumber}.</span>
              <AddItineraryDialog
                tripId={trip.id}
                defaultDayNumber={activeDayNumber}
                trigger={
                  <Button variant="outline" size="sm" className="h-6 px-2 text-[11px]">
                    <Plus className="w-3 h-3 mr-1" /> Add Activity
                  </Button>
                }
              />
            </div>
          )}
        </Card>
      )}

      {tripTimelineStatus === "FUTURE" && daysUntilStart <= 14 && (
        <Card className="rounded-md border-border bg-gradient-to-r from-sky-500/5 via-primary/5 to-transparent p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-sky-500/10 text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Departure in {daysUntilStart} day{daysUntilStart === 1 ? "" : "s"}!
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {pendingTasks.length} packing or preparation items remaining on your checklist.
                </p>
              </div>
            </div>

            <Link
              href={`/trips/${trip.id}/checklist`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Review Checklist ({completedTasks}/{checklist.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      )}

      {/* 4-Stat Metric Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Itinerary Events */}
        <Card className="border-border bg-card shadow-2xs rounded-md">
          <CardHeader className="p-3.5 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Itinerary</span>
              <Calendar className="w-3.5 h-3.5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0.5">
            <div className="text-lg font-bold text-foreground">{itinerary.length} Events</div>
            <Link
              href={`/trips/${trip.id}/itinerary`}
              className="text-[10px] text-primary hover:underline inline-flex items-center font-medium mt-0.5"
            >
              View timeline <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </Link>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="border-border bg-card shadow-2xs rounded-md">
          <CardHeader className="p-3.5 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Total Spent</span>
              <Receipt className="w-3.5 h-3.5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0.5">
            <div className="text-lg font-bold font-mono text-foreground">${totalSpent.toFixed(2)}</div>
            <Link
              href={`/trips/${trip.id}/expenses`}
              className="text-[10px] text-primary hover:underline inline-flex items-center font-medium mt-0.5"
            >
              {expenses.length} records <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </Link>
          </CardContent>
        </Card>

        {/* Preparation / Checklist */}
        <Card className="border-border bg-card shadow-2xs rounded-md">
          <CardHeader className="p-3.5 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Preparation</span>
              <CheckSquare className="w-3.5 h-3.5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0.5">
            <div className="text-lg font-bold text-foreground">{checklistPercent}% Ready</div>
            <Link
              href={`/trips/${trip.id}/checklist`}
              className="text-[10px] text-primary hover:underline inline-flex items-center font-medium mt-0.5"
            >
              {completedTasks}/{checklist.length} tasks <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </Link>
          </CardContent>
        </Card>

        {/* Lodging & Links */}
        <Card className="border-border bg-card shadow-2xs rounded-md">
          <CardHeader className="p-3.5 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Lodging & Links</span>
              <BedDouble className="w-3.5 h-3.5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0.5">
            <div className="text-lg font-bold text-foreground">
              {accommodations.length} Stays • {links.length} Links
            </div>
            <Link
              href={`/trips/${trip.id}/accommodations`}
              className="text-[10px] text-primary hover:underline inline-flex items-center font-medium mt-0.5"
            >
              View bookings <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main 2-Column Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Itinerary & Stays */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Itinerary Activities */}
          <Card className="border-border bg-card shadow-2xs rounded-md">
            <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  Upcoming Itinerary
                </CardTitle>
                <CardDescription className="text-xs">
                  Day-by-day scheduled activities
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <AddItineraryDialog
                  tripId={trip.id}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs cursor-pointer">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Event
                    </Button>
                  }
                />
                <Link
                  href={`/trips/${trip.id}/itinerary`}
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center"
                >
                  All ({itinerary.length}) <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {itinerary.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No itinerary events scheduled yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {itinerary.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-sm border border-border bg-background hover:border-primary/40 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-primary/10 text-[10px] font-bold text-primary">
                          D{item.dayNumber || 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate">
                            {item.title}
                          </div>
                          {item.location && (
                            <div className="text-[11px] text-muted-foreground truncate">
                              {item.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.time && (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {item.time}
                          </span>
                        )}
                        <Badge variant="planning">{item.category || "Activity"}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stays & Accommodations */}
          <Card className="border-border bg-card shadow-2xs rounded-md">
            <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-primary" />
                  Stays & Accommodations
                </CardTitle>
                <CardDescription className="text-xs">
                  Lodging reservations & check-in details
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <AddAccommodationDialog
                  tripId={trip.id}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs cursor-pointer">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Stay
                    </Button>
                  }
                />
                <Link
                  href={`/trips/${trip.id}/accommodations`}
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center"
                >
                  All ({accommodations.length}) <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {accommodations.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No accommodations booked yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {accommodations.slice(0, 2).map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3 rounded-sm border border-border bg-background space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="planning">{acc.type || "Hotel"}</Badge>
                        {acc.confirmationCode && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            #{acc.confirmationCode}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-foreground">{acc.name}</div>
                      {acc.address && (
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          {acc.address}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Checklist, Pinned Notes & Quick Links */}
        <div className="space-y-6">
          {/* Checklist Snapshot */}
          <Card className="border-border bg-card shadow-2xs rounded-md">
            <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  Checklist Snapshot
                </CardTitle>
                <CardDescription className="text-xs">
                  Pending preparations
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <AddTaskDialog
                  tripId={trip.id}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs cursor-pointer">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Task
                    </Button>
                  }
                />
                <Link
                  href={`/trips/${trip.id}/checklist`}
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center"
                >
                  All ({checklist.length}) <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-2">
              {checklist.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  No preparation tasks yet.
                </div>
              ) : (
                checklist.slice(0, 4).map((item) => (
                  <TaskItem key={item.id} item={item} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Pinned & Recent Notes */}
          <Card className="border-border bg-card shadow-2xs rounded-md">
            <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  Notes & Tips
                </CardTitle>
                <CardDescription className="text-xs">
                  Important memos and bookmarks
                </CardDescription>
              </div>
              <Link
                href={`/trips/${trip.id}/notes`}
                className="text-xs text-primary font-medium hover:underline inline-flex items-center"
              >
                All ({notes.length}) <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-4 space-y-2">
              {notes.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  No notes saved yet.
                </div>
              ) : (
                notes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    className="p-2.5 rounded-sm border border-border bg-background space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground truncate">
                        {note.title}
                      </span>
                      {note.isPinned && (
                        <Pin className="w-3 h-3 text-primary fill-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
