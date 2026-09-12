"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  MapPin,
  Calendar,
  Phone,
  KeyRound,
  DollarSign,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Copy,
  ExternalLink,
  Moon,
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
import { Accommodation } from "@prisma/client";
import { deleteAccommodation } from "../actions";
import { EditAccommodationDialog } from "./edit-accommodation-dialog";

interface AccommodationCardProps {
  item: Accommodation;
}

export function AccommodationCard({ item }: AccommodationCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const handleDelete = () => {
    startDelete(async () => {
      try {
        await deleteAccommodation({ id: item.id, tripId: item.tripId });
        toast.success(`Removed "${item.name}" from stays`);
        setIsDeleteOpen(false);
        router.refresh();
      } catch {
        toast.error("Failed to delete accommodation");
      }
    });
  };

  const handleCopyCode = () => {
    if (item.confirmationCode) {
      navigator.clipboard.writeText(item.confirmationCode);
      toast.success("Confirmation code copied to clipboard!");
    }
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate nights
  const nightsCount = (() => {
    if (!item.checkIn || !item.checkOut) return null;
    const diff = new Date(item.checkOut).getTime() - new Date(item.checkIn).getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  })();

  const mapsUrl = item.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${item.name}, ${item.address}`
      )}`
    : null;

  return (
    <>
      <div className="group relative flex flex-col justify-between p-4 rounded-md border border-border bg-card hover:border-primary/40 hover:shadow-2xs transition-all duration-150">
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="planning" className="text-[10px]">
                  {item.type || "Hotel"}
                </Badge>

                {nightsCount && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-xs">
                    <Moon className="w-3 h-3 text-muted-foreground/70" />
                    {nightsCount} night{nightsCount === 1 ? "" : "s"}
                  </span>
                )}

                {item.cost !== null && item.cost > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-xs border border-emerald-500/20">
                    <DollarSign className="w-3 h-3" />
                    {item.cost.toFixed(2)} {item.currency}
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-foreground leading-snug pt-0.5">
                {item.name}
              </h4>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit Stay
                </DropdownMenuItem>

                {item.confirmationCode && (
                  <DropdownMenuItem onClick={handleCopyCode} className="cursor-pointer">
                    <Copy className="h-3.5 w-3.5 mr-2" />
                    Copy Confirmation Code
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Stay
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Address */}
          {item.address && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{item.address}</span>
            </p>
          )}

          {/* Dates Strip */}
          {(item.checkIn || item.checkOut) && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground p-2 rounded-sm bg-muted/30 border border-border/50 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-sans">In:</span>
                <span className="font-semibold text-foreground">{formatDate(item.checkIn) || "Unset"}</span>
              </div>
              <span className="text-muted-foreground/40">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-sans">Out:</span>
                <span className="font-semibold text-foreground">{formatDate(item.checkOut) || "Unset"}</span>
              </div>
            </div>
          )}

          {/* Confirmation Code Pill */}
          {item.confirmationCode && (
            <div className="flex items-center justify-between gap-2 p-2 rounded-sm bg-muted/40 border border-border/60 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <KeyRound className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[11px] text-muted-foreground">Confirmation:</span>
                <span className="font-mono font-bold text-foreground truncate">
                  {item.confirmationCode}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/60">
              {item.notes}
            </p>
          )}
        </div>

        {/* Quick Action Links Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-border/60 text-xs">
          {item.contactPhone && (
            <a
              href={`tel:${item.contactPhone}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs border border-border bg-background hover:bg-muted text-foreground transition-colors font-medium text-[11px]"
            >
              <Phone className="w-3 h-3 text-muted-foreground" />
              Call Stay
            </a>
          )}

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs border border-border bg-background hover:bg-muted text-foreground transition-colors font-medium text-[11px]"
            >
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
              Open in Maps
            </a>
          )}
        </div>
      </div>

      <EditAccommodationDialog
        item={item}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Stay"
        description={`Are you sure you want to remove "${item.name}"?`}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
