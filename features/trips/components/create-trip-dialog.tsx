"use client";

import * as React from "react";
import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  Calendar as CalendarIcon,
  MapPin,
  Sparkles,
  RotateCw,
  Check,
  ImageIcon,
  Compass,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";

import { useWorkspaceAi } from "@/features/trip-workspace/context/workspace-ai-context";

import { createTrip, getDestinationCoverImages, getUserAiPreferences } from "../actions";
import { TripStatus } from "../types";
import { UnsplashImage } from "@/services/unsplash";

interface CreateTripDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateTripDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: CreateTripDialogProps) {
  const router = useRouter();
  const { sendAiPrompt } = useWorkspaceAi();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "PLANNING" as TripStatus,
  });

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagePage, setImagePage] = useState(1);

  const [userAiAutoPropose, setUserAiAutoPropose] = useState<boolean>(true);
  const [generateProposal, setGenerateProposal] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const lastSearchedDest = React.useRef<string>("");
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Check user's account proposal preference when dialog opens
  useEffect(() => {
    if (isOpen) {
      getUserAiPreferences().then((pref) => {
        setUserAiAutoPropose(pref.aiAutoPropose);
        setGenerateProposal(pref.aiAutoPropose);
      });
    }
  }, [isOpen]);

  // Fetch tour-vibe cover images from server action
  const fetchCoverImages = useCallback(async (destination: string, page: number = 1) => {
    try {
      setImagesLoading(true);
      const res = await getDestinationCoverImages(destination, page);
      if (res.success && res.images?.length > 0) {
        setImages(res.images);
      }
    } catch (err) {
      console.error("Failed to load cover images:", err);
    } finally {
      setImagesLoading(false);
    }
  }, []);

  // Initial load of fallback images when dialog opens (zero Unsplash API rate limit consumption)
  useEffect(() => {
    if (isOpen && images.length === 0) {
      fetchCoverImages("", 1);
    }
  }, [isOpen, fetchCoverImages, images.length]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Trigger search only when user types a destination and leaves input (onBlur / Enter)
  const triggerDestinationSearch = useCallback((dest: string) => {
    const trimmed = dest.trim();
    if (trimmed === lastSearchedDest.current) return;
    lastSearchedDest.current = trimmed;
    setImagePage(1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If destination is empty, serve local fallbacks with zero Unsplash API calls
    if (!trimmed) {
      fetchCoverImages("", 1);
      return;
    }

    // Only query Unsplash API when user has typed a destination
    debounceTimerRef.current = setTimeout(() => {
      fetchCoverImages(trimmed, 1);
    }, 400);
  }, [fetchCoverImages]);

  const handleRefreshImages = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextPage = imagePage + 1;
    setImagePage(nextPage);
    fetchCoverImages(lastSearchedDest.current, nextPage);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      destination: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "PLANNING",
    });
    setSelectedImageUrl(null);
    setImagePage(1);
    lastSearchedDest.current = "";
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await createTrip({
        ...formData,
        coverImageUrl: selectedImageUrl || undefined,
      });

      if (res.success && res.data) {
        const newTripId = res.data.id;
        const targetDest = res.data.destination || res.data.title;
        setIsOpen(false);
        resetForm();
        if (userAiAutoPropose && generateProposal) {
          sendAiPrompt(
            `Create an initial structured itinerary proposal for ${targetDest} with day-by-day activities, timings, and recommended accommodations.`
          );
        }
        router.push(`/trips/${newTripId}`);
        router.refresh();
      } else {
        setError(res.error || "Failed to create trip");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] shadow-xs cursor-pointer text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Trip
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto p-6 gap-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-[#2D9BF0]">
                <Compass className="h-4.5 w-4.5" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight">Create New Trip</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Plan an itinerary, organize stays, and coordinate travel with AI-assisted proposals.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs space-y-1.5">
              <p className="text-destructive font-medium">{error}</p>
              {error.includes("limit reached") && (
                <div className="pt-0.5">
                  <a
                    href="/subscription"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2D9BF0] hover:underline"
                  >
                    View Pro Wanderer Plans &rarr;
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold text-slate-800">
                Trip Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Summer in Kyoto, Swiss Alps Trek"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isPending}
                className="h-10 text-sm focus-visible:ring-[#2D9BF0]"
              />
              {fieldErrors.title && (
                <p className="text-[11px] text-destructive">{fieldErrors.title[0]}</p>
              )}
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <Label htmlFor="destination" className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> Destination
              </Label>
              <Input
                id="destination"
                placeholder="e.g., Kyoto, Japan or Amalfi Coast"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                onBlur={() => triggerDestinationSearch(formData.destination)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    triggerDestinationSearch(formData.destination);
                  }
                }}
                disabled={isPending}
                className="h-10 text-sm focus-visible:ring-[#2D9BF0]"
              />
              {fieldErrors.destination && (
                <p className="text-[11px] text-destructive">{fieldErrors.destination[0]}</p>
              )}
            </div>

            {/* Dates Grid with shadcn DatePicker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-slate-400" /> Start Date
                </Label>
                <DatePicker
                  date={formData.startDate ? new Date(formData.startDate) : null}
                  onDateChange={(d) => {
                    const str = d ? d.toISOString().split("T")[0] : "";
                    setFormData({ ...formData, startDate: str });
                  }}
                  placeholder="Select start date"
                  disabled={isPending}
                  maxDate={formData.endDate ? new Date(formData.endDate) : null}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-slate-400" /> End Date
                </Label>
                <DatePicker
                  date={formData.endDate ? new Date(formData.endDate) : null}
                  onDateChange={(d) => {
                    const str = d ? d.toISOString().split("T")[0] : "";
                    setFormData({ ...formData, endDate: str });
                  }}
                  placeholder="Select end date"
                  disabled={isPending}
                  minDate={formData.startDate ? new Date(formData.startDate) : null}
                />
              </div>
            </div>
            {fieldErrors.endDate && (
              <p className="text-[11px] text-destructive">{fieldErrors.endDate[0]}</p>
            )}

            {/* Status Select with shadcn/ui */}
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold text-slate-800">
                Initial Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val as TripStatus })}
                disabled={isPending}
              >
                <SelectTrigger id="status" className="h-10 text-sm focus:ring-[#2D9BF0]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active (In Progress)</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tour-Vibe & Destination Cover Image Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-[#2D9BF0]" /> Choose Cover Photo
                  <span className="text-[11px] font-normal text-muted-foreground">(Optional)</span>
                </Label>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshImages}
                  disabled={imagesLoading || isPending}
                  className="h-7 px-2 text-[11px] text-slate-600 hover:text-[#2D9BF0] hover:bg-sky-50 gap-1 cursor-pointer"
                >
                  <RotateCw className={`h-3 w-3 ${imagesLoading ? "animate-spin" : ""}`} />
                  <span>Refresh Images</span>
                </Button>
              </div>

              {/* 6 Image Choices Responsive Grid */}
              <div className="grid grid-cols-3 gap-2">
                {imagesLoading && images.length === 0 ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 sm:h-22 w-full rounded-lg" />
                  ))
                ) : (
                  images.map((img) => {
                    const isSelected = selectedImageUrl === img.url;
                    return (
                      <div
                        key={img.id}
                        role="button"
                        tabIndex={0}
                        aria-label={img.alt}
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSelectedImageUrl(isSelected ? null : img.url);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedImageUrl(isSelected ? null : img.url);
                          }
                        }}
                        className={`group relative h-20 sm:h-22 rounded-lg overflow-hidden cursor-pointer border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D9BF0] ${
                          isSelected
                            ? "border-[#2D9BF0] ring-2 ring-[#2D9BF0] ring-offset-1 shadow-sm scale-[1.02]"
                            : "border-slate-200 hover:border-sky-300 hover:shadow-xs"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.thumbUrl}
                          alt={img.alt}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div
                          className={`absolute inset-0 transition-opacity duration-200 ${
                            isSelected
                              ? "bg-[#2D9BF0]/20"
                              : "bg-black/0 group-hover:bg-black/15"
                          }`}
                        />

                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2D9BF0] text-white shadow-xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}

                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-1 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[9px] text-white/90 truncate font-medium">
                            {img.photographerName}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {selectedImageUrl && (
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" /> Cover image selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedImageUrl(null)}
                    className="text-slate-500 hover:text-destructive hover:underline cursor-pointer"
                  >
                    Remove cover
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-slate-800">
                Notes & Highlights <span className="text-[11px] font-normal text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Key highlights, packing essentials, or travel vibe..."
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isPending}
                className="text-sm focus-visible:ring-[#2D9BF0] resize-none"
              />
            </div>

            {/* Structured Proposal Generation Option (Visible based on general preferences toggle) */}
            {userAiAutoPropose && (
              <div className="rounded-sm border border-[#2D9BF0]/30 bg-[#2D9BF0]/5 p-3.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-[#2D9BF0]" />
                    Structured Itinerary Proposal
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Auto-draft an initial day-by-day itinerary proposal with interactive 1-click additions upon workspace creation.
                  </p>
                </div>
                <Switch
                  checked={generateProposal}
                  onCheckedChange={setGenerateProposal}
                  className="cursor-pointer"
                  disabled={isPending}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-[#2D9BF0] hover:bg-[#1279CE] text-white shadow-xs cursor-pointer"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Create Trip
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
