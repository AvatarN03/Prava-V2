import Link from "next/link";
import { Compass, MapPin, Calendar, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trip } from "@prisma/client";

interface RecentTripsListProps {
  trips: Trip[];
}

export function RecentTripsList({ trips }: RecentTripsListProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "active";
      case "PLANNING":
        return "planning";
      case "COMPLETED":
        return "completed";
      case "ARCHIVED":
        return "archived";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-primary" />
            Your Travel Workspaces
          </CardTitle>
          <CardDescription className="text-xs">
            Quick access to your trips
          </CardDescription>
        </div>
        <Link
          href="/trips"
          className="text-xs text-primary font-medium hover:underline inline-flex items-center"
        >
          View all ({trips.length}) <ArrowUpRight className="w-3 h-3 ml-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        {trips.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No trips created yet.
          </div>
        ) : (
          trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="flex items-center justify-between gap-3 p-2.5 rounded-sm border border-border bg-background hover:border-primary/40 hover:bg-accent/30 transition-colors text-xs group"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {trip.title}
                </div>
                {trip.destination && (
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                    {trip.destination}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={getStatusVariant(trip.status)}>
                  {trip.status.toLowerCase()}
                </Badge>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
