"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Pin,
  PinOff,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Copy,
  FileText,
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
import { ConfirmDeleteDialog } from "@/components/app-shell/confirm-delete-dialog";
import { Note } from "@prisma/client";
import { toast } from "sonner";
import { deleteNote, togglePinNote } from "../actions";
import { EditNoteDialog } from "./edit-note-dialog";

const CATEGORY_COLORS: Record<string, string> = {
  General: "bg-sky-50 text-sky-800 border-sky-200",
  Packing: "bg-violet-50 text-violet-800 border-violet-200",
  Budget: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Ideas: "bg-amber-50 text-amber-800 border-amber-200",
  Transport: "bg-blue-50 text-blue-800 border-blue-200",
  Accommodation: "bg-pink-50 text-pink-800 border-pink-200",
};

interface NoteCardProps {
  item: Note;
}

export function NoteCard({ item }: NoteCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPinning, startPinning] = useTransition();

  const handleDelete = async () => {
    const res = await deleteNote({ id: item.id, tripId: item.tripId });
    if (res.success) {
      toast.success("Note deleted.");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete note.");
    }
  };

  const handleTogglePin = () => {
    startPinning(async () => {
      await togglePinNote({
        id: item.id,
        tripId: item.tripId,
        isPinned: !item.isPinned,
      });
      toast.success(item.isPinned ? "Note unpinned." : "Note pinned to top!");
      router.refresh();
    });
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(`${item.title}\n\n${item.content}`);
    toast.success("Note content copied to clipboard!");
  };

  const catColor =
    CATEGORY_COLORS[item.category || "General"] || CATEGORY_COLORS.General;

  return (
    <>
      <div
        className={`group relative flex flex-col justify-between rounded-sm border transition-colors overflow-hidden ${
          item.isPinned
            ? "border-primary/50 bg-card shadow-xs"
            : "border-border bg-card hover:border-primary/40"
        }`}
      >
        {/* Pinned accent indicator */}
        {item.isPinned && (
          <div className="h-0.5 w-full bg-primary" />
        )}

        <div className="p-4 space-y-2">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.isPinned && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-xs px-1.5 py-0.5">
                  <Pin className="w-2.5 h-2.5 fill-primary" />
                  Pinned
                </span>
              )}
              {item.category && (
                <Badge variant="secondary">
                  {item.category}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer"
                onClick={handleTogglePin}
                disabled={isPinning}
                title={item.isPinned ? "Unpin note" : "Pin note"}
              >
                {isPinning ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : item.isPinned ? (
                  <PinOff className="h-3.5 w-3.5" />
                ) : (
                  <Pin className="h-3.5 w-3.5" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit Note
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyContent} className="cursor-pointer">
                    <Copy className="h-3.5 w-3.5 mr-2" />
                    Copy Content
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleTogglePin} className="cursor-pointer">
                    {item.isPinned ? (
                      <>
                        <PinOff className="h-3.5 w-3.5 mr-2" />
                        Unpin Note
                      </>
                    ) : (
                      <>
                        <Pin className="h-3.5 w-3.5 mr-2" />
                        Pin to Top
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDeleteOpen(true)}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete Note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-foreground leading-snug">
            {item.title}
          </h4>

          {/* Content preview */}
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">
            {item.content}
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 pt-2 border-t border-border/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <FileText className="h-3 w-3" />
            {item.content.split(/\s+/).filter(Boolean).length} words
          </div>
          <span className="text-[10px] text-muted-foreground">
            Updated{" "}
            {new Date(item.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <EditNoteDialog
        item={item}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete this note?"
        description={`"${item.title}" will be permanently deleted. This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </>
  );
}
