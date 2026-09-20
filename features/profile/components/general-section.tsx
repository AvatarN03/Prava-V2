"use client";

import {
  Globe,
  Sparkles,
  Bell,
  Save,
  Compass,
  Loader2,
  RefreshCw,
  HardDrive,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { useOfflineSyncContext } from "@/lib/offline";

import { ProfileWithStats } from "../actions";

interface GeneralSectionProps {
  profile: ProfileWithStats;
  defaultCurrency: string;
  onUpdateCurrency: (currency: string) => void;
  isUpdatingCurrency: boolean;
  aiAutoPropose: boolean;
  setAiAutoPropose: (val: boolean) => void;
  offlineMode: boolean;
  setOfflineMode: (val: boolean) => void;
  travelPreferences: string;
  setTravelPreferences: (val: string) => void;
  onSaveAiPreferences: (data: {
    aiAutoPropose: boolean;
    offlineMode: boolean;
    travelPreferences: string;
  }) => void;
  isSavingAiPreferences: boolean;
  emailNotifications: boolean;
  onUpdateNotification: (checked: boolean) => void;
  isUpdatingNotification: boolean;
}

export function GeneralSection({
  profile,
  defaultCurrency,
  onUpdateCurrency,
  isUpdatingCurrency,
  aiAutoPropose,
  setAiAutoPropose,
  offlineMode,
  setOfflineMode,
  travelPreferences,
  setTravelPreferences,
  onSaveAiPreferences,
  isSavingAiPreferences,
  emailNotifications,
  onUpdateNotification,
  isUpdatingNotification,
}: GeneralSectionProps) {
  const { isSyncing, lastSyncLabel, triggerSync, isOnline } = useOfflineSyncContext();

  const hasPersonaChanges =
    aiAutoPropose !== (profile.aiAutoPropose ?? true) ||
    offlineMode !== (profile.offlineMode ?? false) ||
    travelPreferences.trim() !== (profile.travelPreferences || "").trim();

  return (
    <div className="space-y-6 w-full">
      {/* 1. Regional & Currency Defaults */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Region & Currency Defaults</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Configure your preferred currency across trips, expense tracking, and budget calculations.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
            <div>
              <p className="font-semibold text-foreground">Default Currency</p>
              <p className="text-muted-foreground text-[11px]">Primary currency for new trips, live exchange rates, and expense allocations</p>
            </div>
            <div className="w-full sm:w-64">
              <Select
                value={defaultCurrency}
                onValueChange={onUpdateCurrency}
                disabled={isUpdatingCurrency}
              >
                <SelectTrigger className="h-8 rounded-sm cursor-pointer text-xs">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="rounded-sm text-xs max-h-64">
                  <SelectItem value="USD" className="cursor-pointer text-xs">USD ($) — US Dollar</SelectItem>
                  <SelectItem value="EUR" className="cursor-pointer text-xs">EUR (€) — Euro</SelectItem>
                  <SelectItem value="GBP" className="cursor-pointer text-xs">GBP (£) — British Pound</SelectItem>
                  <SelectItem value="JPY" className="cursor-pointer text-xs">JPY (¥) — Japanese Yen</SelectItem>
                  <SelectItem value="INR" className="cursor-pointer text-xs">INR (₹) — Indian Rupee</SelectItem>
                  <SelectItem value="AUD" className="cursor-pointer text-xs">AUD ($) — Australian Dollar</SelectItem>
                  <SelectItem value="CAD" className="cursor-pointer text-xs">CAD ($) — Canadian Dollar</SelectItem>
                  <SelectItem value="CHF" className="cursor-pointer text-xs">CHF (Fr) — Swiss Franc</SelectItem>
                  <SelectItem value="SGD" className="cursor-pointer text-xs">SGD ($) — Singapore Dollar</SelectItem>
                  <SelectItem value="NZD" className="cursor-pointer text-xs">NZD ($) — New Zealand Dollar</SelectItem>
                  <SelectItem value="AED" className="cursor-pointer text-xs">AED (د.إ) — UAE Dirham</SelectItem>
                  <SelectItem value="THB" className="cursor-pointer text-xs">THB (฿) — Thai Baht</SelectItem>
                  <SelectItem value="KRW" className="cursor-pointer text-xs">KRW (₩) — South Korean Won</SelectItem>
                  <SelectItem value="HKD" className="cursor-pointer text-xs">HKD ($) — Hong Kong Dollar</SelectItem>
                  <SelectItem value="SEK" className="cursor-pointer text-xs">SEK (kr) — Swedish Krona</SelectItem>
                  <SelectItem value="NOK" className="cursor-pointer text-xs">NOK (kr) — Norwegian Krone</SelectItem>
                  <SelectItem value="MXN" className="cursor-pointer text-xs">MXN ($) — Mexican Peso</SelectItem>
                  <SelectItem value="BRL" className="cursor-pointer text-xs">BRL (R$) — Brazilian Real</SelectItem>
                  <SelectItem value="ZAR" className="cursor-pointer text-xs">ZAR (R) — South African Rand</SelectItem>
                  <SelectItem value="MYR" className="cursor-pointer text-xs">MYR (RM) — Malaysian Ringgit</SelectItem>
                  <SelectItem value="IDR" className="cursor-pointer text-xs">IDR (Rp) — Indonesian Rupiah</SelectItem>
                  <SelectItem value="VND" className="cursor-pointer text-xs">VND (₫) — Vietnamese Dong</SelectItem>
                  <SelectItem value="TRY" className="cursor-pointer text-xs">TRY (₺) — Turkish Lira</SelectItem>
                  <SelectItem value="SAR" className="cursor-pointer text-xs">SAR (﷼) — Saudi Riyal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. AI Assistant Features & Travel Persona */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">AI Assistant & Travel Persona</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Customize smart itinerary planning, autonomous trip proposals, and travel preferences.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-4 text-xs">
          <div className="flex items-center justify-between py-1">
            <div className="space-y-0.5 pr-4">
              <p className="font-semibold text-foreground">Structured AI Proposal Cards</p>
              <p className="text-muted-foreground text-[11px]">
                Allow Prava AI to generate interactive action cards for 1-click workspace additions
              </p>
            </div>
            <Switch
              checked={aiAutoPropose}
              onCheckedChange={setAiAutoPropose}
              className="cursor-pointer"
              disabled={isSavingAiPreferences}
            />
          </div>

          <Separator />

          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <p className="font-semibold text-foreground">Offline Travel Cache</p>
                <p className="text-muted-foreground text-[11px]">
                  Pre-fetch trip essentials, emergency contacts, and maps for zero-connectivity access
                </p>
              </div>
              <Switch
                checked={offlineMode}
                onCheckedChange={setOfflineMode}
                className="cursor-pointer"
                disabled={isSavingAiPreferences}
              />
            </div>

            {offlineMode && (
              <div className="flex items-center justify-between rounded-xs border border-border/80 bg-muted/40 px-3 py-2 text-[11px]">
                <div className="flex items-center gap-2">
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                      <span className="text-foreground font-medium">Syncing active & planning trips to device...</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-muted-foreground">
                        Status: <strong className="text-foreground">{lastSyncLabel}</strong>
                      </span>
                    </>
                  )}
                </div>

                {isOnline && !isSyncing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => triggerSync()}
                    className="h-6 px-2 text-[11px] gap-1 text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Sync Now
                  </Button>
                )}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-1.5 py-1">
            <div className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <p className="font-semibold text-foreground">AI Travel Style & Dietary Guidance</p>
            </div>
            <p className="text-muted-foreground text-[11px]">
              Prava AI uses these preferences (dietary restrictions, relaxed vs fast pacing, preferred hotel vibes) when drafting your itineraries.
            </p>
            <Textarea
              value={travelPreferences}
              onChange={(e) => setTravelPreferences(e.target.value)}
              placeholder="e.g. Vegetarian, love historic architecture and coffee shops, prefer moderate pace with max 3-4 activities per day."
              className="h-20 text-xs rounded-sm resize-none"
              maxLength={1000}
              disabled={isSavingAiPreferences}
            />
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            {hasPersonaChanges ? (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                You have unsaved changes. Click Save AI Travel Preferences to update.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                AI persona & offline settings are up to date.
              </p>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (!hasPersonaChanges) return;
              onSaveAiPreferences({
                aiAutoPropose,
                offlineMode,
                travelPreferences: travelPreferences.trim() || "",
              });
              if (offlineMode && !profile.offlineMode) {
                setTimeout(() => triggerSync(), 250);
              }
            }}
            disabled={isSavingAiPreferences || !hasPersonaChanges}
            className={`h-8 rounded-sm text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 ${
              isSavingAiPreferences || !hasPersonaChanges
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
          >
            {isSavingAiPreferences ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            Save AI Travel Preferences
          </Button>
        </CardFooter>
      </Card>

      {/* 3. Notifications & Trip Alerts */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary">
              <Bell className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Notifications & Alerts</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Manage notifications for upcoming travel departures and task checklists.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-4 text-xs">
          <div className="flex items-center justify-between py-1">
            <div className="space-y-0.5 pr-4">
              <p className="font-semibold text-foreground">Trip Departure & Milestone Reminders</p>
              <p className="text-muted-foreground text-[11px]">
                Receive checklist alerts and countdown notices before your scheduled departure
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={onUpdateNotification}
              className="cursor-pointer"
              disabled={isUpdatingNotification}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


