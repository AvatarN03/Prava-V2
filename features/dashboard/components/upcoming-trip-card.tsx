import Link from "next/link";
import {
  Calendar,
  MapPin,
  ArrowUpRight,
  ListTodo,
  BedDouble,
  Receipt,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trip, ItineraryItem, Expense, ChecklistItem } from "@prisma/client";

interface UpcomingTripCardProps {
  trip: Trip & {
    itinerary: ItineraryItem[];
    expenses: Expense[];
    checklistItems: ChecklistItem[];
  };
}

export function UpcomingTripCard({ trip }: UpcomingTripCardProps) {
  const formatDateRange = (start?: Date | null, end?: Date | null) => {
    if (!start && !end) return "Dates not set";
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    if (start && end) {
      const s = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const e = new Date(end).toLocaleDateString("en-US", options);
      return `${s} – ${e}`;
    }
    if (start) return `Starts ${new Date(start).toLocaleDateString("en-US", options)}`;
    return `Ends ${new Date(end!).toLocaleDateString("en-US", options)}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "active";
      case "PLANNING":
        return "planning";
      case "COMPLETED":
        return "completed";
      default:
        return "secondary";
    }
  };

  const totalSpent = trip.expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Featured Trip
              </span>
              <Badge variant={getStatusVariant(trip.status)}>
                {trip.status.toLowerCase()}
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              <Link href={`/trips/${trip.id}`} className="hover:text-primary transition-colors">
                {trip.title}
              </Link>
            </CardTitle>
          </div>

          <Button size="sm" asChild>
            <Link href={`/trips/${trip.id}`}>
              Open Workspace
              <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
          {trip.destination && (
            <span className="inline-flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-muted-foreground/80" />
              {trip.destination}
            </span>
          )}
          <span className="inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground/80" />
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 pb-3 space-y-4">
        {trip.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {trip.description}
          </p>
        )}

        {/* Quick Tabs Bar */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <Link
            href={`/trips/${trip.id}/itinerary`}
            className="p-2.5 rounded-sm border border-border bg-background hover:border-primary/40 hover:bg-accent/40 transition-colors space-y-0.5"
          >
            <div className="font-semibold text-foreground">{trip.itinerary.length}</div>
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <ListTodo className="w-3 h-3 text-primary" /> Itinerary
            </div>
          </Link>

          <Link
            href={`/trips/${trip.id}/expenses`}
            className="p-2.5 rounded-sm border border-border bg-background hover:border-primary/40 hover:bg-accent/40 transition-colors space-y-0.5"
          >
            <div className="font-semibold font-mono text-foreground">${totalSpent.toFixed(0)}</div>
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Receipt className="w-3 h-3 text-primary" /> Spent
            </div>
          </Link>

          <Link
            href={`/trips/${trip.id}/checklist`}
            className="p-2.5 rounded-sm border border-border bg-background hover:border-primary/40 hover:bg-accent/40 transition-colors space-y-0.5"
          >
            <div className="font-semibold text-foreground">{trip.checklistItems.length}</div>
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <CheckSquare className="w-3 h-3 text-primary" /> Tasks
            </div>
          </Link>
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground flex items-center justify-between rounded-b-sm">
        <span>Workspace active & synced with PostgreSQL</span>
        <Link
          href={`/trips/${trip.id}/overview`}
          className="font-medium text-foreground hover:text-primary transition-colors inline-flex items-center"
        >
          View trip overview <ArrowUpRight className="w-3 h-3 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
