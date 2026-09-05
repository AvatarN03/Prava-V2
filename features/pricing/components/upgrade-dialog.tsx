"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Zap, Shield, ArrowRight } from "lucide-react";
import { PRICING_PLANS } from "../pricing-config";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function UpgradeDialog({
  open,
  onOpenChange,
  title = "Unlock 25 Workspace Trips & 150 AI Credits",
  description = "You've reached your free tier quota. Upgrade to Pro Wanderer for an expanded 25-trip workspace, 150 monthly AI assistant credits, and creator perks.",
}: UpgradeDialogProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const proPlan = PRICING_PLANS.find((p) => p.id === "pro")!;

  const handleUpgrade = () => {
    alert("Pro subscription checkout initialized. (Stripe billing integration ready)");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-slate-200 bg-white rounded-2xl">
        {/* Glowing Header Banner */}
        <div className="bg-gradient-to-br from-[#1279CE] via-[#2D9BF0] to-[#55B8FF] p-6 text-white text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-28 w-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold text-white shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span>Prava Pro Wanderer</span>
          </div>

          <DialogTitle className="text-xl font-extrabold tracking-tight text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-sky-100 max-w-sm mx-auto leading-relaxed">
            {description}
          </DialogDescription>

          {/* Billing Cycle Switcher */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex items-center bg-black/20 p-1 rounded-xl border border-white/20 text-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Monthly ($12/mo)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  billingCycle === "annual"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Yearly ($8.25/mo)
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">
                  Save 31%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Everything included in Pro Wanderer:
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-700">
              {proPlan.features.slice(0, 5).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#2D9BF0] mt-0.5">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Button
              className="w-full bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] text-white font-bold gap-2 shadow-sm shadow-[#2D9BF0]/30 cursor-pointer h-11 rounded-xl text-xs"
              onClick={handleUpgrade}
            >
              <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
              Upgrade to Pro —{" "}
              {billingCycle === "annual" ? "$99 / year" : "$12 / month"}
            </Button>
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-[#2D9BF0]" /> Cancel anytime
              </span>
              <Link
                href="/pricing"
                onClick={() => onOpenChange(false)}
                className="text-[#2D9BF0] hover:underline font-semibold inline-flex items-center gap-0.5"
              >
                View full usage tracking <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
