import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  Calendar,
  Compass,
  MapPin,
  Plane,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateRange } from "@/lib/utils";

import type { TripSummaryItem } from "../queries";

interface RecentTripsListProps {
  trips: TripSummaryItem[];
}

export function RecentTripsList({ trips }: RecentTripsListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { label: "Active", variant: "default" as const };
      case "PLANNING":
        return { label: "Planning", variant: "outline" as const };
      case "COMPLETED":
        return { label: "Completed", variant: "secondary" as const };
      case "ARCHIVED":
        return { label: "Archived", variant: "outline" as const };
      default:
        return { label: status.toLowerCase(), variant: "secondary" as const };
    }
  };

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            My trips
          </CardTitle>
        </div>

        <Link
          href="/trips"
          className="text-xs text-primary font-medium hover:underline inline-flex items-center"
        >
          View all ({trips.length}) <ArrowUpRight className="w-3 h-3 ml-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 space-y-2.5">
        {trips.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No trips created yet.
          </div>
        ) : (
          trips.map((trip) => {
            const statusConfig = getStatusBadge(trip.status);
            const isCompleted = trip.status === "COMPLETED";

            return (
              <div
                key={trip.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-md border border-border/80 bg-background hover:border-primary/40 hover:bg-accent/30 transition-colors text-xs group"
              >
                {/* Left: Thumbnail icon & details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border border-border/50">
                    {trip.coverImageUrl ? (
                      <Image
                        src={trip.coverImageUrl}
                        alt={trip.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <Compass className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/trips/${trip.id}`}
                        className="font-semibold text-foreground truncate group-hover:text-primary transition-colors max-w-[180px] sm:max-w-[240px]"
                      >
                        {trip.title}
                      </Link>
                      <Badge
                        variant={statusConfig.variant}
                        className="text-[10px] px-1.5 py-0 font-normal"
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
                      {trip.destination && (
                        <>
                          <span className="truncate max-w-[120px]">{trip.destination}</span>
                          <span>·</span>
                        </>
                      )}
                      <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Action Button */}
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-7 px-2.5 text-xs shrink-0 cursor-pointer hover:border-primary/50"
                >
                  <Link href={`/trips/${trip.id}`}>
                    {isCompleted ? "Review" : "Open"}
                  </Link>
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
