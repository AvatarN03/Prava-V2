"use client";

import { useState } from "react";

import {
  Sparkles,
  Check,
  CheckCheck,
  X,
  Plus,
  RefreshCw,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Hotel,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { acceptAiProposal, rejectAiProposal } from "../actions";

import { cn } from "@/lib/utils";

import type { AiProposalDTO, AiProposalChange } from "../schema";

interface AiProposalCardProps {
  proposal: AiProposalDTO;
  tripId: string;
  onProposalResolved?: (updatedProposal: AiProposalDTO) => void;
}

export function AiProposalCard({
  proposal,
  tripId,
  onProposalResolved,
}: AiProposalCardProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    proposal.payload.changes.map((c) => c.id)
  );
  const [status, setStatus] = useState<"PENDING" | "ACCEPTED" | "REJECTED" | "PARTIAL">(
    proposal.status
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    if (status !== "PENDING") return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAccept = async (all: boolean = false) => {
    const idsToApply = all ? proposal.payload.changes.map((c) => c.id) : selectedIds;
    if (idsToApply.length === 0) {
      setError("Please select at least one change to apply.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await acceptAiProposal(tripId, proposal.id, idsToApply);
      if (!res.success) {
        setError(res.error || "Failed to apply changes.");
      } else {
        const nextStatus = res.status || (all ? "ACCEPTED" : "PARTIAL");
        setStatus(nextStatus);
        if (onProposalResolved) {
          onProposalResolved({
            ...proposal,
            status: nextStatus,
            resolvedAt: new Date().toISOString(),
          });
        }
      }
    } catch {
      setError("An unexpected error occurred while applying the proposal.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await rejectAiProposal(tripId, proposal.id);
      if (!res.success) {
        setError(res.error || "Failed to reject proposal.");
      } else {
        setStatus("REJECTED");
        if (onProposalResolved) {
          onProposalResolved({
            ...proposal,
            status: "REJECTED",
            resolvedAt: new Date().toISOString(),
          });
        }
      }
    } catch {
      setError("An unexpected error occurred while rejecting the proposal.");
    } finally {
      setLoading(false);
    }
  };

  const renderActionBadge = (action: AiProposalChange["action"]) => {
    switch (action) {
      case "create":
        return (
          <span className="inline-flex items-center gap-1 rounded-xs bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30 dark:bg-emerald-50 dark:text-emerald-700 dark:border-emerald-200">
            <Plus className="h-2.5 w-2.5" /> ADD
          </span>
        );
      case "update":
        return (
          <span className="inline-flex items-center gap-1 rounded-xs bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300 border border-sky-500/30 dark:bg-blue-50 dark:text-blue-700 dark:border-blue-200">
            <RefreshCw className="h-2.5 w-2.5" /> UPDATE
          </span>
        );
      case "delete":
        return (
          <span className="inline-flex items-center gap-1 rounded-xs bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30 dark:bg-rose-50 dark:text-rose-700 dark:border-rose-200">
            <Trash2 className="h-2.5 w-2.5" /> REMOVE
          </span>
        );
    }
  };

  return (
    <div className="my-3 rounded-xs border border-[#1E2B45] bg-[#0E1729] text-slate-200 dark:border-slate-200 dark:bg-white dark:text-slate-900 p-3 space-y-3 text-xs shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#152033] dark:border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-[#2D9BF0] dark:text-blue-600">
          <Sparkles className="h-3.5 w-3.5 text-[#2D9BF0]" />
          <span>Workspace Action Proposal</span>
        </div>

        {status === "PENDING" && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-xs bg-amber-500/15 text-amber-300 border-amber-500/30 dark:bg-amber-50 dark:text-amber-800 dark:border-amber-200">
            Pending Review
          </Badge>
        )}
        {status === "ACCEPTED" && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-xs bg-emerald-500/15 text-emerald-300 border-emerald-500/30 dark:bg-emerald-50 dark:text-emerald-800 dark:border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" /> Accepted
          </Badge>
        )}
        {status === "PARTIAL" && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-xs bg-sky-500/15 text-sky-300 border-sky-500/30 dark:bg-blue-50 dark:text-blue-800 dark:border-blue-200">
            Partially Applied
          </Badge>
        )}
        {status === "REJECTED" && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-xs bg-rose-500/15 text-rose-300 border-rose-500/30 dark:bg-rose-50 dark:text-rose-800 dark:border-rose-200">
            Rejected
          </Badge>
        )}
      </div>

      {/* Proposal Summary */}
      <p className="font-medium text-slate-200 dark:text-slate-800 leading-snug">
        {proposal.summary}
      </p>

      {error && (
        <div className="flex items-center gap-1.5 rounded-xs bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Changes list */}
      <div className="space-y-2">
        {proposal.payload.changes.map((change) => {
          const isSelected = selectedIds.includes(change.id);
          return (
            <div
              key={change.id}
              onClick={() => toggleSelect(change.id)}
              className={cn(
                "flex items-start gap-2.5 p-2.5 rounded-xs border transition-colors",
                status === "PENDING" ? "cursor-pointer" : "",
                isSelected
                  ? "bg-[#131F37] border-[#2D9BF0]/70 text-slate-100 dark:bg-blue-50/70 dark:border-blue-500 dark:text-slate-900 shadow-2xs"
                  : "bg-[#090E1A]/80 border-[#152033] text-slate-300 dark:bg-slate-50 dark:border-slate-200 dark:text-slate-700 opacity-70"
              )}
            >
              {status === "PENDING" && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(change.id)}
                  className="mt-0.5 h-3.5 w-3.5 rounded-xs border-[#1E2B45] text-[#2D9BF0] focus:ring-[#2D9BF0] bg-[#0E1729] dark:bg-white dark:border-slate-300 cursor-pointer"
                />
              )}

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {renderActionBadge(change.action)}
                  <span className="font-bold text-white dark:text-slate-900">
                    {change.data.title || change.data.name || (change.action === "delete" ? "Target Item" : "New Item")}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500">
                    [{change.domain}]
                  </span>
                </div>

                {/* Itinerary Details */}
                {change.domain === "itinerary" && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400 dark:text-slate-600 pt-0.5">
                    {change.data.dayNumber && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#2D9BF0]" /> Day {change.data.dayNumber}
                      </span>
                    )}
                    {change.data.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#2D9BF0]" /> {change.data.time}
                      </span>
                    )}
                    {change.data.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#2D9BF0]" /> {change.data.location}
                      </span>
                    )}
                    {change.data.cost !== undefined && change.data.cost !== null && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-[#2D9BF0]" /> ${change.data.cost}
                      </span>
                    )}
                  </div>
                )}

                {/* Accommodation Details */}
                {change.domain === "accommodation" && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400 dark:text-slate-600 pt-0.5">
                    {change.data.type && (
                      <span className="flex items-center gap-1">
                        <Hotel className="h-3 w-3 text-[#2D9BF0]" /> {change.data.type}
                      </span>
                    )}
                    {change.data.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#2D9BF0]" /> {change.data.address}
                      </span>
                    )}
                    {change.data.checkIn && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#2D9BF0]" /> In: {change.data.checkIn}
                      </span>
                    )}
                    {change.data.checkOut && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#2D9BF0]" /> Out: {change.data.checkOut}
                      </span>
                    )}
                    {change.data.cost !== undefined && change.data.cost !== null && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-[#2D9BF0]" /> ${change.data.cost} {change.data.currency || "USD"}
                      </span>
                    )}
                  </div>
                )}

                {change.data.description && (
                  <p className="text-[11px] text-slate-300 dark:text-slate-600 leading-normal pt-0.5">
                    {change.data.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons for Pending Proposals */}
      {status === "PENDING" && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#152033] dark:border-slate-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReject}
            disabled={loading}
            className="h-7 px-2 text-xs rounded-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 dark:text-slate-500 dark:hover:text-rose-600 dark:hover:bg-rose-50 cursor-pointer shrink-0"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Reject
          </Button>

          <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
            {selectedIds.length > 0 && selectedIds.length < proposal.payload.changes.length && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAccept(false)}
                disabled={loading}
                className="h-7 px-2 text-xs rounded-xs border-[#1E2B45] text-slate-200 hover:bg-white/5 dark:border-slate-300 dark:text-slate-800 dark:hover:bg-slate-100 cursor-pointer shrink-0"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1 text-[#2D9BF0]" />}
                Apply ({selectedIds.length})
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => handleAccept(true)}
              disabled={loading}
              className="h-7 px-2.5 text-xs font-semibold rounded-xs bg-[#2D9BF0] hover:bg-[#2389d7] text-white shadow-xs cursor-pointer shrink-0"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
              )}
              Accept All ({proposal.payload.changes.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
