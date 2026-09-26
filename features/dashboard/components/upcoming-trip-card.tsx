import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Database,
  Flag,
  MapPin,
  Plane,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { formatDateRange } from "@/lib/utils";

import type { UpcomingTripDetails } from "../queries";

interface UpcomingTripCardProps {
  trip: UpcomingTripDetails;
}

export function UpcomingTripCard({ trip }: UpcomingTripCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { label: "• ONGOING", variant: "default" as const };
      case "COMPLETED":
        return { label: "• COMPLETED", variant: "secondary" as const };
      default:
        return { label: "• CONFIRMED", variant: "outline" as const };
    }
  };

  const statusConfig = getStatusBadge(trip.status);

  // Generate a clean reference code
  const destinationCode = (trip.destination || trip.title)
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 2)
    .toUpperCase() || "TR";
  const tripYear = new Date(trip.startDate || trip.createdAt).getFullYear();
  const tripCode = `PRV-${destinationCode}-${tripYear}`;

  // Default fallback travel image
  const fallbackCover =
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="space-y-2">
      {/* Tracker label & Trip Code */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-sans font-semibold tracking-[0.16em] uppercase text-[10px] text-slate-400 dark:text-slate-500 select-none">
          Upcoming Trip
        </span>
        <span className="font-sans text-xs font-semibold tabular-nums tracking-wider text-muted-foreground">
          {tripCode}
        </span>
      </div>

      <Card className="border-border bg-card overflow-hidden shadow-xs rounded-md">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column: Details & Logistics (7 cols on desktop) */}
            <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={statusConfig.variant}
                    className="font-sans text-[10px] font-semibold tracking-wide uppercase px-2.5 py-0.5"
                  >
                    {statusConfig.label}
                  </Badge>

                  {trip.countdownDays !== null && (
                    <Badge
                      variant="outline"
                      className="font-sans text-[10px] font-semibold tabular-nums gap-1.5 px-2.5 py-0.5 border-sky-200/90 bg-sky-50/90 text-sky-700 dark:border-sky-800/80 dark:bg-sky-950/70 dark:text-sky-300 shadow-2xs"
                    >
                      <Clock className="w-3 h-3 text-primary shrink-0" />
                      {trip.countdownDays > 0
                        ? `${trip.countdownDays} ${trip.countdownDays === 1 ? "day left" : "days left"}`
                        : trip.countdownDays === 0
                        ? "Departing today"
                        : `${Math.abs(trip.countdownDays)} days elapsed`}
                    </Badge>
                  )}
                </div>

                {/* Main Destination Title & Route */}
                <div>
                  <h2 className="font-sans text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                    <Link
                      href={`/trips/${trip.id}`}
                      className="hover:text-primary transition-colors inline-flex items-center gap-2"
                    >
                      {trip.title}
                    </Link>
                  </h2>

                  {trip.destination && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-serif italic text-sm text-foreground/80">
                        {trip.destination}
                      </span>
                    </div>
                  )}
                </div>

                {/* Dates & duration metadata */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs text-muted-foreground tabular-nums">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </span>
                  {trip.durationDays && (
                    <>
                      <span>·</span>
                      <span>{trip.durationDays} days</span>
                    </>
                  )}
                  <span>·</span>
                  <span className="font-sans font-medium text-foreground/70">
                    Active Workspace
                  </span>
                </div>

                {/* Progress / Logistics readiness gauge */}
                <div className="pt-2 space-y-2.5">
                  <div className="flex items-center justify-between font-sans text-xs">
                    <span className="font-medium text-foreground">
                      Itinerary &amp; logistics {trip.readiness.percentage}% planned
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {trip.readiness.completedItems} / {trip.readiness.totalItems} items ready
                    </span>
                  </div>

                  <Progress
                    value={trip.readiness.percentage}
                    className="h-2 rounded-full bg-muted"
                  />

                  {/* Readiness indicators */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 font-sans text-[11px]">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xs bg-muted/60 text-foreground/90 font-medium border border-border/40">
                      <Plane className="w-3 h-3 text-primary" />
                      {trip.readiness.transitCount > 0
                        ? `${trip.readiness.transitCount} Transit items`
                        : "Transit ready"}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xs bg-muted/60 text-foreground/90 font-medium border border-border/40">
                      <BedDouble className="w-3 h-3 text-primary" />
                      {trip.readiness.staysCount > 0
                        ? `${trip.readiness.staysCount} Stays booked`
                        : "Stays flexible"}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xs bg-muted/60 text-foreground/90 font-medium border border-border/40">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {trip.readiness.tasksRemaining === 0
                        ? "Checklist complete"
                        : `${trip.readiness.tasksRemaining} tasks pending`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Button asChild className="gap-2 cursor-pointer w-full sm:w-auto font-sans text-xs font-semibold rounded-xs shadow-xs bg-[#2D9BF0] hover:bg-[#2587D3] text-white">
                  <Link href={`/trips/${trip.id}`}>
                    Open trip workspace
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </Link>
                </Button>

                <div className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
                  <Database className="w-3.5 h-3.5 text-primary/80" />
                  <span>Synced with PostgreSQL</span>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Image & Next Checkpoint (5 cols on desktop) */}
            <div className="lg:col-span-5 p-5 bg-muted/20 border-t lg:border-t-0 lg:border-l border-border/60 flex flex-col justify-between gap-4">
              {/* Featured Stop Image Card */}
              <div className="relative w-full aspect-16/10 sm:aspect-16/9 lg:aspect-auto lg:h-[220px] rounded-md overflow-hidden border border-border/60 shadow-xs group">
                <Image
                  src={trip.coverImageUrl || fallbackCover}
                  alt={trip.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {trip.featuredStop && (
                  <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                    <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-sky-300">
                      Featured Stop
                    </span>
                    <div className="font-sans text-sm font-semibold truncate">
                      {trip.featuredStop.title}
                    </div>
                    <div className="font-serif italic text-xs text-white/80 truncate">
                      {trip.featuredStop.subtitle}
                    </div>
                  </div>
                )}
              </div>

              {/* Next Checkpoint Alert Box */}
              {trip.nextCheckpoint ? (
                <div className="p-3.5 rounded-md border border-border bg-card flex items-start justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-1 rounded-sm bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Flag className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-sans text-[11px] font-semibold text-foreground">
                        Next checkpoint
                      </span>
                      <p className="font-sans text-muted-foreground truncate font-medium">
                        {trip.nextCheckpoint.title}
                      </p>
                    </div>
                  </div>

                  {trip.nextCheckpoint.daysRemaining !== null && (
                    <Badge variant="outline" className="font-sans text-[11px] shrink-0 tabular-nums">
                      {trip.nextCheckpoint.daysRemaining > 0
                        ? `In ${trip.nextCheckpoint.daysRemaining}d`
                        : trip.nextCheckpoint.daysRemaining === 0
                        ? "Today"
                        : "Overdue"}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-md border border-border bg-card flex items-center justify-between font-sans text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-primary" />
                    All trip checkpoints in order
                  </span>
                  <Link
                    href={`/trips/${trip.id}/checklist`}
                    className="text-primary hover:underline font-medium"
                  >
                    Add task
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UpcomingTripCard;
