"use client";

import { ProfileWithStats } from "../actions";
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
import { Globe, Sparkles, Bell, Save, Compass, Loader2, CheckCircle2, RefreshCw, HardDrive, Sun, Moon } from "lucide-react";
import { useOfflineSyncContext } from "@/lib/offline";
import { ThemeChanger } from "@/components/app-shell/theme-changer";

interface GeneralSectionProps {
  profile: ProfileWithStats;
  defaultCurrency: string;
  dateFormat: string;
  aiAutoPropose: boolean;
  emailNotifications: boolean;
  offlineMode: boolean;
  travelPreferences: string;
  setTravelPreferences: (val: string) => void;
  onUpdatePreference: (
    partial: Partial<{
      defaultCurrency: string;
      dateFormat: string;
      aiAutoPropose: boolean;
      emailNotifications: boolean;
      offlineMode: boolean;
      travelPreferences: string;
    }>,
    successMessage?: string
  ) => void;
  isSavingPreferences: boolean;
}

export function GeneralSection({
  defaultCurrency,
  dateFormat,
  aiAutoPropose,
  emailNotifications,
  offlineMode,
  travelPreferences,
  setTravelPreferences,
  onUpdatePreference,
  isSavingPreferences,
}: GeneralSectionProps) {
  const { isSyncing, lastSyncLabel, triggerSync, isOnline } = useOfflineSyncContext();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* 1. Theme & Appearance */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary">
              <Sun className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Theme & Appearance</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Customize your workspace visual style with Light, Dark, or System mode.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
            <div>
              <p className="font-semibold text-foreground">Interface Theme Mode</p>
              <p className="text-muted-foreground text-[11px]">Choose between light aesthetic, high-contrast dark palette, or OS sync</p>
            </div>
            <div className="w-full sm:w-64">
              <ThemeChanger />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Regional & Currency Defaults */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary">
              <Globe className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Region & Currency Defaults</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Configure your preferred currency and date representation across trips and expenses.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
            <div>
              <p className="font-semibold text-foreground">Default Currency</p>
              <p className="text-muted-foreground text-[11px]">Default currency for new trips, expense items, and budgets</p>
            </div>
            <div className="w-full sm:w-56">
              <Select
                value={defaultCurrency}
                onValueChange={(val) =>
                  onUpdatePreference(
                    { defaultCurrency: val },
                    `Default currency updated to ${val} in database.`
                  )
                }
              >
                <SelectTrigger className="h-8 rounded-sm cursor-pointer text-xs">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="rounded-sm text-xs">
                  <SelectItem value="USD" className="cursor-pointer text-xs">USD ($) — US Dollar</SelectItem>
                  <SelectItem value="EUR" className="cursor-pointer text-xs">EUR (€) — Euro</SelectItem>
                  <SelectItem value="GBP" className="cursor-pointer text-xs">GBP (£) — British Pound</SelectItem>
                  <SelectItem value="JPY" className="cursor-pointer text-xs">JPY (¥) — Japanese Yen</SelectItem>
                  <SelectItem value="AUD" className="cursor-pointer text-xs">AUD ($) — Australian Dollar</SelectItem>
                  <SelectItem value="CAD" className="cursor-pointer text-xs">CAD ($) — Canadian Dollar</SelectItem>
                  <SelectItem value="INR" className="cursor-pointer text-xs">INR (₹) — Indian Rupee</SelectItem>
                  <SelectItem value="CHF" className="cursor-pointer text-xs">CHF (Fr) — Swiss Franc</SelectItem>
                  <SelectItem value="SGD" className="cursor-pointer text-xs">SGD ($) — Singapore Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
            <div>
              <p className="font-semibold text-foreground">Date Display Format</p>
              <p className="text-muted-foreground text-[11px]">Timeline schedules, activity cards, and itinerary milestones</p>
            </div>
            <div className="w-full sm:w-56">
              <Select
                value={dateFormat}
                onValueChange={(val) =>
                  onUpdatePreference(
                    { dateFormat: val },
                    "Date display format updated in database."
                  )
                }
              >
                <SelectTrigger className="h-8 rounded-sm cursor-pointer text-xs">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="rounded-sm text-xs">
                  <SelectItem value="MMM D, YYYY" className="cursor-pointer text-xs">Oct 14, 2026</SelectItem>
                  <SelectItem value="DD/MM/YYYY" className="cursor-pointer text-xs">14/10/2026</SelectItem>
                  <SelectItem value="YYYY-MM-DD" className="cursor-pointer text-xs">2026-10-14</SelectItem>
                  <SelectItem value="MM/DD/YYYY" className="cursor-pointer text-xs">10/14/2026</SelectItem>
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
              onCheckedChange={(checked) =>
                onUpdatePreference(
                  { aiAutoPropose: checked },
                  checked
                    ? "Structured AI proposals enabled in database."
                    : "Structured AI proposals disabled in database."
                )
              }
              className="cursor-pointer"
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
                onCheckedChange={(checked) => {
                  onUpdatePreference(
                    { offlineMode: checked },
                    checked
                      ? "Offline travel cache enabled in database."
                      : "Offline travel cache disabled in database."
                  );
                  if (checked) {
                    // Trigger sync immediately on user toggle
                    setTimeout(() => triggerSync(), 200);
                  }
                }}
                className="cursor-pointer"
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
            />
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-3 border-t border-border/60 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={() =>
              onUpdatePreference(
                { travelPreferences },
                "Travel style & AI guidance saved to database."
              )
            }
            disabled={isSavingPreferences}
            className="h-8 rounded-sm text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSavingPreferences ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
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
              onCheckedChange={(checked) =>
                onUpdatePreference(
                  { emailNotifications: checked },
                  checked
                    ? "Trip departure reminders enabled in database."
                    : "Trip departure reminders disabled in database."
                )
              }
              className="cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


