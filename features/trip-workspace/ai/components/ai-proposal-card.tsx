"use client";

import { useState } from "react";
import { AiProposalDTO, AiProposalChange } from "../schema";
import { acceptAiProposal, rejectAiProposal } from "../actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Check,
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
          <span className="inline-flex items-center gap-1 rounded-xs bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
            <Plus className="h-2.5 w-2.5" /> ADD
          </span>
        );
      case "update":
        return (
          <span className="inline-flex items-center gap-1 rounded-xs bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-200">
            <RefreshCw className="h-2.5 w-2.5" /> UPDATE
          </span>
        );
      case "delete":
        return (
          <span className="inline-flex items-center gap-1 rounded-xs bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 border border-red-200">
            <Trash2 className="h-2.5 w-2.5" /> REMOVE
          </span>
        );
    }
  };

  return (
    <div className="my-3 rounded-md border border-sky-200 bg-sky-50/50 p-3.5 space-y-3 text-xs shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-sky-200/80 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-sky-950">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>AI Workspace Action Proposal</span>
        </div>

        {status === "PENDING" && (
          <Badge variant="planning" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-800 border-amber-200">
            Pending Review
          </Badge>
        )}
        {status === "ACCEPTED" && (
          <Badge variant="active" className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" /> Accepted
          </Badge>
        )}
        {status === "PARTIAL" && (
          <Badge variant="active" className="text-[10px] px-1.5 py-0 bg-sky-100 text-sky-800 border-sky-300">
            Partially Applied
          </Badge>
        )}
        {status === "REJECTED" && (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )}
      </div>

      {/* Proposal Summary */}
      <p className="font-semibold text-sky-900 leading-snug">
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
              className={`flex items-start gap-2.5 p-2.5 rounded-sm border transition-colors ${
                status === "PENDING" ? "cursor-pointer" : ""
              } ${
                isSelected
                  ? "bg-background border-sky-300 shadow-2xs"
                  : "bg-background/60 border-border/80 opacity-70"
              }`}
            >
              {status === "PENDING" && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(change.id)}
                  className="mt-0.5 h-3.5 w-3.5 rounded-xs border-border text-primary focus:ring-primary"
                />
              )}

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {renderActionBadge(change.action)}
                  <span className="font-bold text-foreground">
                    {change.data.title || change.data.name || (change.action === "delete" ? "Target Item" : "New Item")}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">
                    [{change.domain}]
                  </span>
                </div>

                {/* Itinerary Details */}
                {change.domain === "itinerary" && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-0.5">
                    {change.data.dayNumber && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" /> Day {change.data.dayNumber}
                      </span>
                    )}
                    {change.data.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary" /> {change.data.time}
                      </span>
                    )}
                    {change.data.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" /> {change.data.location}
                      </span>
                    )}
                    {change.data.cost !== undefined && change.data.cost !== null && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-primary" /> ${change.data.cost}
                      </span>
                    )}
                  </div>
                )}

                {/* Accommodation Details */}
                {change.domain === "accommodation" && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-0.5">
                    {change.data.type && (
                      <span className="flex items-center gap-1">
                        <Hotel className="h-3 w-3 text-primary" /> {change.data.type}
                      </span>
                    )}
                    {change.data.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" /> {change.data.address}
                      </span>
                    )}
                    {change.data.checkIn && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" /> In: {change.data.checkIn}
                      </span>
                    )}
                    {change.data.checkOut && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" /> Out: {change.data.checkOut}
                      </span>
                    )}
                    {change.data.cost !== undefined && change.data.cost !== null && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-primary" /> ${change.data.cost} {change.data.currency || "USD"}
                      </span>
                    )}
                  </div>
                )}

                {change.data.description && (
                  <p className="text-[11px] text-muted-foreground leading-normal pt-0.5">
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
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-sky-200/80">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReject}
            disabled={loading}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Reject
          </Button>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && selectedIds.length < proposal.payload.changes.length && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAccept(false)}
                disabled={loading}
                className="h-8 px-2.5 text-xs"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                Apply Selected ({selectedIds.length})
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => handleAccept(true)}
              disabled={loading}
              className="h-8 px-3 text-xs font-semibold shadow-xs"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              Accept All ({proposal.payload.changes.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
