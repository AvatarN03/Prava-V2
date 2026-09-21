"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  CreditCard,
  ExternalLink,
  Globe,
  HelpCircle,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import {
  createPolarCheckoutSession,
  createPolarCustomerPortalSession,
  getUserPricingCurrency,
  simulatePolarUpgrade,
} from "../actions";
import { SUPPORTED_CURRENCIES } from "@/features/travel-essentials/currency/currency-service";

import type { AccountUsageData, ConvertedPricingDTO } from "../actions";
import { PRICING_FAQS, PRICING_PLANS } from "../pricing-config";

interface AccountUsageViewProps {
  initialUsage: AccountUsageData;
  initialPricing?: ConvertedPricingDTO;
}

export function AccountUsageView({ initialUsage, initialPricing }: AccountUsageViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams?.get("checkout") === "success";

  const [usage, setUsage] = useState<AccountUsageData>(initialUsage);
  const [pricing, setPricing] = useState<ConvertedPricingDTO | null>(initialPricing || null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [isPending, startTransition] = useTransition();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState("");

  const isPro = usage.tier === "pro";
  const isAnnual = billingCycle === "annual";

  useEffect(() => {
    if (!pricing) {
      getUserPricingCurrency().then((res) => {
        setPricing(res);
      });
    }
  }, [pricing]);

  const handleCurrencyChange = (currencyCode: string) => {
    startTransition(async () => {
      try {
        const res = await getUserPricingCurrency(currencyCode);
        setPricing(res);
        toast.info(`Pricing updated to ${res.currencyCode} (${res.currencySymbol})`);
      } catch {
        toast.error("Failed to load currency rates");
      }
    });
  };

  const handleStartPolarCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await createPolarCheckoutSession({
        billingCycle,
        redirectUrl: typeof window !== "undefined" ? window.location.href : undefined,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to initiate Polar checkout");
        setIsCheckingOut(false);
        return;
      }

      if (res.checkoutUrl) {
        toast.info("Redirecting to Polar Checkout...");
        window.location.href = res.checkoutUrl;
      } else if (res.isSimulation) {
        setSimulationMessage(res.message || "");
        setSimulationModalOpen(true);
        setIsCheckingOut(false);
      }
    } catch {
      toast.error("An unexpected error occurred contacting Polar.");
      setIsCheckingOut(false);
    }
  };

  const handleOpenCustomerPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const res = await createPolarCustomerPortalSession();
      if (res.success && res.portalUrl) {
        toast.info("Redirecting to Polar Customer Portal...");
        window.location.href = res.portalUrl;
      } else {
        toast.error(res.error || "Failed to open customer billing portal.");
        setIsOpeningPortal(false);
      }
    } catch {
      toast.error("An unexpected error occurred contacting Polar.");
      setIsOpeningPortal(false);
    }
  };


  const handleConfirmSimulationUpgrade = async () => {
    setIsCheckingOut(true);
    try {
      const res = await simulatePolarUpgrade({ billingCycle });
      if (res.success) {
        toast.success("Pro Wanderer tier activated successfully!");
        setSimulationModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to activate Pro tier");
      }
    } catch {
      toast.error("Upgrade error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const proMonthlyDisplay = pricing ? pricing.formattedMonthly : "₹200";
  const proAnnualMonthlyDisplay = pricing ? pricing.formattedAnnualMonthly : "₹167";
  const proAnnualTotalDisplay = pricing ? pricing.formattedAnnual : "₹2,000";
  const savingsDisplay = pricing?.savingsAmount || "₹400";
  const currencySymbol = pricing ? pricing.currencySymbol : "₹";
  const activeCurrencyCode = pricing ? pricing.currencyCode : "INR";

  return (
    <div className="space-y-8 w-full pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Subscription & Plans
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your workspace membership tier, compare plan privileges, and upgrade via Polar Checkout.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Currency Preference Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-sm gap-1.5 font-mono border-border bg-card hover:bg-muted cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span>{activeCurrencyCode} ({currencySymbol})</span>
                <span className="text-[10px] text-muted-foreground ml-0.5">▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-64 overflow-y-auto">
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Select Pricing Currency
              </div>
              {SUPPORTED_CURRENCIES.map((c) => (
                <DropdownMenuItem
                  key={c.code}
                  onClick={() => handleCurrencyChange(c.code)}
                  className={`text-xs cursor-pointer flex items-center justify-between ${
                    c.code === activeCurrencyCode ? "font-bold text-primary bg-primary/5" : ""
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="font-mono text-muted-foreground">{c.symbol} {c.code}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!isPro ? (
            <Button
              onClick={handleStartPolarCheckout}
              disabled={isCheckingOut}
              className="bg-primary text-primary-foreground font-semibold text-xs h-8 px-3.5 rounded-sm shadow-xs gap-1.5 cursor-pointer hover:bg-primary/90"
            >
              {isCheckingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              )}
              Upgrade with Polar ({isAnnual ? `${proAnnualMonthlyDisplay}/mo` : `${proMonthlyDisplay}/mo`})
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-2.5 py-1 font-semibold dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                Pro Active
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenCustomerPortal}
                disabled={isOpeningPortal}
                className="h-8 text-xs rounded-sm font-semibold border-border gap-1.5 cursor-pointer hover:bg-muted"
                title="Manage billing and payment methods on Polar"
              >
                {isOpeningPortal ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5 text-primary" />
                )}
                Manage Subscription
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Checkout Confirmation Banner ── */}
      {checkoutSuccess && (
        <div className="rounded-sm border border-sky-200 bg-sky-50/80 dark:border-sky-900/50 dark:bg-sky-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sky-900 dark:text-sky-100">
                Polar Checkout Completed
              </p>
              <p className="text-sky-700 dark:text-sky-300/80 mt-0.5 leading-relaxed">
                Your payment was received. As soon as the Polar webhook confirms processing, your workspace will reflect Pro privileges.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.refresh();
              toast.info("Checking subscription state...");
            }}
            className="h-7 text-xs bg-background border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-200 shrink-0 cursor-pointer gap-1.5"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh Status
          </Button>
        </div>
      )}

      {/* ── Current Active Tier Summary Card ── */}
      <div className="relative rounded-sm overflow-hidden border border-border bg-card p-5 shadow-xs">
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
                ? "You have access to 25 workspace trips, 150 monthly AI assistant credits, structured itinerary proposals, rich travel story covers, and verified creator privileges."
                : "You are currently on the Free Explorer tier with 10 trip workspace slots and 30 AI assistant credits per month."}
            </p>

            {/* Quota metric chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-muted border border-border text-[11px]">
                <Compass className="h-3 w-3 text-primary" />
                <span className="font-semibold text-foreground">{usage.tripsUsed} / {usage.tripsQuota}</span>
                <span className="text-muted-foreground">Trips</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-muted border border-border text-[11px]">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span className="font-semibold text-foreground">{usage.aiCreditsUsed} / {usage.aiCreditsQuota}</span>
                <span className="text-muted-foreground">Monthly AI Credits</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
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

      {/* ── Plan Comparison Header & Glitch-Free Billing Cycle Switcher ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Available Plans & Feature Privileges
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose the plan that fits your travel frequency. Localized in {activeCurrencyCode} ({currencySymbol}).
            </p>
          </div>

          {/* Glitch-Free Segmented Billing Switcher */}
          <div className="inline-flex p-1 bg-muted rounded-xs border border-border text-xs select-none">
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`py-1 px-3 rounded-xs font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border ${
                isAnnual
                  ? "bg-card text-foreground shadow-2xs border-border/80"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Yearly</span>
              <span className="text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded-xs">
                Save {savingsDisplay}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`py-1 px-3 rounded-xs font-semibold text-xs transition-colors cursor-pointer border ${
                !isAnnual
                  ? "bg-card text-foreground shadow-2xs border-border/80"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Monthly</span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRICING_PLANS.map((plan) => {
            const isPlanPro = plan.id === "pro";
            const isCurrent = (isPlanPro && isPro) || (!isPlanPro && !isPro);

            // Dynamic localized pricing values
            const monthlyPrice = isPlanPro
              ? isAnnual
                ? proAnnualMonthlyDisplay
                : proMonthlyDisplay
              : `${currencySymbol}0`;

            const subPriceText = isPlanPro
              ? isAnnual
                ? `Total ${proAnnualTotalDisplay} / year • Save ${savingsDisplay} discount • Billed annually`
                : `Total ${proMonthlyDisplay} / month • Renews 1st of every month • Cancel anytime`
              : "Free forever workspace tier";

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-sm border transition-all ${
                  isPlanPro
                    ? "border-primary/60 shadow-sm bg-card ring-1 ring-primary/20"
                    : "border-border bg-card shadow-xs"
                }`}
              >
                {isPlanPro && (
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

                    {/* Price Block */}
                    <div className="pt-3 space-y-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-foreground tracking-tight">
                          {monthlyPrice}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          / month
                        </span>
                        {isPlanPro && isAnnual && (
                          <Badge variant="secondary" className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-xs ml-1">
                            Billed Annually
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {subPriceText}
                      </p>
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
                    isPlanPro && isPro ? (
                      <Button
                        variant="outline"
                        onClick={handleOpenCustomerPortal}
                        disabled={isOpeningPortal}
                        className="w-full h-8 text-xs rounded-sm font-semibold border-primary/30 text-primary hover:bg-primary/5 shadow-xs cursor-pointer gap-1.5"
                      >
                        {isOpeningPortal ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="h-3.5 w-3.5" />
                        )}
                        Manage Subscription
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        disabled
                        className="w-full h-8 text-xs rounded-sm font-semibold cursor-default opacity-80"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                        Active Plan
                      </Button>
                    )
                  ) : isPlanPro ? (
                    <Button
                      onClick={handleStartPolarCheckout}
                      disabled={isCheckingOut}
                      className="w-full h-8 text-xs rounded-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer gap-1.5"
                    >
                      {isCheckingOut ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                      )}
                      Upgrade with Polar ({monthlyPrice}/mo)
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

      {/* ── Polar Trust & Security Badges ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-sm border border-border bg-card/60 flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-foreground block">Merchant of Record</span>
            <span className="text-muted-foreground text-[10px]">Polar.sh handles global tax & VAT</span>
          </div>
        </div>
        <div className="p-3 rounded-sm border border-border bg-card/60 flex items-center gap-2.5">
          <Lock className="h-4 w-4 text-emerald-500 shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-foreground block">256-bit Encryption</span>
            <span className="text-muted-foreground text-[10px]">Secure payment gateway</span>
          </div>
        </div>
        <div className="p-3 rounded-sm border border-border bg-card/60 flex items-center gap-2.5">
          <Zap className="h-4 w-4 text-amber-500 shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-foreground block">Instant Activation</span>
            <span className="text-muted-foreground text-[10px]">25 trips & 150 credits unlocked</span>
          </div>
        </div>
        <div className="p-3 rounded-sm border border-border bg-card/60 flex items-center gap-2.5">
          <RefreshCw className="h-4 w-4 text-sky-500 shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-foreground block">Cancel Anytime</span>
            <span className="text-muted-foreground text-[10px]">1-click self-service cancel</span>
          </div>
        </div>
      </div>

      {/* ── Subscription Details & Billing Navigation ── */}
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
                <span>Payment Processor</span>
                <span className="text-foreground font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  Polar Checkout
                </span>
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
                  <span className="font-medium text-foreground">Account & Currency Preferences</span>
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

      {/* ── Polar Checkout Simulation Modal ── */}
      <Dialog open={simulationModalOpen} onOpenChange={setSimulationModalOpen}>
        <DialogContent className="sm:max-w-md p-5 border border-border bg-card rounded-md shadow-xl space-y-4">
          <DialogHeader className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-wider text-primary w-fit">
              <ShieldCheck className="h-3 w-3" />
              <span>Polar Checkout</span>
            </div>
            <DialogTitle className="text-base font-semibold text-foreground">
              Upgrade to Pro Wanderer
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Complete checkout via Polar.sh (Merchant of Record).
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-sm border border-border bg-muted/30 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Selected Plan:</span>
              <span className="font-semibold text-foreground">Pro Wanderer ({isAnnual ? "Yearly" : "Monthly"})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rate:</span>
              <span className="font-bold text-foreground">
                {isAnnual ? `${proAnnualMonthlyDisplay} / mo (${proAnnualTotalDisplay} / yr)` : `${proMonthlyDisplay} / mo`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Currency:</span>
              <span className="font-mono text-foreground">{activeCurrencyCode} ({currencySymbol})</span>
            </div>
            {isAnnual && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Annual Discount:</span>
                <span>Save {savingsDisplay} (discount of ₹400)</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Billing Renewal:</span>
              <span className="font-semibold text-foreground">Recurring on 1st of every month</span>
            </div>
            <Separator />
            <div className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
              {simulationMessage}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSimulationModalOpen(false)}
              className="text-xs rounded-sm cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSimulationUpgrade}
              disabled={isCheckingOut}
              className="bg-primary text-primary-foreground font-semibold text-xs rounded-sm gap-1.5 cursor-pointer hover:bg-primary/90"
            >
              {isCheckingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              )}
              Activate Pro Wanderer (Test Mode)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
