"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Compass,
  Check,
  X,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AccountUsageData } from "../actions";
import { PRICING_PLANS, PRICING_FAQS } from "../pricing-config";
import { UpgradeDialog } from "./upgrade-dialog";

interface AccountUsageViewProps {
  initialUsage: AccountUsageData;
}

export function AccountUsageView({ initialUsage }: AccountUsageViewProps) {
  const [usage] = useState<AccountUsageData>(initialUsage);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const isPro = usage.tier === "pro";

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-[#2D9BF0] dark:bg-sky-950 dark:text-sky-400">
              <CreditCard className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Subscription & Plans
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your workspace subscription tier, compare available plan features, and upgrade.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isPro ? (
            <Button
              onClick={() => setUpgradeOpen(true)}
              className="bg-primary text-primary-foreground font-semibold text-xs h-8 px-3.5 rounded-sm shadow-xs gap-1.5 cursor-pointer hover:bg-primary/90"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              Upgrade to Pro ($12/mo)
            </Button>
          ) : (
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-semibold dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              Pro Wanderer Active
            </Badge>
          )}
        </div>
      </div>

      {/* ── Current Active Tier Summary Card ── */}
      <div className="relative rounded-sm overflow-hidden border border-border bg-gradient-to-br from-primary/5 via-card to-primary/10 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-xs px-2 py-0.5">
                Current Active Tier
              </span>
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
            <h2 className="text-lg font-bold text-foreground">
              {isPro ? "Pro Wanderer Membership" : "Free Explorer Membership"}
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              {isPro
                ? "You have access to 25 workspace trips, 150 monthly AI assistant credits, rich story covers, and verified creator privileges."
                : "You are currently on the Free Explorer tier with 10 trip workspace slots and 30 AI assistant credits per month."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/usage">
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-sm gap-1.5 cursor-pointer">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                View AI & Quota Usage
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Plan Comparison Grid: What features you can use ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">
          Available Plans & Feature Privileges
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRICING_PLANS.map((plan) => {
            const isCurrent = (plan.id === "pro" && isPro) || (plan.id === "free" && !isPro);

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-sm border transition-all ${
                  plan.popular
                    ? "border-primary/50 shadow-sm bg-gradient-to-b from-primary/5 via-card to-card"
                    : "border-border bg-card shadow-xs"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 right-4 rounded-xs bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
                    {plan.badge || "Recommended"}
                  </div>
                )}

                <div>
                  <CardHeader className="p-5 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-bold text-foreground">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {plan.tagline}
                      </CardDescription>
                    </div>

                    <div className="pt-3 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-foreground">
                        ${plan.monthlyPrice}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        / month
                      </span>
                      {plan.annualPrice > 0 && (
                        <span className="ml-2 text-[11px] text-muted-foreground">
                          (or ${plan.annualPrice}/yr)
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    <Separator />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Included Features
                    </p>
                    <ul className="space-y-2 text-xs">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-foreground/90">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>

                <CardFooter className="p-5 pt-3 border-t border-border/60">
                  {isCurrent ? (
                    <Button
                      variant="outline"
                      disabled
                      className="w-full h-8 text-xs rounded-sm font-semibold cursor-default opacity-80"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                      Active Plan
                    </Button>
                  ) : plan.id === "pro" ? (
                    <Button
                      onClick={() => setUpgradeOpen(true)}
                      className="w-full h-8 text-xs rounded-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer gap-1.5"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                      Upgrade to Pro
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled
                      className="w-full h-8 text-xs rounded-sm font-medium opacity-60"
                    >
                      Included with Account
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Subscription Details & Billing Navigation at the bottom ── */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Subscription Details & Terms
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-sm border border-border bg-card p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-foreground">Billing Cycle & Renewal</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Active Cycle Window</span>
                <span className="font-semibold text-foreground">{usage.billingCycleStart} – {usage.billingCycleEnd}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Next Quota Renewal</span>
                <span className="font-semibold text-foreground">1st of next month</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Payment Method</span>
                <span className="text-foreground">None required for Free tier</span>
              </div>
            </div>
          </Card>

          <Card className="rounded-sm border border-border bg-card p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-foreground">Quick Navigation</h3>
            <div className="space-y-2">
              <Link
                href="/usage"
                className="flex items-center justify-between p-2 rounded-xs border border-border bg-muted/40 hover:bg-muted text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-foreground">Check AI Credit & Trip Quota Usage</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/profile"
                className="flex items-center justify-between p-2 rounded-xs border border-border bg-muted/40 hover:bg-muted text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-foreground">Account & General Preferences</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Frequently Asked Questions ── */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          Subscription FAQ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRICING_FAQS.map((faq, i) => (
            <div key={i} className="rounded-sm border border-border bg-card p-4 space-y-1.5 shadow-xs">
              <p className="text-xs font-semibold text-foreground">{faq.question}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
