"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trip } from "../types";
import { EditTripDialog } from "./edit-trip-dialog";
import { DeleteTripDialog } from "./delete-trip-dialog";

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const formatDateRange = (start?: Date | string | null, end?: Date | string | null) => {
    if (!start && !end) return "Dates not set";
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    if (start && end) {
      const s = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const e = new Date(end).toLocaleDateString("en-US", options);
      return `${s} – ${e}`;
    }
    if (start) {
      return `Starts ${new Date(start).toLocaleDateString("en-US", options)}`;
    }
    return `Ends ${new Date(end!).toLocaleDateString("en-US", options)}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PLANNING":
        return "planning";
      case "ACTIVE":
        return "active";
      case "COMPLETED":
        return "completed";
      case "ARCHIVED":
        return "archived";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <Card className="group relative flex flex-col justify-between overflow-hidden border-border bg-card transition-all duration-150 hover:border-primary/40 hover:shadow-xs">
        {trip.coverImageUrl && (
          <div className="relative h-28 w-full overflow-hidden border-b border-border bg-muted/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trip.coverImageUrl}
              alt={trip.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}
        <div>
          <CardHeader className="p-5 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getStatusVariant(trip.status)}>
                    {trip.status.toLowerCase()}
                  </Badge>
                  {trip.destination && (
                    <span className="inline-flex items-center text-xs text-muted-foreground truncate max-w-[200px]">
                      <MapPin className="w-3 h-3 mr-1 text-muted-foreground/80 shrink-0" />
                      {trip.destination}
                    </span>
                  )}
                </div>
                <CardTitle className="text-base font-semibold leading-snug tracking-tight line-clamp-1 pt-1">
                  <Link
                    href={`/trips/${trip.id}`}
                    className="hover:text-primary transition-colors focus:outline-none focus:underline"
                  >
                    {trip.title}
                  </Link>
                </CardTitle>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDeleteOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete Trip
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 pb-3">
            {trip.description ? (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {trip.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">
                No description provided.
              </p>
            )}
          </CardContent>
        </div>

        <CardFooter className="p-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground bg-muted/20 rounded-b-sm">
          <div className="inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/70" />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>

          <Link
            href={`/trips/${trip.id}`}
            className="inline-flex items-center font-medium text-foreground hover:text-primary transition-colors group-hover:translate-x-0.5 transform duration-150"
          >
            Workspace
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </CardFooter>
      </Card>

      <EditTripDialog
        trip={trip}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DeleteTripDialog
        trip={trip}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
