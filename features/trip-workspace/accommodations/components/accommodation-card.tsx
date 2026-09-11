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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Accommodation } from "@prisma/client";
import { deleteAccommodation } from "../actions";
import { EditAccommodationDialog } from "./edit-accommodation-dialog";

interface AccommodationCardProps {
  item: Accommodation;
}

export function AccommodationCard({ item }: AccommodationCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this stay?")) return;
    startDelete(async () => {
      await deleteAccommodation({ id: item.id, tripId: item.tripId });
      router.refresh();
    });
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between p-4 rounded-sm border border-border bg-card hover:border-primary/40 transition-colors">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="planning">{item.type || "Hotel"}</Badge>
                {item.cost !== null && item.cost > 0 && (
                  <span className="inline-flex items-center text-xs font-mono font-medium text-foreground">
                    <DollarSign className="w-3 h-3 text-muted-foreground/70" />
                    {item.cost.toFixed(2)} {item.currency}
                  </span>
                )}
              </div>

              <h4 className="text-base font-semibold text-foreground leading-snug">
                {item.name}
              </h4>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit Stay
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Stay
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Dates & Location */}
          <div className="space-y-1 text-xs text-muted-foreground">
            {(item.checkIn || item.checkOut) && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                <span>
                  Check-in: {formatDate(item.checkIn) || "TBD"} &nbsp;•&nbsp; Check-out: {formatDate(item.checkOut) || "TBD"}
                </span>
              </div>
            )}

            {item.address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                <span>{item.address}</span>
              </div>
            )}
          </div>

          {/* Confirmation & Phone */}
          {(item.confirmationCode || item.contactPhone) && (
            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-border/50 text-xs">
              {item.confirmationCode && (
                <div className="inline-flex items-center gap-1 text-muted-foreground">
                  <KeyRound className="w-3 h-3 text-muted-foreground/70" />
                  <span className="font-mono">{item.confirmationCode}</span>
                </div>
              )}
              {item.contactPhone && (
                <div className="inline-flex items-center gap-1 text-muted-foreground">
                  <Phone className="w-3 h-3 text-muted-foreground/70" />
                  <span>{item.contactPhone}</span>
                </div>
              )}
            </div>
          )}

          {item.notes && (
            <p className="text-xs text-muted-foreground/90 leading-relaxed pt-1 whitespace-pre-wrap">
              {item.notes}
            </p>
          )}
        </div>
      </div>

      <EditAccommodationDialog
        item={item}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}
