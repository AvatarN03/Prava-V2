"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  Zap,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle2,
  ArrowUpRight,
  CreditCard,
  AlertCircle,
  ExternalLink,
  Layers,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UpgradeDialog } from "./upgrade-dialog";
import { UsageChart } from "./usage-chart";
import { AccountUsageData } from "../actions";

interface UsageViewProps {
  initialUsage: AccountUsageData;
}

export function UsageView({ initialUsage }: UsageViewProps) {
  const [usage] = useState<AccountUsageData>(initialUsage);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const isPro = usage.tier === "pro";
  const tripsPct = Math.min(100, Math.round((usage.tripsUsed / usage.tripsQuota) * 100));
  const aiPct = Math.min(100, Math.round((usage.aiCreditsUsed / usage.aiCreditsQuota) * 100));
  const isCreditsExhausted = usage.aiCreditsRemaining <= 0;

  // Calculate days remaining in current month
  const daysUntilRenewal = useMemo(() => {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return Math.max(1, lastDayOfMonth.getDate() - now.getDate());
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-[#2D9BF0] dark:bg-sky-950 dark:text-sky-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              AI & Workspace Usage
            </h1>
            <Badge
              variant="secondary"
              className={`text-xs font-semibold ${
                isPro
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  : "bg-muted text-foreground border-border"
              }`}
            >
              {usage.tierName}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time tracking of your AI assistant credits, workspace trip capacity, and per-trip consumption.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isPro ? (
            <Button
              onClick={() => setUpgradeOpen(true)}
              className="bg-primary text-primary-foreground font-semibold text-xs h-8 px-3.5 rounded-sm shadow-xs gap-1.5 cursor-pointer hover:bg-primary/90"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              Upgrade to Pro (150 Credits)
            </Button>
          ) : (
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-semibold dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              Pro Wanderer Active
            </Badge>
          )}
        </div>
      </div>

      {/* ── Quota Exhaustion Alert Banner ── */}
      {isCreditsExhausted && (
        <div className="rounded-sm border border-rose-500/30 bg-rose-500/10 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-rose-500/20 text-rose-600 dark:text-rose-400 mt-0.5">
              <AlertCircle className="h-4 w-4" />
            </span>
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-rose-700 dark:text-rose-300">
                Monthly AI Planning Credits Depleted ({usage.aiCreditsUsed} / {usage.aiCreditsQuota})
              </h3>
              <p className="text-[11px] text-rose-600/90 dark:text-rose-400/90 leading-relaxed">
                You have reached your 30 AI assistant credits limit for this month. AI itinerary suggestions and proposals
                are paused until your quota renews on the 1st of next month ({daysUntilRenewal} days remaining).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Real-Time Quota Meters Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Metric 1: AI Message Credits (Primary Highlight) */}
        <Card className="border-border bg-card shadow-xs rounded-sm">
          <CardHeader className="p-4 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary shrink-0">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">AI Assistant Credits</CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground">
                    Monthly Gemini AI interaction quota
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-1.5 self-start sm:self-auto">
                {isCreditsExhausted ? (
                  <Badge variant="destructive" className="text-[10px] font-bold px-2 py-0.5 rounded-xs">
                    Limit Reached
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                    Active
                  </Badge>
                )}
                <span className="text-xs font-mono font-bold text-foreground bg-muted px-2.5 py-1 rounded-xs border border-border">
                  {usage.aiCreditsUsed} / {usage.aiCreditsQuota}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-xs bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCreditsExhausted
                      ? "bg-rose-600"
                      : aiPct > 75
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                  style={{ width: `${aiPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-muted-foreground font-medium">
                <span className={isCreditsExhausted ? "font-bold text-rose-600 dark:text-rose-400" : "font-semibold text-foreground"}>
                  {usage.aiCreditsRemaining} credits left this month
                </span>
                <span className="font-mono">{aiPct}% utilized</span>
              </div>
            </div>

            <div className="rounded-xs bg-muted/40 p-3 text-xs text-muted-foreground border border-border/60">
              <span className="text-[11px] leading-relaxed">
                {isPro
                  ? "Pro tier: 150 AI credits/month with priority Gemini models."
                  : "Free Explorer: 30 AI assistant credits per month limit. Resets on 1st of next month."}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Workspace Trip Slots */}
        <Card className="border-border bg-card shadow-xs rounded-sm">
          <CardHeader className="p-4 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary shrink-0">
                  <Compass className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">Workspace Trips</CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground">
                    Active & planned trips capacity
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-1.5 self-start sm:self-auto">
                <Badge variant="outline" className="text-[10px] font-medium border-border">
                  {usage.tripsRemaining} Slots Free
                </Badge>
                <span className="text-xs font-mono font-bold text-foreground bg-muted px-2.5 py-1 rounded-xs border border-border">
                  {usage.tripsUsed} / {usage.tripsQuota}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-xs bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${tripsPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-muted-foreground font-medium">
                <span>{usage.tripsRemaining} workspace slots remaining</span>
                <span className="font-mono">{tripsPct}% capacity</span>
              </div>
            </div>

            <div className="rounded-xs bg-muted/40 p-3 text-xs text-muted-foreground flex items-center justify-between border border-border/60">
              <span className="text-[11px]">Manage active & planned travel workspaces</span>
              <Link href="/trips" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1">
                View My Trips <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Goal-Oriented Usage Chart: Trips Created vs AI Credits ── */}
      <UsageChart
        history={usage.monthlyHistory}
        quota={usage.aiCreditsQuota}
        tierName={usage.tierName}
      />

      {/* ── Per-Trip AI Credit Consumption Breakdown ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-semibold text-foreground">
              Trip-by-Trip AI Usage Breakdown
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {usage.tripUsage?.length || 0} workspaces evaluated
          </span>
        </div>

        {usage.tripUsage && usage.tripUsage.length > 0 ? (
          <div className="rounded-sm border border-border bg-card shadow-xs divide-y divide-border/60 overflow-hidden">
            {usage.tripUsage.map((trip) => (
              <div
                key={trip.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-muted/30 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs bg-primary/10 text-primary border border-primary/20 font-bold text-xs">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {trip.title}
                      </span>
                      {trip.destination && (
                        <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded-xs border border-border/80">
                          {trip.destination}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      Created on {trip.createdAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 sm:justify-end">
                  {/* Credits Consumed Indicator */}
                  <div className="text-right space-y-1 min-w-[120px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <Sparkles className="h-3 w-3 text-primary shrink-0" />
                      <span className="text-xs font-mono font-bold text-foreground">
                        {trip.creditsUsed} credits
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-xs overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${trip.percentageOfQuota}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground block font-medium">
                      {trip.percentageOfQuota}% of monthly quota
                    </span>
                  </div>

                  <Link href={`/trips/${trip.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 text-xs rounded-xs gap-1 cursor-pointer">
                      <span>Open</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-dashed border-border p-8 text-center bg-card/50 space-y-2">
            <Compass className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-xs font-semibold text-foreground">No trips created yet</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Create your first travel workspace to start planning itineraries with the AI assistant.
            </p>
            <Link href="/trips">
              <Button size="sm" className="mt-2 text-xs rounded-xs h-8">
                Create a Trip
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* ── Monthly Activity History Log ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <History className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-semibold text-foreground">
              Billing & Quota Cycles History
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Past 6 calendar cycles
          </span>
        </div>

        <div className="rounded-sm border border-border bg-card shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-3 pl-4">Billing Cycle</th>
                <th className="p-3">Plan Tier</th>
                <th className="p-3 text-center">Trips Created</th>
                <th className="p-3 text-center">AI Credits Used</th>
                <th className="p-3 text-center">Remaining</th>
                <th className="p-3 pr-4 text-right">Cycle Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {usage.monthlyHistory.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 pl-4 font-medium text-foreground">
                    <div>
                      <span>{item.month}</span>
                      <span className="text-[10px] text-muted-foreground block font-normal">
                        {item.period}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] font-normal border-border">
                      {item.plan}
                    </Badge>
                  </td>
                  <td className="p-3 text-center font-mono font-medium text-foreground">
                    {item.tripsCreated}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-foreground">
                    {item.aiCreditsUsed} <span className="text-muted-foreground font-normal text-[10px]">/ {item.aiCreditsQuota}</span>
                  </td>
                  <td className="p-3 text-center font-mono text-muted-foreground">
                    {item.aiCreditsRemaining}
                  </td>
                  <td className="p-3 pr-4 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-semibold border ${
                        item.status === "Active Cycle"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Billing Cycle & Subscription Quick Link ── */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Active Cycle</span>
                <span className="font-semibold text-foreground">{usage.billingCycleStart} – {usage.billingCycleEnd}</span>
              </div>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Quota Renewal</span>
                <span className="font-semibold text-foreground">1st of next month ({daysUntilRenewal} days)</span>
              </div>
            </div>
          </div>

          <Link href="/subscription">
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-sm gap-1.5 cursor-pointer">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              View Subscription & Plans
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </Card>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
