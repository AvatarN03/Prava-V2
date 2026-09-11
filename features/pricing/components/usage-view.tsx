"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  Zap,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  BookOpen,
  Receipt,
  CheckCircle2,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccountUsageData } from "../actions";
import { UpgradeDialog } from "./upgrade-dialog";

interface UsageViewProps {
  initialUsage: AccountUsageData;
}

export function UsageView({ initialUsage }: UsageViewProps) {
  const [usage] = useState<AccountUsageData>(initialUsage);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const isPro = usage.tier === "pro";
  const tripsPct = Math.min(100, Math.round((usage.tripsUsed / usage.tripsQuota) * 100));
  const aiPct = Math.min(100, Math.round((usage.aiCreditsUsed / usage.aiCreditsQuota) * 100));

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
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time tracking of your Gemini AI assistant credits, workspace trip capacity, and monthly usage metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isPro ? (
            <Button
              onClick={() => setUpgradeOpen(true)}
              className="bg-primary text-primary-foreground font-semibold text-xs h-8 px-3.5 rounded-sm shadow-xs gap-1.5 cursor-pointer hover:bg-primary/90"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              Get More AI Credits (Pro)
            </Button>
          ) : (
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-semibold dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              Pro Wanderer Active
            </Badge>
          )}
        </div>
      </div>

      {/* ── Real-Time Usage Meters Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Metric 1: AI Message Credits (Primary Highlight) */}
        <Card className="border-border bg-card shadow-xs rounded-sm">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">AI Assistant Credits</CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground">
                    Monthly Gemini AI interaction quota
                  </CardDescription>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-foreground bg-muted px-2.5 py-1 rounded-xs border border-border">
                {usage.aiCreditsUsed} / {usage.aiCreditsQuota}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-xs bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    aiPct > 85 ? "bg-destructive" : aiPct > 60 ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${aiPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-muted-foreground font-medium">
                <span className="font-semibold text-foreground">{usage.aiCreditsRemaining} credits left</span>
                <span>{aiPct}% utilized</span>
              </div>
            </div>

            <div className="rounded-xs bg-muted/50 p-3 text-xs text-muted-foreground flex items-center justify-between border border-border/60">
              <span className="text-[11px]">
                {isPro ? "150 AI credits per month on Pro" : "30 AI credits per month on Free plan"}
              </span>
              {!isPro && (
                <button
                  type="button"
                  onClick={() => setUpgradeOpen(true)}
                  className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Upgrade to 150 <Zap className="h-3 w-3 text-amber-500" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Workspace Trip Slots */}
        <Card className="border-border bg-card shadow-xs rounded-sm">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary">
                  <Compass className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">Workspace Trips</CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground">
                    Active & planned trips capacity
                  </CardDescription>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-foreground bg-muted px-2.5 py-1 rounded-xs border border-border">
                {usage.tripsUsed} / {usage.tripsQuota}
              </span>
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
                <span>{usage.tripsRemaining} slots remaining</span>
                <span>{tripsPct}% capacity</span>
              </div>
            </div>

            <div className="rounded-xs bg-muted/50 p-3 text-xs text-muted-foreground flex items-center justify-between border border-border/60">
              <span className="text-[11px]">Manage active & planned travel workspaces</span>
              <Link href="/trips" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1">
                View My Trips <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Summary Statistics Grid ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Monthly Activity Summary ({usage.currentMonthName})
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-sm border border-border bg-card p-3.5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Trips in Workspace
            </span>
            <div className="text-lg font-bold text-foreground">
              {usage.tripsUsed} <span className="text-xs font-normal text-muted-foreground">/ {usage.tripsQuota}</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
              {usage.tripsRemaining} slots free
            </span>
          </div>

          <div className="rounded-sm border border-border bg-card p-3.5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              AI Messages Sent
            </span>
            <div className="text-lg font-bold text-foreground">
              {usage.aiCreditsUsed} <span className="text-xs font-normal text-muted-foreground">/ {usage.aiCreditsQuota}</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
              {usage.aiCreditsRemaining} credits left
            </span>
          </div>

          <div className="rounded-sm border border-border bg-card p-3.5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Stories Published
            </span>
            <div className="text-lg font-bold text-foreground">
              {usage.storiesCount}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Community blog posts
            </span>
          </div>

          <div className="rounded-sm border border-border bg-card p-3.5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Expenses Logged
            </span>
            <div className="text-lg font-bold text-foreground">
              {usage.totalExpensesLogged}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Budget line items
            </span>
          </div>
        </div>
      </div>

      {/* ── Billing Cycle & Subscription Quick Link ── */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Cycle Window</span>
                <span className="font-semibold text-foreground">{usage.billingCycleStart} – {usage.billingCycleEnd}</span>
              </div>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Quota Renewal</span>
                <span className="font-semibold text-foreground">1st of next month</span>
              </div>
            </div>
          </div>

          <Link href="/pricing">
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
