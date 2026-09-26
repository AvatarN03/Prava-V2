"use client";

import { useState, useTransition } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Compass,
  Copy,
  Globe,
  Loader2,
  Lock,
  MapPin,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/app-shell/confirm-delete-dialog";
import { CoverImage } from "@/components/storage/cover-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditTripDialog } from "@/features/trips/components/edit-trip-dialog";

import { useWorkspaceAi } from "@/features/trip-workspace/context/workspace-ai-context";

import {
  deleteTrip,
  duplicateTrip,
  toggleTripPublicStatus,
  updateTrip,
} from "@/features/trips/actions";
import { formatDateRange } from "@/lib/utils";

import type { Trip, TripStatus } from "@/features/trips/types";

interface WorkspaceHeaderProps {
  trip: Trip & { isPublic?: boolean };
}

export function WorkspaceHeader({ trip }: WorkspaceHeaderProps) {
  const router = useRouter();
  const { isAiOpen, toggleAi, userQuota } = useWorkspaceAi();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(Boolean(trip.isPublic));
  const [tripStatus, setTripStatus] = useState<TripStatus>(trip.status);
  const [isPublishing, startPublishing] = useTransition();
  const [isDuplicating, startDuplicating] = useTransition();
  const [isStatusChanging, startStatusChange] = useTransition();

  const handleTogglePublish = () => {
    startPublishing(async () => {
      const res = await toggleTripPublicStatus(trip.id);
      if (res.success && res.data) {
        setIsPublic(Boolean(res.data.isPublic));
        if (res.data.isPublic) {
          toast.success("Trip published to Community Hub!");
        } else {
          toast.info("Trip visibility changed to Private.");
        }
      } else {
        toast.error(res.error || "Failed to update trip visibility.");
      }
    });
  };

  const handleDuplicate = () => {
    startDuplicating(async () => {
      try {
        const res = await duplicateTrip(trip.id);
        if (res.success && res.data) {
          toast.success(`Duplicated workspace as "${res.data.title}"`);
          router.push(`/trips/${res.data.id}`);
        } else {
          toast.error(res.error || "Failed to duplicate trip");
        }
      } catch {
        toast.error("Failed to duplicate trip");
      }
    });
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Workspace URL copied to clipboard!");
    }
  };

  const handleStatusChange = (newStatus: TripStatus) => {
    setTripStatus(newStatus);
    startStatusChange(async () => {
      const res = await updateTrip({
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        description: trip.description,
        startDate: trip.startDate ? new Date(trip.startDate).toISOString().split("T")[0] : null,
        endDate: trip.endDate ? new Date(trip.endDate).toISOString().split("T")[0] : null,
        status: newStatus,
      });

      if (res.success) {
        toast.success(`Trip status set to ${newStatus.toLowerCase()}`);
        router.refresh();
      } else {
        setTripStatus(trip.status);
        toast.error(res.error || "Failed to update trip status");
      }
    });
  };

  const getCountdownLabel = (start?: Date | string | null, end?: Date | string | null) => {
    if (!start) return null;
    const now = new Date();
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const diffDays = Math.round((startMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

    if (endDate) {
      const endMidnight = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
      if (todayMidnight >= startMidnight && todayMidnight <= endMidnight) {
        return (
          <span className="inline-flex items-center gap-1.5 font-sans text-[10px] font-semibold tracking-wide uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-50/95 dark:bg-emerald-950/90 border border-emerald-200/90 dark:border-emerald-800/80 px-2 py-0.5 rounded-xs shadow-2xs">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Happening now
          </span>
        );
      }
    }

    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 font-sans text-[10px] font-semibold tracking-wide uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-50/95 dark:bg-emerald-950/90 border border-emerald-200/90 dark:border-emerald-800/80 px-2 py-0.5 rounded-xs shadow-2xs">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Starts today
        </span>
      );
    }

    if (diffDays > 0) {
      if (diffDays === 1) {
        return (
          <span className="inline-flex items-center gap-1 font-sans text-[10px] font-medium text-sky-700 dark:text-sky-300 bg-sky-50/95 dark:bg-sky-950/90 border border-sky-200/90 dark:border-sky-800/80 px-2 py-0.5 rounded-xs shadow-2xs">
            <Clock className="h-3 w-3 text-primary shrink-0" />
            Starts tomorrow
          </span>
        );
      }
      if (diffDays <= 30) {
        return (
          <span className="inline-flex items-center gap-1 font-sans text-[10px] font-medium text-sky-700 dark:text-sky-300 bg-sky-50/95 dark:bg-sky-950/90 border border-sky-200/90 dark:border-sky-800/80 px-2 py-0.5 rounded-xs shadow-2xs tabular-nums">
            <Clock className="h-3 w-3 text-primary shrink-0" />
            {diffDays} days left
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 font-sans text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/80 px-2 py-0.5 rounded-xs shadow-2xs tabular-nums">
          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
          In {Math.round(diffDays / 30)} months
        </span>
      );
    }

    return null;
  };

  return (
    <>
      <div className="space-y-4 pb-1">
        {/* Cover Banner with Supabase Storage upload */}
        <CoverImage
          tripId={trip.id}
          coverImageUrl={trip.coverImageUrl}
          title={trip.title}
          destination={trip.destination}
          isEditable={true}
        />

        {/* Top Control Bar: Back Button, AI Assistant Trigger, Share, Status and 3-Dot Actions */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/trips"
            className="inline-flex items-center font-sans text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
            Back to Trips
          </Link>

          <div className="flex items-center gap-2">
            {/* Quick Status Select */}
            <Select
              value={tripStatus}
              onValueChange={(val) => handleStatusChange(val as TripStatus)}
              disabled={isStatusChanging}
            >
              <SelectTrigger className="h-8 font-sans text-xs font-medium w-[125px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNING" className="font-sans text-xs font-medium cursor-pointer">
                  Planning
                </SelectItem>
                <SelectItem value="ACTIVE" className="font-sans text-xs font-medium cursor-pointer">
                  Active
                </SelectItem>
                <SelectItem value="COMPLETED" className="font-sans text-xs font-medium cursor-pointer">
                  Completed
                </SelectItem>
                <SelectItem value="ARCHIVED" className="font-sans text-xs font-medium cursor-pointer">
                  Archived
                </SelectItem>
              </SelectContent>
            </Select>

            {/* AI Assistant Button (Ichinose - Prava AI Assistant) */}
            <Button
              variant={isAiOpen ? "default" : "outline"}
              size="sm"
              className={`h-8 gap-1.5 font-sans text-xs font-medium cursor-pointer transition-all rounded-xs ${
                isAiOpen
                  ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                  : "border-primary/30 hover:border-primary hover:bg-primary/5 text-primary"
              }`}
              onClick={toggleAi}
              title="Ichinose — Prava Travel Assistant"
              aria-label="Ichinose — Prava Travel Assistant"
            >
              <div className="relative h-4 w-4 shrink-0 rounded-full overflow-hidden ring-1 ring-primary/40 shadow-2xs">
                <Image
                  src="/avatars/ichinose.png"
                  alt="Ichinose"
                  width={16}
                  height={16}
                  className="h-full w-full object-cover"
                />
              </div>
              <span>Ichinose</span>
              {userQuota && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-xs font-sans text-[10px] font-semibold tabular-nums leading-none ${
                    userQuota.remaining > 0
                      ? isAiOpen
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/10 text-primary"
                      : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {userQuota.remaining}
                </span>
              )}
            </Button>

            {/* 3-Dot Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Trip Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopyLink} className="font-sans text-xs font-medium cursor-pointer">
                  <Share2 className="h-3.5 w-3.5 mr-2" />
                  Copy Trip Link
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="font-sans text-xs font-medium cursor-pointer">
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit Details & Cover
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                  className="font-sans text-xs font-medium cursor-pointer"
                >
                  {isDuplicating ? (
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-2" />
                  )}
                  Duplicate Workspace
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleTogglePublish}
                  disabled={isPublishing}
                  className="font-sans text-xs font-medium cursor-pointer"
                >
                  {isPublishing ? (
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  ) : isPublic ? (
                    <Lock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  ) : (
                    <Globe className="h-3.5 w-3.5 mr-2 text-primary" />
                  )}
                  {isPublic ? "Make Private" : "Share to Community"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  className="font-sans text-xs font-medium text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Trip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Trip Title & Sub-header Badges */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isPublic && (
              <Badge
                variant="outline"
                className="gap-1 font-sans text-[10px] font-semibold tracking-wide uppercase border-emerald-200/90 bg-emerald-50/80 text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-2xs"
              >
                <Globe className="w-2.5 h-2.5" /> Public Community Trip
              </Badge>
            )}
            {trip.destination && (
              <span className="inline-flex items-center gap-1 font-sans text-xs font-medium text-foreground/80">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                {trip.destination}
              </span>
            )}
            <span className="inline-flex items-center gap-1 font-sans text-xs text-muted-foreground tabular-nums">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            {getCountdownLabel(trip.startDate, trip.endDate)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xs bg-sky-50 dark:bg-sky-950/40 text-primary border border-sky-200/60 dark:border-sky-800/40 shadow-2xs shrink-0">
                <Compass className="h-4.5 w-4.5" />
              </div>
              <h1 className="font-sans text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                {trip.title}
              </h1>
            </div>

            {trip.description && (
              <p className="font-serif italic text-sm sm:text-base text-muted-foreground leading-relaxed pt-0.5 max-w-3xl line-clamp-2">
                {trip.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <EditTripDialog
        trip={trip}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Trip"
        description={`Are you sure you want to delete "${trip.title}"? This will permanently remove all associated itineraries, notes, and workspace data.`}
        onConfirm={async () => {
          const res = await deleteTrip({ id: trip.id });
          if (res.success) {
            toast.success(`Deleted "${trip.title}"`);
            router.push("/trips");
            router.refresh();
          } else {
            toast.error(res.error || "Failed to delete trip");
          }
        }}
      />
    </>
  );
}

export default WorkspaceHeader;
