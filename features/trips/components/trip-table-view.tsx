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
  Loader2,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/app-shell/confirm-delete-dialog";
import { formatDateRange } from "@/lib/utils";
import { deleteTrip, duplicateTrip, toggleTripPublicStatus } from "../actions";
import { Trip } from "../types";
import { EditTripDialog } from "./edit-trip-dialog";

interface TripTableViewProps {
  trips: Trip[];
}

export function TripTableView({ trips }: TripTableViewProps) {
  const router = useRouter();
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleDuplicate = (trip: Trip) => {
    setActionPendingId(trip.id);
    startTransition(async () => {
      try {
        const res = await duplicateTrip(trip.id);
        if (res.success && res.data) {
          toast.success(`Cloned "${trip.title}" as "${res.data.title}"`);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to duplicate trip");
        }
      } catch {
        toast.error("Failed to duplicate trip");
      } finally {
        setActionPendingId(null);
      }
    });
  };

  const handleToggleShare = (trip: Trip) => {
    setActionPendingId(trip.id);
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
        setActionPendingId(null);
      }
    });
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLANNING":
        return <Badge variant="planning" className="text-[10px]">Planning</Badge>;
      case "ACTIVE":
        return <Badge variant="active" className="text-[10px]">Active</Badge>;
      case "COMPLETED":
        return <Badge variant="completed" className="text-[10px]">Completed</Badge>;
      case "ARCHIVED":
        return <Badge variant="archived" className="text-[10px]">Archived</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="rounded-md border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-2.5 px-4 font-medium">Trip & Destination</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Dates</th>
                <th className="py-2.5 px-3 font-medium">Inclusions</th>
                <th className="py-2.5 px-3 font-medium">Spent</th>
                <th className="py-2.5 px-3 font-medium">Visibility</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {trips.map((trip) => {
                const isPending = actionPendingId === trip.id;
                const activityCount = trip._count?.itinerary || 0;
                const stayCount = trip._count?.accommodations || 0;
                const taskCount = trip._count?.checklistItems || 0;
                const completedTasks = trip.completedTasksCount || 0;
                const spend = trip.totalSpend || 0;

                return (
                  <tr
                    key={trip.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Title and Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-sm overflow-hidden border border-border/80 bg-muted/60 relative">
                          {trip.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={trip.coverImageUrl}
                              alt={trip.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-sky-100 to-blue-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-primary/70">
                              <Compass className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/trips/${trip.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors truncate block text-sm"
                          >
                            {trip.title}
                          </Link>
                          {trip.destination ? (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate mt-0.5">
                              <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                              <span className="truncate">{trip.destination}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/60 italic">
                              No destination
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(trip.status)}
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-3 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                        <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                      </div>
                    </td>

                    {/* Inclusions */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground whitespace-nowrap">
                        <span title={`${activityCount} activities`}>
                          <strong>{activityCount}</strong> act
                        </span>
                        <span>•</span>
                        <span title={`${stayCount} stays`}>
                          <strong>{stayCount}</strong> stay{stayCount === 1 ? "" : "s"}
                        </span>
                        {taskCount > 0 && (
                          <>
                            <span>•</span>
                            <span title={`${completedTasks}/${taskCount} checklist tasks complete`}>
                              <strong>{completedTasks}</strong>/{taskCount} tasks
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Spent */}
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-foreground">
                      {spend > 0 ? (
                        <span className="text-[11px] font-semibold text-foreground">
                          ${spend.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/60">—</span>
                      )}
                    </td>

                    {/* Visibility */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {trip.isPublic ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <Globe className="h-3 w-3" /> Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Lock className="h-3 w-3" /> Private
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/trips/${trip.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-sm border border-border bg-background hover:bg-muted text-foreground transition-colors"
                        >
                          Workspace
                          <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                        </Link>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isPending}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              {isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => setEditingTrip(trip)}
                              className="cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              Edit Details & Cover
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDuplicate(trip)}
                              className="cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5 mr-2" />
                              Duplicate Trip
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleToggleShare(trip)}
                              className="cursor-pointer"
                            >
                              <Globe className="h-3.5 w-3.5 mr-2" />
                              {trip.isPublic ? "Make Private" : "Share to Community"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => setDeletingTrip(trip)}
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Delete Trip
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingTrip && (
        <EditTripDialog
          trip={editingTrip}
          open={!!editingTrip}
          onOpenChange={(open) => !open && setEditingTrip(null)}
        />
      )}

      {deletingTrip && (
        <ConfirmDeleteDialog
          open={!!deletingTrip}
          onOpenChange={(open) => !open && setDeletingTrip(null)}
          title="Delete Trip"
          description={`Are you sure you want to delete "${deletingTrip.title}"? This will permanently remove all associated itineraries, notes, and workspace data.`}
          onConfirm={async () => {
            const res = await deleteTrip({ id: deletingTrip.id });
            if (res.success) {
              toast.success(`Deleted "${deletingTrip.title}"`);
              router.refresh();
            } else {
              toast.error(res.error || "Failed to delete trip");
            }
          }}
        />
      )}
    </>
  );
}
