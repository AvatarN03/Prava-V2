"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  ExternalLink,
  History,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { CreateTripDialog } from "@/features/trips/components/create-trip-dialog";

import { UpgradeDialog } from "./upgrade-dialog";
import { UsageChart } from "./usage-chart";

import type { AccountUsageData } from "../actions";

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
    <div className="space-y-8 w-full pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <span className="font-sans text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase block">
            Workspace Metrics
          </span>
          <div className="flex items-center gap-2.5">
            <h1 className="font-sans text-2xl sm:text-3xl font-light tracking-tight text-foreground">
              Quota & <span className="font-serif italic font-normal text-foreground">Usage Analytics</span>
            </h1>
            <Badge
              variant="secondary"
              className={`font-sans text-xs font-semibold rounded-xs px-2 py-0.5 ${
                isPro
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  : "bg-muted text-foreground border-border/80"
              }`}
            >
              {usage.tierName}
            </Badge>
          </div>
          <p className="font-sans text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Real-time tracking of your AI assistant credits, workspace trip capacity, and per-trip consumption.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isPro ? (
            <Button
              onClick={() => setUpgradeOpen(true)}
              className="bg-[#2D9BF0] hover:bg-[#2587D3] text-white font-sans text-xs font-semibold h-8 px-3.5 rounded-sm shadow-xs gap-1.5 cursor-pointer active:scale-[0.99] transition-all"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              Upgrade to Pro (150 Credits)
            </Button>
          ) : (
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-sans text-xs px-3 py-1 font-semibold rounded-xs shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              Pro Wanderer Active
            </Badge>
          )}
        </div>
      </div>

      {/* ── Quota Exhaustion Alert Banner ── */}
      {isCreditsExhausted && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-rose-500/20 text-rose-600 dark:text-rose-400 mt-0.5">
              <AlertCircle className="h-4 w-4" />
            </span>
            <div className="space-y-0.5">
              <h3 className="font-sans text-xs font-bold text-rose-700 dark:text-rose-300">
                Monthly AI Planning Credits Depleted ({usage.aiCreditsUsed} / {usage.aiCreditsQuota})
              </h3>
              <p className="font-sans text-xs text-rose-600/90 dark:text-rose-400/90 leading-relaxed tabular-nums">
                You have reached your {usage.aiCreditsQuota} AI assistant credits limit for this month. AI itinerary suggestions and proposals
                are paused until your quota renews on the 1st of next month ({daysUntilRenewal} days remaining).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Real-Time Quota Meters Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Metric 1: AI Message Credits (Primary Highlight) */}
        <Card className="border-border/80 bg-card shadow-xs rounded-md">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary shrink-0">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="font-sans text-sm sm:text-base font-semibold text-foreground">
                    AI Assistant Credits
                  </CardTitle>
                  <CardDescription className="font-sans text-[11px] text-muted-foreground">
                    Monthly AI interaction quota
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-row items-center sm:items-center gap-2 sm:gap-1.5 self-start sm:self-auto">
                {isCreditsExhausted ? (
                  <Badge variant="destructive" className="font-sans text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-xs">
                    Limit Reached
                  </Badge>
                ) : (
                  <Badge variant="outline" className="font-sans text-[10px] font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xs">
                    Active
                  </Badge>
                )}
                <span className="font-sans text-xs font-semibold tabular-nums text-foreground bg-muted/60 px-2.5 py-1 rounded-xs border border-border/80">
                  {usage.aiCreditsUsed} / {usage.aiCreditsQuota}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 pt-0 space-y-3 font-sans">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-xs bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCreditsExhausted
                      ? "bg-rose-600"
                      : aiPct > 75
                        ? "bg-amber-500"
                        : "bg-[#2D9BF0]"
                  }`}
                  style={{ width: `${aiPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-muted-foreground font-medium">
                <span className={isCreditsExhausted ? "font-semibold text-rose-600 dark:text-rose-400 tabular-nums" : "font-semibold text-foreground tabular-nums"}>
                  {usage.aiCreditsRemaining} credits left this month
                </span>
                <span className="font-sans font-medium tabular-nums">{aiPct}% utilized</span>
              </div>
            </div>

            <div className="rounded-xs bg-muted/30 p-3 text-xs text-muted-foreground border border-border/60">
              <span className="text-[11px] leading-relaxed">
                {isPro
                  ? "Pro tier: 150 AI credits/month. "
                  : "Free Explorer: 30 AI credits/month. "}
                {usage.nextRenewalDate
                  ? `Renews on ${usage.nextRenewalDate}.`
                  : "Resets monthly on cycle renewal."}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Workspace Trip Slots */}
        <Card className="border-border/80 bg-card shadow-xs rounded-md">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary shrink-0">
                  <Compass className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="font-sans text-sm sm:text-base font-semibold text-foreground">
                    Workspace Trips
                  </CardTitle>
                  <CardDescription className="font-sans text-[11px] text-muted-foreground">
                    Active & planned trips capacity
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-row items-center sm:items-center gap-2 sm:gap-1.5 self-start sm:self-auto">
                <Badge variant="outline" className="font-sans text-[10px] font-semibold border-border/80 rounded-xs">
                  {usage.tripsRemaining} Slots Free
                </Badge>
                <span className="font-sans text-xs font-semibold tabular-nums text-foreground bg-muted/60 px-2.5 py-1 rounded-xs border border-border/80">
                  {usage.tripsUsed} / {usage.tripsQuota}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 pt-0 space-y-3 font-sans">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-xs bg-muted overflow-hidden">
                <div
                  className="h-full bg-[#2D9BF0] transition-all duration-300"
                  style={{ width: `${tripsPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-muted-foreground font-medium">
                <span className="tabular-nums">{usage.tripsRemaining} workspace slots remaining</span>
                <span className="font-sans font-medium tabular-nums">{tripsPct}% capacity</span>
              </div>
            </div>

            <div className="rounded-xs bg-muted/30 p-3 text-xs text-muted-foreground flex items-center justify-between border border-border/60">
              <span className="text-[11px]">Manage active & planned travel workspaces</span>
              <Link href="/trips" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 whitespace-nowrap">
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
            <h2 className="font-sans text-sm sm:text-base font-semibold tracking-tight text-foreground">
              Trip-by-Trip AI Usage Breakdown
            </h2>
          </div>
          <span className="font-sans text-xs text-muted-foreground tabular-nums">
            {usage.tripUsage?.length || 0} workspaces evaluated
          </span>
        </div>

        {usage.tripUsage && usage.tripUsage.length > 0 ? (
          <div className="rounded-md border border-border/80 bg-card shadow-xs divide-y divide-border/60 overflow-hidden font-sans">
            {usage.tripUsage.map((trip) => (
              <div
                key={trip.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-muted/30 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs bg-primary/10 text-primary border border-primary/20 font-bold text-xs">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 sm:flex-initial">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        {trip.title}
                      </span>
                      {trip.destination && (
                        <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded-xs border border-border/80">
                          {trip.destination}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground block mt-0.5 tabular-nums">
                      Created on {trip.createdAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-0">
                  {/* Credits Consumed Indicator */}
                  <div className="flex-1 sm:flex-initial sm:text-right space-y-1 min-w-0 sm:min-w-[140px]">
                    <div className="flex items-center justify-between sm:justify-end gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-xs font-semibold tabular-nums text-foreground">
                          {trip.creditsUsed} credits
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium sm:hidden tabular-nums">
                        {trip.percentageOfQuota}% of quota
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-xs overflow-hidden">
                      <div
                        className="h-full bg-[#2D9BF0]"
                        style={{ width: `${trip.percentageOfQuota}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground hidden sm:block font-medium tabular-nums">
                      {trip.percentageOfQuota}% of monthly quota
                    </span>
                  </div>

                  <Link href={`/trips/${trip.id}`} className="shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 text-xs rounded-xs font-medium gap-1 cursor-pointer">
                      <span>Open</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border/80 p-8 text-center bg-card/50 space-y-2 font-sans">
            <Compass className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-xs sm:text-sm font-semibold text-foreground">No trips created yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Create your first travel workspace to start planning itineraries with the AI assistant.
            </p>
            <div className="pt-2">
              <CreateTripDialog />
            </div>
          </div>
        )}
      </div>

      {/* ── Monthly Activity History Log ── */}
      <div className="space-y-3 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <History className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
              Billing & Quota Cycles History
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Past 6 calendar cycles
          </span>
        </div>

        <div className="rounded-md border border-border/80 bg-card shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="p-3 pl-4">Billing Cycle</th>
                <th className="p-3 text-center">AI Credits</th>
                <th className="p-3 pr-4 text-right">Cycle Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {usage.monthlyHistory.map((item) => {
                const creditsPct = Math.min(
                  100,
                  Math.round((item.aiCreditsUsed / item.aiCreditsQuota) * 100)
                );
                const isProCycle = item.plan.toLowerCase().includes("pro");
                return (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 pl-4 font-medium text-foreground">
                      <div className="space-y-1">
                        <div>
                          <span className="font-semibold text-foreground">{item.month}</span>
                          <span className="text-[10px] text-muted-foreground block font-normal tabular-nums">
                            {item.period}
                          </span>
                        </div>
                        <div>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 h-4 rounded-xs border-border/80 ${
                              isProCycle
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 font-semibold"
                                : "text-muted-foreground font-normal"
                            }`}
                          >
                            {item.plan}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="font-semibold tabular-nums text-foreground text-xs">
                          {item.aiCreditsUsed}{" "}
                          <span className="text-muted-foreground font-normal text-[11px]">
                            / {item.aiCreditsQuota} Credits
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5 w-24">
                          <div className="h-1.5 w-full rounded-xs bg-muted overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                creditsPct >= 100
                                  ? "bg-rose-600"
                                  : creditsPct > 75
                                    ? "bg-amber-500"
                                    : "bg-[#2D9BF0]"
                              }`}
                              style={{ width: `${creditsPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                            {creditsPct}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-semibold uppercase tracking-wider border ${
                          item.status === "Active Cycle"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted text-muted-foreground border-border/80"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Billing Cycle & Subscription Quick Link ── */}
      <Card className="rounded-md border border-border/80 bg-card shadow-xs font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">Active Cycle</span>
                <span className="font-semibold tabular-nums text-foreground">{usage.billingCycleStart} – {usage.billingCycleEnd}</span>
              </div>
            </div>
            <div className="h-6 w-px bg-border/80 hidden sm:block" />
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block">Quota Renewal</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {usage.nextRenewalDate || "Next billing cycle"} ({usage.daysUntilRenewal ?? daysUntilRenewal} days)
                </span>
              </div>
            </div>
          </div>

          <Link href="/subscription">
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-sm font-medium gap-1.5 cursor-pointer border-border/80 hover:bg-muted/70 shadow-2xs">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              <span>View Subscription & Plans</span>
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </Card>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}

