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
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { ChevronDown, X } from "lucide";
import { MorphIcon } from "morphicons/react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

import { cn } from "@/lib/utils";
import { SUPPORTED_CURRENCIES } from "@/features/travel-essentials/currency/currency-service";

import {
  createPolarCheckoutSession,
  createPolarCustomerPortalSession,
  getUserPricingCurrency,
  simulatePolarUpgrade,
} from "../actions";

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
  const [openFaqItems, setOpenFaqItems] = useState<string[]>([]);
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
    const portalWindow = typeof window !== "undefined" ? window.open("about:blank", "_blank") : null;
    if (portalWindow) {
      try {
        portalWindow.opener = null;
      } catch {
        // Safe fallback
      }
    }

    setIsOpeningPortal(true);
    try {
      const res = await createPolarCustomerPortalSession();
      if (res.success && res.portalUrl) {
        toast.info("Opening Polar Customer Portal in a new tab...");
        if (portalWindow && !portalWindow.closed) {
          portalWindow.location.href = res.portalUrl;
        } else {
          window.open(res.portalUrl, "_blank", "noopener,noreferrer");
        }
      } else {
        if (portalWindow && !portalWindow.closed) {
          portalWindow.close();
        }
        toast.error(res.error || "Failed to open customer billing portal.");
      }
    } catch {
      if (portalWindow && !portalWindow.closed) {
        portalWindow.close();
      }
      toast.error("An unexpected error occurred contacting Polar.");
    } finally {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <span className="font-sans text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase block">
            Membership & Quotas
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl font-light tracking-tight text-foreground">
            Workspace <span className="font-serif italic font-normal text-foreground">Subscription & Plans</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Manage your workspace membership tier, compare plan privileges, and upgrade via Polar Checkout.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Currency Preference Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-sm gap-1.5 font-sans font-medium tabular-nums border-border/80 bg-card hover:bg-muted/70 cursor-pointer shadow-2xs"
              >
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span>{activeCurrencyCode} ({currencySymbol})</span>
                <span className="text-[10px] text-muted-foreground ml-0.5">▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 max-h-64 overflow-y-auto rounded-sm border-border/80 shadow-md">
              <div className="px-2 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Select Pricing Currency
              </div>
              {SUPPORTED_CURRENCIES.map((c) => (
                <DropdownMenuItem
                  key={c.code}
                  onClick={() => handleCurrencyChange(c.code)}
                  className={`text-xs cursor-pointer font-sans flex items-center justify-between ${
                    c.code === activeCurrencyCode ? "font-semibold text-primary bg-primary/5" : ""
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="font-sans font-medium tabular-nums text-muted-foreground">{c.symbol} {c.code}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!isPro ? (
            <Button
              onClick={handleStartPolarCheckout}
              disabled={isCheckingOut}
              className="bg-[#2D9BF0] hover:bg-[#2587D3] text-white font-sans text-xs font-semibold h-8 px-3.5 rounded-sm shadow-xs gap-1.5 cursor-pointer active:scale-[0.99] transition-all"
            >
              {isCheckingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              )}
              Upgrade with Polar ({isAnnual ? `${proAnnualMonthlyDisplay}/mo` : `${proMonthlyDisplay}/mo`})
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenCustomerPortal}
              disabled={isOpeningPortal}
              className="h-8 text-xs rounded-sm font-sans font-semibold border-border/80 gap-1.5 cursor-pointer hover:bg-muted/70 shadow-2xs"
              title="Manage billing and payment methods on Polar (opens in a new tab)"
            >
              {isOpeningPortal ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
              )}
              Manage Subscription
            </Button>
          )}
        </div>
      </div>

      {/* ── Checkout Confirmation Banner ── */}
      {checkoutSuccess && (
        <div className="rounded-md border border-sky-200 bg-sky-50/80 dark:border-sky-900/50 dark:bg-sky-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-sans font-semibold text-sky-900 dark:text-sky-100">
                Polar Checkout Completed
              </p>
              <p className="font-sans text-sky-700 dark:text-sky-300/80 mt-0.5 leading-relaxed">
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
            className="h-7 text-xs font-sans font-semibold bg-background border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-200 shrink-0 cursor-pointer gap-1.5 rounded-sm"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh Status
          </Button>
        </div>
      )}

      {/* ── Current Active Tier Summary Card ── */}
      <div className="relative rounded-md overflow-hidden border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-primary bg-primary/10 border border-primary/20 rounded-xs px-2 py-0.5">
                Current Active Tier
              </span>
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
            <h2 className="font-sans text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              {isPro ? (
                <>
                  Pro Wanderer <span className="font-serif italic font-normal text-muted-foreground text-lg sm:text-xl">Membership</span>
                </>
              ) : (
                <>
                  Free Explorer <span className="font-serif italic font-normal text-muted-foreground text-lg sm:text-xl">Membership</span>
                </>
              )}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              {isPro
                ? "You have access to 25 workspace trips, 150 monthly AI assistant credits, structured itinerary proposals, rich travel story covers, and verified creator privileges."
                : "You are currently on the Free Explorer tier with 10 trip workspace slots and 30 AI assistant credits per month."}
            </p>

            {/* Quota metric chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-muted/50 border border-border/70 font-sans text-xs">
                <Compass className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold tabular-nums text-foreground">{usage.tripsUsed} / {usage.tripsQuota}</span>
                <span className="text-muted-foreground text-[11px]">Trips</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-muted/50 border border-border/70 font-sans text-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold tabular-nums text-foreground">{usage.aiCreditsUsed} / {usage.aiCreditsQuota}</span>
                <span className="text-muted-foreground text-[11px]">Monthly AI Credits</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <Link href="/usage">
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-sm font-sans font-medium gap-1.5 cursor-pointer border-border/80 hover:bg-muted/70 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>View Usage</span>
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
            <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 block mb-0.5">
              Tier Privileges
            </span>
            <h2 className="font-sans text-base sm:text-lg font-semibold tracking-tight text-foreground">
              Available Plans & Feature Privileges
            </h2>
            <p className="font-sans text-xs text-muted-foreground mt-0.5">
              Choose the plan that fits your travel frequency. Localized in {activeCurrencyCode} ({currencySymbol}).
            </p>
          </div>

          {/* Glitch-Free Segmented Billing Switcher (50/50 width on mobile responsive) */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex p-1 bg-muted/60 rounded-sm border border-border/80 font-sans text-xs select-none">
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`py-1.5 px-3 rounded-xs font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
                isAnnual
                  ? "bg-card text-foreground shadow-2xs border-border/80"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Yearly</span>
              <span className="font-sans text-[9px] font-semibold tabular-nums bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded-xs shrink-0">
                Save {savingsDisplay}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`py-1.5 px-3 rounded-xs font-semibold text-xs transition-colors flex items-center justify-center cursor-pointer border ${
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
                className={`relative flex flex-col justify-between rounded-md border transition-all ${
                  isPlanPro
                    ? "border-primary/60 shadow-sm bg-card ring-1 ring-primary/20"
                    : "border-border/80 bg-card shadow-xs"
                }`}
              >
                {isPlanPro && (
                  <div className="absolute -top-2.5 right-4 rounded-xs bg-[#2D9BF0] px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-white shadow-xs">
                    {plan.badge || "Recommended"}
                  </div>
                )}

                <div>
                  <CardHeader className="p-5 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="font-brand font-medium tracking-[0.08em] text-base sm:text-lg uppercase text-foreground">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="font-serif italic font-normal text-xs sm:text-sm text-muted-foreground">
                        {plan.tagline}
                      </CardDescription>
                    </div>

                    {/* Price Block */}
                    <div className="pt-3 space-y-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-sans text-2xl sm:text-3xl font-light tracking-tight tabular-nums text-foreground">
                          {monthlyPrice}
                        </span>
                        <span className="font-sans text-xs text-muted-foreground font-medium">
                          / month
                        </span>
                        {isPlanPro && isAnnual && (
                          <Badge variant="secondary" className="font-sans text-[10px] font-semibold tabular-nums bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-xs ml-1">
                            Billed Annually
                          </Badge>
                        )}
                      </div>
                      <p className="font-sans text-[11px] text-muted-foreground tabular-nums">
                        {subPriceText}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    <Separator className="border-border/60" />
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Included Features
                    </p>
                    <ul className="space-y-2 font-sans text-xs">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-foreground/90">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{feature}</span>
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
                        className="w-full h-8 text-xs rounded-sm font-sans font-semibold border-primary/30 text-primary hover:bg-primary/5 shadow-xs cursor-pointer gap-1.5"
                        title="Manage billing and payment methods on Polar (opens in a new tab)"
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
                        className="w-full h-8 text-xs rounded-sm font-sans font-semibold cursor-default opacity-80"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                        Active Plan
                      </Button>
                    )
                  ) : isPlanPro ? (
                    <Button
                      onClick={handleStartPolarCheckout}
                      disabled={isCheckingOut}
                      className="w-full h-8 text-xs rounded-sm font-sans font-semibold bg-[#2D9BF0] text-white hover:bg-[#2587D3] shadow-xs cursor-pointer gap-1.5 active:scale-[0.99] transition-all"
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
                      className="w-full h-8 text-xs rounded-sm font-sans font-medium opacity-60"
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

      {/* ── Subscription Details & Billing Navigation ── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="font-sans text-sm sm:text-base font-semibold tracking-tight text-foreground">
            Subscription Details & Terms
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-md border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3">
            <h3 className="font-sans text-xs font-semibold text-foreground">Billing Cycle & Renewal</h3>
            <div className="space-y-2 font-sans text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Active Cycle Window</span>
                <span className="font-semibold text-foreground tabular-nums">{usage.billingCycleStart} – {usage.billingCycleEnd}</span>
              </div>
              <Separator className="border-border/60" />
              <div className="flex items-center justify-between">
                <span>Next Quota Renewal</span>
                <span className="font-semibold text-foreground tabular-nums">1st of next month</span>
              </div>
              <Separator className="border-border/60" />
              <div className="flex items-center justify-between">
                <span>Payment Processor</span>
                <span className="text-foreground font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Polar Checkout
                </span>
              </div>
            </div>
          </Card>

          <Card className="rounded-md border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3">
            <h3 className="font-sans text-xs font-semibold text-foreground">Quick Navigation</h3>
            <div className="space-y-2 font-sans">
              <Link
                href="/usage"
                className="flex items-center justify-between p-2.5 rounded-sm border border-border/70 bg-muted/40 hover:bg-muted text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-foreground">Check AI Credit & Trip Usage</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/profile"
                className="flex items-center justify-between p-2.5 rounded-sm border border-border/70 bg-muted/40 hover:bg-muted text-xs transition-colors"
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
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h2 className="font-sans text-sm sm:text-base font-semibold tracking-tight text-foreground">
            Subscription FAQ
          </h2>
        </div>

        <Accordion
          type="multiple"
          value={openFaqItems}
          onValueChange={setOpenFaqItems}
          className="space-y-2.5"
        >
          {PRICING_FAQS.map((faq, i) => {
            const itemKey = `faq-${i}`;
            const isOpen = openFaqItems.includes(itemKey);

            return (
              <AccordionItem
                key={i}
                value={itemKey}
                className="rounded-md border border-border/80 bg-card shadow-xs transition-colors duration-200 hover:border-border data-[state=open]:border-primary/40 data-[state=open]:bg-muted/10 overflow-hidden"
              >
                <AccordionTrigger
                  hideChevron
                  className="py-3 px-4 font-sans text-xs sm:text-sm font-semibold text-foreground hover:no-underline flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <span className="text-left leading-relaxed">{faq.question}</span>
                  <div
                    className={cn(
                      "p-1.5 rounded-xs transition-all duration-300 ease-out shrink-0 flex items-center justify-center",
                      isOpen
                        ? "bg-primary/10 text-primary rotate-90 scale-105"
                        : "bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground rotate-0 scale-100"
                    )}
                  >
                    <MorphIcon
                      icon={isOpen ? X : ChevronDown}
                      size={15}
                      strokeWidth={2.2}
                      className="transition-colors duration-300"
                      spring="smooth"
                    />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3.5 pt-0 font-sans text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <div className="pt-2 border-t border-border/40">
                    <p className="mt-1">{faq.answer}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* ── Polar Checkout Simulation Modal ── */}
      <Dialog open={simulationModalOpen} onOpenChange={setSimulationModalOpen}>
        <DialogContent className="sm:max-w-md p-5 border border-border/80 bg-card rounded-md shadow-xl space-y-4">
          <DialogHeader className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-primary/10 border border-primary/20 font-sans text-[10px] font-semibold uppercase tracking-wider text-primary w-fit">
              <ShieldCheck className="h-3 w-3" />
              <span>Polar Checkout</span>
            </div>
            <DialogTitle className="font-sans text-base sm:text-lg font-semibold tracking-tight text-foreground">
              Upgrade to Pro Wanderer
            </DialogTitle>
            <DialogDescription className="font-sans text-xs text-muted-foreground leading-relaxed">
              Complete checkout via Polar.sh (Merchant of Record).
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-border/80 bg-muted/30 p-3.5 space-y-2 font-sans text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Selected Plan:</span>
              <span className="font-semibold text-foreground">Pro Wanderer ({isAnnual ? "Yearly" : "Monthly"})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rate:</span>
              <span className="font-semibold tabular-nums text-foreground">
                {isAnnual ? `${proAnnualMonthlyDisplay} / mo (${proAnnualTotalDisplay} / yr)` : `${proMonthlyDisplay} / mo`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Currency:</span>
              <span className="font-medium tabular-nums text-foreground">{activeCurrencyCode} ({currencySymbol})</span>
            </div>
            {isAnnual && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Annual Discount:</span>
                <span className="tabular-nums">Save {savingsDisplay} (discount of ₹400)</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Billing Renewal:</span>
              <span className="font-semibold text-foreground">Recurring on 1st of every month</span>
            </div>
            <Separator className="border-border/60" />
            <div className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
              {simulationMessage}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-1 font-sans">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSimulationModalOpen(false)}
              className="text-xs rounded-sm cursor-pointer border-border/80"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSimulationUpgrade}
              disabled={isCheckingOut}
              className="bg-[#2D9BF0] hover:bg-[#2587D3] text-white font-semibold text-xs rounded-sm gap-1.5 cursor-pointer shadow-xs active:scale-[0.99] transition-all"
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

