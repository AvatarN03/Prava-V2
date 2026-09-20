"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PRICING_PLANS } from "../pricing-config";
import { getUserPricingCurrency, ConvertedPricingDTO } from "../actions";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

// Client-side session cache to prevent repeated API calls
let globalPricingCache: ConvertedPricingDTO | null = null;

export function UpgradeDialog({
  open,
  onOpenChange,
  title = "Unlock 25 Workspace Trips & 150 AI Credits",
  description = "Upgrade to Pro Wanderer for expanded 25-trip workspace, 150 monthly AI assistant credits, and creator perks.",
}: UpgradeDialogProps) {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [pricing, setPricing] = useState<ConvertedPricingDTO | null>(globalPricingCache);

  useEffect(() => {
    if (!open) return;
    if (globalPricingCache) {
      setPricing(globalPricingCache);
      return;
    }

    getUserPricingCurrency().then((res) => {
      globalPricingCache = res;
      setPricing(res);
    });
  }, [open]);

  const handleProceedToSubscription = () => {
    onOpenChange(false);
    router.push("/pricing");
  };

  // Pricing values - emphasizing lower monthly rate ($8.25 / ₹690) for annual billing
  const monthlyRateDisplay = pricing
    ? `${pricing.formattedMonthly}`
    : "$12";

  const annualMonthlyEquivalentDisplay = pricing
    ? `${pricing.formattedAnnualMonthly}`
    : "$8.25";

  const annualTotalDisplay = pricing
    ? `${pricing.formattedAnnual}`
    : "$99";

  const isAnnual = billingCycle === "annual";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-border bg-card rounded-md shadow-xl gap-0">
        {/* Sleek Top Header */}
        <div className="bg-muted/30 border-b border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" />
              <span>Pro Wanderer</span>
            </div>

            {pricing && (
              <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border bg-card px-2 py-0.5">
                {pricing.currencyCode} Pricing
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </DialogDescription>
          </div>

          {/* Stable Segmented Billing Switcher (No layout shift or glitch) */}
          <div className="pt-1">
            <div className="grid grid-cols-2 p-1 bg-muted rounded-xs border border-border text-xs select-none">
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`py-1.5 px-2 rounded-xs font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
                  isAnnual
                    ? "bg-card text-foreground shadow-2xs border-border/80"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Yearly</span>
                <span className="text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded-xs">
                  Save 31%
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`py-1.5 px-2 rounded-xs font-semibold text-xs transition-colors flex items-center justify-center cursor-pointer border ${
                  !isAnnual
                    ? "bg-card text-foreground shadow-2xs border-border/80"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Monthly</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Highlight Row (Emphasizes lower monthly equivalent) */}
        <div className="px-5 py-4 border-b border-border/60 bg-muted/15 flex items-baseline justify-between min-h-[72px]">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-foreground tracking-tight">
                {isAnnual ? annualMonthlyEquivalentDisplay : monthlyRateDisplay}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                / month
              </span>
              {isAnnual && (
                <Badge variant="secondary" className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-xs ml-1">
                  Billed Annually
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isAnnual
                ? `Total ${annualTotalDisplay} / year ($99 USD) • Renews annually`
                : `Total ${monthlyRateDisplay} / month ($12 USD) • Flexible cancellation`}
            </p>
          </div>

          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-xs border border-border shrink-0">
            {isAnnual ? "$8.25 USD/mo" : "$12 USD/mo"}
          </span>
        </div>

        {/* Feature List */}
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              What you unlock with Pro:
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-xs text-foreground/90">
              <div className="flex items-start gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 border border-emerald-500/20">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span>
                  <strong>25 Workspace Trips</strong> (expanded from 10 on Free Explorer)
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 border border-emerald-500/20">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span>
                  <strong>150 AI Assistant Credits / Month</strong> (5x quota for itinerary generation)
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 border border-emerald-500/20">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span>
                  <strong>Structured Itinerary Proposals</strong> with 1-click workspace apply
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 border border-emerald-500/20">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span>
                  <strong>Verified Creator Privileges</strong> & custom travel story covers
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Button: Routes directly to subscription page */}
          <div className="pt-0.5 flex flex-col gap-2.5">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 rounded-xs gap-1.5 shadow-xs cursor-pointer"
              onClick={handleProceedToSubscription}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>
                Proceed to Subscription —{" "}
                {isAnnual
                  ? `${annualMonthlyEquivalentDisplay}/mo (${annualTotalDisplay}/yr)`
                  : `${monthlyRateDisplay}/mo`}
              </span>
            </Button>

            <div className="flex items-center justify-center text-[11px] text-muted-foreground pt-0.5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Cancel anytime • Billed securely via Stripe
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
