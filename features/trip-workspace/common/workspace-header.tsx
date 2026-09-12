"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  Sparkles,
  Globe,
  Lock,
  Loader2,
  Copy,
  Share2,
  Clock,
  Check,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trip, TripStatus } from "@/features/trips/types";
import { EditTripDialog } from "@/features/trips/components/edit-trip-dialog";
import { DeleteTripDialog } from "@/features/trips/components/delete-trip-dialog";
import { WorkspaceAiPanel } from "@/features/trip-workspace/ai/components/workspace-ai-panel";
import { toggleTripPublishStatus } from "@/features/community/actions";
import { duplicateTrip, updateTrip } from "@/features/trips/actions";
import { CoverImage } from "@/components/storage/cover-image";

interface WorkspaceHeaderProps {
  trip: Trip & { isPublic?: boolean };
}

export function WorkspaceHeader({ trip }: WorkspaceHeaderProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(Boolean(trip.isPublic));
  const [tripStatus, setTripStatus] = useState<TripStatus>(trip.status);
  const [isPublishing, startPublishing] = useTransition();
  const [isDuplicating, startDuplicating] = useTransition();
  const [isStatusChanging, startStatusChange] = useTransition();

  const handleTogglePublish = () => {
    startPublishing(async () => {
      const nextState = !isPublic;
      const res = await toggleTripPublishStatus(trip.id, nextState);
      if (res.success) {
        setIsPublic(Boolean(res.isPublic));
        if (res.isPublic) {
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

  const formatDateRange = (start?: Date | string | null, end?: Date | string | null) => {
    if (!start && !end) return "Dates unset";
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    if (start && end) {
      const s = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const e = new Date(end).toLocaleDateString("en-US", options);
      return `${s} – ${e}`;
    }
    if (start) return `Starts ${new Date(start).toLocaleDateString("en-US", options)}`;
    return `Ends ${new Date(end!).toLocaleDateString("en-US", options)}`;
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
        return <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-xs">Happening Now</span>;
      }
    }

    if (diffDays > 0) {
      if (diffDays === 1) return <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-xs">Starts Tomorrow</span>;
      if (diffDays <= 30) return <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-xs">In {diffDays} days</span>;
      return <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-xs">In {Math.round(diffDays / 30)} months</span>;
    }

    if (diffDays === 0) {
      return <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-xs">Starts Today</span>;
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
            className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
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
              <SelectTrigger className="h-8 text-xs font-medium w-[125px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* AI Assistant Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium border-primary/30 hover:border-primary hover:bg-primary/5 text-primary cursor-pointer"
              onClick={() => setIsAiPanelOpen(true)}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Assistant
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
                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                  <Share2 className="h-3.5 w-3.5 mr-2" />
                  Copy Trip Link
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit Details & Cover
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                  className="cursor-pointer"
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
                  className="cursor-pointer"
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
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Trip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Trip Title & Sub-header Badges */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isPublic && (
              <Badge variant="secondary" className="gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <Globe className="w-2.5 h-2.5" /> Public Community Trip
              </Badge>
            )}
            {trip.destination && (
              <span className="inline-flex items-center text-xs text-muted-foreground font-medium">
                <MapPin className="w-3.5 h-3.5 mr-1 text-primary/80" />
                {trip.destination}
              </span>
            )}
            <span className="inline-flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground/70" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            {getCountdownLabel(trip.startDate, trip.endDate)}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {trip.title}
          </h1>
        </div>
      </div>

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

      <WorkspaceAiPanel
        tripId={trip.id}
        tripTitle={trip.title}
        destination={trip.destination}
        isOpen={isAiPanelOpen}
        onClose={() => setIsAiPanelOpen(false)}
      />
    </>
  );
}
