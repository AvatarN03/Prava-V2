"use client";

import Link from "next/link";
import { ProfileWithStats } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Compass, Sparkles, CreditCard, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface AiUsageSectionProps {
  profile: ProfileWithStats;
}

export function AiUsageSection({ profile }: AiUsageSectionProps) {
  const isPro = profile.tier === "pro";
  const tripsPct = Math.min(100, Math.round((profile.totalTrips / profile.tripsQuota) * 100));
  const aiPct = Math.min(100, Math.round((profile.aiCreditsUsed / profile.aiCreditsQuota) * 100));

  return (
    <div className="flex flex-col space-y-4 w-full max-w-3xl">
      {/* 1. Subscription Tier Status Banner */}
      <Card className="rounded-sm border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-xs px-2 py-0.5">
                Current Plan
              </span>
              <span className="text-sm font-semibold text-foreground">
                {isPro ? "Pro Wanderer" : "Free Explorer"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isPro
                ? "25 trip slots and 150 AI assistant interactions every calendar month."
                : "10 trip slots and 30 AI assistant message credits per month."}
            </p>
          </div>

          <Link href="/pricing">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs rounded-sm gap-1.5 cursor-pointer shrink-0 border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              Manage Billing & Quotas
              <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* 2. Workspace Trips Quota (Full-Width Flex Column) */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary">
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">Workspace Trips Quota</h3>
                <p className="text-[11px] text-muted-foreground">Total active and archived travel workspaces</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-foreground">
                {profile.totalTrips}{" "}
                <span className="text-muted-foreground font-normal text-[11px]">/ {profile.tripsQuota} trips</span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2.5 text-xs">
          <div className="h-2 w-full rounded-xs bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${tripsPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              {profile.tripsRemaining} {profile.tripsRemaining === 1 ? "slot" : "slots"} remaining
            </span>
            <span className="font-mono text-muted-foreground">{tripsPct}% capacity</span>
          </div>
        </CardContent>
      </Card>

      {/* 3. AI Assistant Monthly Credits (Full-Width Flex Column) */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">AI Assistant Monthly Credits</h3>
                <p className="text-[11px] text-muted-foreground">Itinerary planning, activity suggestions, and chat prompts</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-foreground">
                {profile.aiCreditsUsed}{" "}
                <span className="text-muted-foreground font-normal text-[11px]">/ {profile.aiCreditsQuota} credits</span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2.5 text-xs">
          <div className="h-2 w-full rounded-xs bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${aiPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              {profile.aiCreditsRemaining} {profile.aiCreditsRemaining === 1 ? "credit" : "credits"} left this month
            </span>
            <Link
              href="/usage"
              className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
            >
              View Detailed AI Usage &rarr;
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


