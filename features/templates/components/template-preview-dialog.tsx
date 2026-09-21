"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Compass,
  FileText,
  Loader2,
  MapPin,
  Sparkles,
  User,
  Wallet,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cloneTripTemplate } from "../actions";
import { TemplateTripItem } from "../types";

interface TemplatePreviewDialogProps {
  trip: TemplateTripItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloned?: (tripId: string) => void;
}

export function TemplatePreviewDialog({
  trip,
  open,
  onOpenChange,
  onCloned,
}: TemplatePreviewDialogProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("itinerary");
  const [showAiCustomizer, setShowAiCustomizer] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isCloning, startCloning] = useTransition();

  // Group itinerary items by day
  const groupedItinerary = useMemo(() => {
    if (!trip) return {};
    const groups: Record<number, typeof trip.itinerary> = {};
    trip.itinerary.forEach((item) => {
      const day = item.day || 1;
      if (!groups[day]) groups[day] = [];
      groups[day].push(item);
    });
    return groups;
  }, [trip]);

  if (!trip) return null;

  const handleClone = () => {
    startCloning(async () => {
      const res = await cloneTripTemplate(trip.id, aiPrompt.trim() || undefined);
      if (res.success && res.newTripId) {
        toast.success(
          aiPrompt.trim()
            ? `Tailored and cloned "${trip.title}" into your workspace!`
            : `Cloned "${trip.title}" into your workspace!`
        );
        onCloned?.(trip.id);
        onOpenChange(false);
        router.push(`/trips/${res.newTripId}`);
      } else {
        toast.error(res.error || "Failed to clone itinerary.");
      }
    });
  };

  const daysList = Object.keys(groupedItinerary).map(Number).sort((a, b) => a - b);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-sm sm:rounded-sm">
        {/* Modal Header */}
        <DialogHeader className="p-5 pb-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              <Clock className="w-3 h-3 mr-1" />
              {trip.durationDays} {trip.durationDays === 1 ? "Day" : "Days"}
            </Badge>

            {trip.isOwn && (
              <Badge className="bg-primary/15 text-primary border border-primary/30 text-xs px-2 py-0.5">
                <User className="w-3 h-3 mr-1" /> Your Template
              </Badge>
            )}

            {trip.destination && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {trip.destination}
              </span>
            )}

            {trip.metrics.expenseTotal > 0 && (
              <Badge className="ml-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs">
                <Wallet className="w-3 h-3 mr-1" />
                Est. ~{trip.metrics.expenseTotal.toLocaleString()}{" "}
                {trip.metrics.currency}
              </Badge>
            )}
          </div>

          <DialogTitle className="text-lg font-bold text-foreground">
            {trip.title}
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground line-clamp-2">
            {trip.description ||
              "Review the full day-by-day schedule, stays, and packing list before cloning."}
          </DialogDescription>
        </DialogHeader>

        {/* Modal Body with Tabs */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 h-9 mb-4 rounded-sm">
              <TabsTrigger value="itinerary" className="text-xs gap-1.5 rounded-sm">
                <Calendar className="h-3.5 w-3.5" />
                <span>Itinerary ({trip.metrics.activityCount})</span>
              </TabsTrigger>

              <TabsTrigger value="stays" className="text-xs gap-1.5 rounded-sm">
                <Compass className="h-3.5 w-3.5" />
                <span>Stays ({trip.metrics.accommodationCount})</span>
              </TabsTrigger>

              <TabsTrigger value="prep" className="text-xs gap-1.5 rounded-sm">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>Packing & Tips</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Day-by-day Itinerary */}
            <TabsContent value="itinerary" className="space-y-4 mt-0">
              {daysList.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No scheduled activities logged in this itinerary.
                </div>
              ) : (
                daysList.map((dayNum) => (
                  <div
                    key={dayNum}
                    className="rounded-sm border border-border bg-card p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        Day {dayNum}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {groupedItinerary[dayNum].length} activities
                      </span>
                    </div>

                    <div className="space-y-2 pt-0.5">
                      {groupedItinerary[dayNum].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-semibold text-foreground">
                              {item.title}
                            </p>
                            {item.description && (
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            {item.location && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-primary" />
                                {item.location}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {item.category && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0"
                              >
                                {item.category}
                              </Badge>
                            )}
                            {item.cost && item.cost > 0 ? (
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {trip.metrics.currency} {item.cost}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Tab 2: Accommodations */}
            <TabsContent value="stays" className="space-y-3 mt-0">
              {trip.accommodations.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No accommodations logged for this trip.
                </div>
              ) : (
                trip.accommodations.map((stay, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-sm border border-border bg-card flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground">
                          {stay.name}
                        </span>
                        {stay.type && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0"
                          >
                            {stay.type}
                          </Badge>
                        )}
                      </div>
                      {stay.address && (
                        <p className="text-[11px] text-muted-foreground">
                          {stay.address}
                        </p>
                      )}
                    </div>

                    {stay.cost && stay.cost > 0 ? (
                      <span className="font-semibold text-xs text-foreground shrink-0">
                        {stay.currency} {stay.cost.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                ))
              )}
            </TabsContent>

            {/* Tab 3: Packing & Tips */}
            <TabsContent value="prep" className="space-y-4 mt-0">
              {trip.checklistHighlights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CheckSquare className="h-3.5 w-3.5 text-primary" /> Recommended
                    Packing Checklist
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {trip.checklistHighlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-sm bg-muted/30 border border-border/50 text-xs text-foreground flex items-center gap-2"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {trip.tips.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" /> Local Tips &
                    Notes
                  </h4>
                  <div className="space-y-1.5">
                    {trip.tips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-sm bg-primary/5 border border-primary/20 text-xs text-foreground"
                      >
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {trip.checklistHighlights.length === 0 && trip.tips.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No packing checklist or notes attached to this template.
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Optional AI Tailor Accordion */}
          <div className="rounded-sm border border-primary/30 bg-primary/5 p-3.5 space-y-2">
            <div
              onClick={() => setShowAiCustomizer(!showAiCustomizer)}
              className="flex items-center justify-between cursor-pointer text-xs font-bold text-foreground hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-primary" />
                <span>Tailor this itinerary with AI before cloning</span>
                <span className="text-[10px] font-normal text-primary/80 bg-primary/10 px-1.5 py-0.2 rounded-full">
                  Free
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {showAiCustomizer ? "▲ Hide" : "▼ Open"}
              </span>
            </div>

            {showAiCustomizer && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Provide custom instructions for our free AI model (e.g. &ldquo;Make all
                  food stops pure vegetarian&rdquo;, &ldquo;Slower pace suitable for toddlers&rdquo;,
                  or &ldquo;Focus on budget-friendly free sights&rdquo;).
                </p>
                <Input
                  placeholder="e.g. Adapt activities for a relaxed, kid-friendly pace..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <DialogFooter className="p-4 border-t border-border bg-muted/20 flex flex-row items-center justify-between gap-2 sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs cursor-pointer"
          >
            Close
          </Button>

          {trip.isOwn ? (
            <Button
              size="sm"
              disabled={true}
              variant="secondary"
              className="h-8 text-xs gap-1.5 opacity-90 cursor-not-allowed bg-primary/10 text-primary border border-primary/25 font-semibold"
            >
              <User className="h-3.5 w-3.5 text-primary" />
              <span>Your Template</span>
            </Button>
          ) : trip.isCloned ? (
            <Button
              size="sm"
              disabled={true}
              variant="secondary"
              className="h-8 text-xs gap-1.5 opacity-90 cursor-not-allowed bg-muted text-muted-foreground border border-border"
            >
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>Already in Workspace</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleClone}
              disabled={isCloning}
              className="h-8 text-xs gap-1.5 shadow-xs cursor-pointer"
            >
              {isCloning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>
                {aiPrompt.trim() ? "Tailor & Clone to Workspace" : "Clone to Workspace"}
              </span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
