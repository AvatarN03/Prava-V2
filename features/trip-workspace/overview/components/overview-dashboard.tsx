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
  const pinnedNotes = notes.filter((n) => n.isPinned);

  return (
    <div className="space-y-6">
      {/* 4-Stat Metric Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border bg-card">
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
              className="text-[10px] text-primary hover:underline inline-flex items-center"
            >
              View timeline <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
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
              className="text-[10px] text-primary hover:underline inline-flex items-center"
            >
              {expenses.length} records <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
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
              className="text-[10px] text-primary hover:underline inline-flex items-center"
            >
              {completedTasks}/{checklist.length} tasks <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
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
              className="text-[10px] text-primary hover:underline inline-flex items-center"
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
          <Card className="border-border bg-card">
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
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
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
                        <Badge variant="planning">{item.category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stays & Accommodations */}
          <Card className="border-border bg-card">
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
              <Link
                href={`/trips/${trip.id}/accommodations`}
                className="text-xs text-primary font-medium hover:underline inline-flex items-center"
              >
                All ({accommodations.length}) <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
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
          <Card className="border-border bg-card">
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
              <Link
                href={`/trips/${trip.id}/checklist`}
                className="text-xs text-primary font-medium hover:underline inline-flex items-center"
              >
                View all <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
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
          <Card className="border-border bg-card">
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
