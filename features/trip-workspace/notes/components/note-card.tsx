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
  ChevronDown,
  ChevronUp,
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
import { MarkdownRenderer } from "@/features/blog/components/markdown-renderer";

const CATEGORY_STYLES: Record<string, string> = {
  General: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  Packing: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  Budget: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  Ideas: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  Transport: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  Accommodation: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
};

interface NoteCardProps {
  item: Note;
}

export function NoteCard({ item }: NoteCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinning, startPinning] = useTransition();

  const handleDelete = async () => {
    const res = await deleteNote({ id: item.id, tripId: item.tripId });
    if (res.success) {
      toast.success("Note deleted.");
      setIsDeleteOpen(false);
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
    toast.success("Note copied to clipboard!");
  };

  const catStyle =
    CATEGORY_STYLES[item.category || "General"] || CATEGORY_STYLES.General;

  const isLongNote = item.content.length > 250 || item.content.split("\n").length > 5;

  return (
    <>
      <div
        className={`group relative flex flex-col justify-between rounded-md border transition-all duration-150 overflow-hidden shadow-2xs ${
          item.isPinned
            ? "border-primary/50 bg-card"
            : "border-border bg-card hover:border-primary/40"
        }`}
      >
        {/* Pinned top accent */}
        {item.isPinned && (
          <div className="h-0.5 w-full bg-primary" />
        )}

        <div className="p-4 space-y-2.5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.isPinned && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-xs px-1.5 py-0.5">
                  <Pin className="w-2.5 h-2.5 fill-primary" />
                  Pinned
                </span>
              )}
              <span
                className={`inline-flex items-center text-[10px] font-medium border rounded-xs px-2 py-0.5 ${catStyle}`}
              >
                {item.category || "General"}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer -mr-1 -mt-1 shrink-0"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="sr-only">Note Options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleTogglePin} disabled={isPinning} className="cursor-pointer">
                  {isPinning ? (
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  ) : item.isPinned ? (
                    <PinOff className="h-3.5 w-3.5 mr-2" />
                  ) : (
                    <Pin className="h-3.5 w-3.5 mr-2" />
                  )}
                  {item.isPinned ? "Unpin Note" : "Pin to Top"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyContent} className="cursor-pointer">
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  Copy Note
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit Note
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

          {/* Title */}
          <h4 className="text-sm font-bold text-foreground leading-snug">
            {item.title}
          </h4>

          {/* Markdown Content */}
          <div className="relative">
            <div
              className={`text-xs text-muted-foreground leading-relaxed transition-all ${
                !isExpanded && isLongNote ? "max-h-28 overflow-hidden" : ""
              }`}
            >
              <MarkdownRenderer content={item.content} />
            </div>

            {!isExpanded && isLongNote && (
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            )}
          </div>
        </div>

        {/* Footer with Expand button or Date */}
        <div className="p-3 px-4 pt-0 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {new Date(item.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>

          <div className="flex items-center gap-2">
            {isLongNote && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-0.5 text-primary hover:underline font-medium cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    <span>Collapse</span>
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <span>Read more</span>
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyContent}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
              title="Copy note"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
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
        title="Delete Travel Note"
        description={`Are you sure you want to delete note "${item.title}"?`}
        onConfirm={handleDelete}
      />
    </>
  );
}
