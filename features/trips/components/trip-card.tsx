"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Globe,
  Lock,
  ArrowUpRight,
  Building2,
  CheckSquare,
  DollarSign,
  Compass,
  BookOpen,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
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
import { duplicateTrip, toggleTripPublicStatus } from "../actions";

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPendingAction, setIsPendingAction] = useState(false);
  const [, startTransition] = useTransition();

  const handleDuplicate = () => {
    setIsPendingAction(true);
    startTransition(async () => {
      try {
        const res = await duplicateTrip(trip.id);
        if (res.success && res.data) {
          toast.success(`Duplicated "${trip.title}"`);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to duplicate trip");
        }
      } catch {
        toast.error("Failed to duplicate trip");
      } finally {
        setIsPendingAction(false);
      }
    });
  };

  const handleToggleShare = () => {
    setIsPendingAction(true);
    startTransition(async () => {
      try {
        const res = await toggleTripPublicStatus(trip.id);
        if (res.success && res.data) {
          toast.success(
            res.data.isPublic
              ? `"${trip.title}" is now shared to the Community!`
              : `"${trip.title}" is now private.`
          );
          router.refresh();
        } else {
          toast.error(res.error || "Failed to update sharing settings");
        }
      } catch {
        toast.error("Failed to update sharing settings");
      } finally {
        setIsPendingAction(false);
      }
    });
  };

  const formatDateRange = (start?: Date | string | null, end?: Date | string | null) => {
    if (!start && !end) return "Dates unset";
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

  const getCountdownLabel = (start?: Date | string | null, end?: Date | string | null) => {
    if (!start) return null;
    const now = new Date();
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    // Reset time components for clean day diff
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const diffDays = Math.round((startMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

    if (endDate) {
      const endMidnight = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
      if (todayMidnight >= startMidnight && todayMidnight <= endMidnight) {
        return <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-xs">Happening Now</span>;
      }
    }

    if (diffDays > 0) {
      if (diffDays === 1) return <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-xs">Tomorrow</span>;
      if (diffDays <= 30) return <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-xs">In {diffDays} days</span>;
      return <span className="text-[10px] text-muted-foreground">In {Math.round(diffDays / 30)} months</span>;
    }

    if (diffDays === 0) {
      return <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-xs">Starts Today</span>;
    }

    return null;
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

  const activityCount = trip._count?.itinerary || 0;
  const stayCount = trip._count?.accommodations || 0;
  const taskCount = trip._count?.checklistItems || 0;
  const completedTasks = trip.completedTasksCount || 0;
  const spend = trip.totalSpend || 0;
  const storiesCount = trip._count?.linkedBlogPosts || 0;

  return (
    <>
      <Card className="group relative flex flex-col justify-between overflow-hidden border-border bg-card transition-all duration-150 hover:border-primary/40 hover:shadow-xs rounded-md">
        {/* Card Cover Banner */}
        <div className="relative h-32 w-full overflow-hidden border-b border-border/80 bg-muted/40">
          {trip.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trip.coverImageUrl}
              alt={trip.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-sky-500/10 via-primary/5 to-slate-800/10 dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center text-primary/40 relative">
              <Compass className="h-8 w-8 stroke-[1.5]" />
              {trip.destination && (
                <span className="text-[11px] font-medium text-muted-foreground/80 tracking-wide mt-1 uppercase">
                  {trip.destination}
                </span>
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Top Floating Badges */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <Badge variant={getStatusVariant(trip.status)} className="shadow-xs text-[10px] uppercase font-semibold">
                {trip.status.toLowerCase()}
              </Badge>
              {trip.isPublic && (
                <Badge variant="secondary" className="bg-emerald-500/90 text-white text-[10px] font-medium shadow-xs gap-1 border-0">
                  <Globe className="h-2.5 w-2.5" /> Public
                </Badge>
              )}
            </div>

            <div className="pointer-events-auto">
              {getCountdownLabel(trip.startDate, trip.endDate)}
            </div>
          </div>
        </div>

        {/* Card Header & Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  {trip.destination && (
                    <div className="flex items-center text-xs text-muted-foreground truncate">
                      <MapPin className="w-3 h-3 mr-1 text-primary/80 shrink-0" />
                      <span className="truncate font-medium">{trip.destination}</span>
                    </div>
                  )}
                  <CardTitle className="text-base font-semibold leading-snug tracking-tight line-clamp-1 pt-0.5">
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
                      disabled={isPendingAction}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                    >
                      {isPendingAction ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={`/trips/${trip.id}`}>
                        <ArrowUpRight className="h-3.5 w-3.5 mr-2" />
                        Open Workspace
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Edit Details & Cover
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate} className="cursor-pointer">
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Duplicate Trip
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleShare} className="cursor-pointer">
                      <Globe className="h-3.5 w-3.5 mr-2" />
                      {trip.isPublic ? "Make Private" : "Share to Community"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsDeleteOpen(true)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete Trip
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 pb-3 space-y-3">
              {trip.description ? (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {trip.description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/60 italic">
                  No description provided.
                </p>
              )}

              {/* Inclusions Chips Strip */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-xs border border-border/50">
                  <Calendar className="h-3 w-3 text-muted-foreground/70" />
                  <strong>{activityCount}</strong> act
                </span>

                <span className="inline-flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-xs border border-border/50">
                  <Building2 className="h-3 w-3 text-muted-foreground/70" />
                  <strong>{stayCount}</strong> stay{stayCount === 1 ? "" : "s"}
                </span>

                {taskCount > 0 && (
                  <span className="inline-flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-xs border border-border/50">
                    <CheckSquare className="h-3 w-3 text-muted-foreground/70" />
                    <strong>{completedTasks}</strong>/{taskCount}
                  </span>
                )}

                {spend > 0 && (
                  <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-xs border border-emerald-500/20">
                    <DollarSign className="h-3 w-3" />
                    {spend.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                )}

                {storiesCount > 0 && (
                  <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-700 dark:text-sky-400 font-medium px-2 py-0.5 rounded-xs border border-sky-500/20">
                    <BookOpen className="h-3 w-3" />
                    Story
                  </span>
                )}
              </div>
            </CardContent>
          </div>

          {/* Card Footer */}
          <CardFooter className="p-3 px-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
            <div className="inline-flex items-center truncate mr-2">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/70 shrink-0" />
              <span className="truncate">{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>

            <Link
              href={`/trips/${trip.id}`}
              className="inline-flex items-center font-medium text-foreground hover:text-primary transition-colors group-hover:translate-x-0.5 transform duration-150 shrink-0 ml-auto"
            >
              Workspace
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </CardFooter>
        </div>
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
