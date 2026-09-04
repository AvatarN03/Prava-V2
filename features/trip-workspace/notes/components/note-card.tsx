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
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
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
        className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden ${
          item.isPinned
            ? "border-[#2D9BF0]/40 bg-gradient-to-b from-sky-50/60 via-white to-white shadow-sm shadow-[#2D9BF0]/10"
            : "border-slate-200 bg-white hover:border-sky-300 hover:shadow-xs"
        }`}
      >
        {/* Pinned accent stripe */}
        {item.isPinned && (
          <div className="h-1 w-full bg-gradient-to-r from-[#2D9BF0] to-[#55B8FF]" />
        )}

        <div className="p-4 space-y-2.5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {item.isPinned && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#2D9BF0] bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5">
                  <Pin className="w-3 h-3 fill-[#2D9BF0]" />
                  Pinned
                </span>
              )}
              {item.category && (
                <span className={`inline-flex items-center text-[10px] font-bold border rounded-full px-2.5 py-0.5 ${catColor}`}>
                  {item.category}
                </span>
              )}
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400 hover:text-[#2D9BF0] hover:bg-sky-50 cursor-pointer"
                onClick={handleTogglePin}
                disabled={isPinning}
                title={item.isPinned ? "Unpin note" : "Pin note"}
              >
                {isPinning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
                    className="h-6 w-6 text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
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
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {item.title}
          </h4>

          {/* Content preview */}
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-4">
            {item.content}
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 pt-2 border-t border-slate-100/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <FileText className="h-3 w-3" />
            {item.content.split(/\s+/).filter(Boolean).length} words
          </div>
          <span className="text-[10px] text-slate-400">
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
