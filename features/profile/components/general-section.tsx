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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Globe, Sparkles, Bell, Save } from "lucide-react";

interface GeneralSectionProps {
  profile: ProfileWithStats;
  defaultCurrency: string;
  setDefaultCurrency: (val: string) => void;
  dateFormat: string;
  setDateFormat: (val: string) => void;
  aiAutoPropose: boolean;
  setAiAutoPropose: (val: boolean) => void;
  emailNotifications: boolean;
  setEmailNotifications: (val: boolean) => void;
  offlineMode: boolean;
  setOfflineMode: (val: boolean) => void;
  onSavePreferences: () => void;
}

export function GeneralSection({
  defaultCurrency,
  setDefaultCurrency,
  dateFormat,
  setDateFormat,
  aiAutoPropose,
  setAiAutoPropose,
  emailNotifications,
  setEmailNotifications,
  offlineMode,
  setOfflineMode,
  onSavePreferences,
}: GeneralSectionProps) {
  return (
    <div className="space-y-6 max-w-3xl">
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
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
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
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger className="h-8 rounded-sm cursor-pointer text-xs">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="rounded-sm text-xs">
                  <SelectItem value="MMM D, YYYY" className="cursor-pointer text-xs">MMM D, YYYY (e.g. Oct 14, 2026)</SelectItem>
                  <SelectItem value="DD/MM/YYYY" className="cursor-pointer text-xs">DD/MM/YYYY (e.g. 14/10/2026)</SelectItem>
                  <SelectItem value="YYYY-MM-DD" className="cursor-pointer text-xs">YYYY-MM-DD (e.g. 2026-10-14)</SelectItem>
                  <SelectItem value="MM/DD/YYYY" className="cursor-pointer text-xs">MM/DD/YYYY (e.g. 10/14/2026)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. AI Assistant Features */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">AI Assistant Features</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Customize smart itinerary planning and autonomous trip suggestions.
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
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-1">
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
            />
          </div>
        </CardContent>
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
                Receive checklist alerts and flight countdown notices before your trip starts
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              className="cursor-pointer"
            />
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-3 border-t border-border/60 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={onSavePreferences}
            className="h-8 rounded-sm text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-3.5 w-3.5" />
            Save General Preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
