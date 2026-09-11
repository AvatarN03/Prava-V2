"use client";

import { useState } from "react";

import {
  Check,
  Copy,
  Flame,
  HeartPulse,
  PhoneCall,
  Search,
  Shield,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { EMERGENCY_DIRECTORY } from "./emergency-data";

export function EmergencyView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const filtered = EMERGENCY_DIRECTORY.filter(
    (item) =>
      item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dialCode.includes(searchQuery)
  );

  const copyToClipboard = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-destructive" />
            Global Emergency Directory
          </h2>
          <p className="text-xs text-muted-foreground">
            Critical emergency numbers, police, ambulance, and international dial codes worldwide.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search country or dial code..."
            className="pl-8 h-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Emergency Notice Banner */}
      <div className="p-3.5 rounded-sm bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
        <div>
          <span className="font-semibold">Life-Threatening Emergency Notice:</span> When abroad, emergency dispatch operators may not always speak fluent English. In the EU, dial <span className="font-mono font-bold">112</span>; in the US/Canada, dial <span className="font-mono font-bold">911</span>; in the UK, dial <span className="font-mono font-bold">999</span>.
        </div>
      </div>

      {/* Country Emergency Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card key={item.country} className="border-border bg-card">
            <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  {item.country}
                </CardTitle>
                <CardDescription className="text-xs font-mono">
                  Dial Code: {item.dialCode}
                </CardDescription>
              </div>
              <Badge variant="planning" className="font-mono text-[10px]">
                {item.code}
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-2.5 text-xs">
              {/* General / Single Emergency */}
              <div className="flex items-center justify-between p-2 rounded-sm bg-destructive/10 border border-destructive/20">
                <span className="font-semibold text-destructive flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" /> General Emergency
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.general)}
                  className="font-mono font-bold text-destructive hover:underline inline-flex items-center gap-1 cursor-pointer"
                  title="Click to copy"
                >
                  {item.general}
                  {copiedNumber === item.general ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-60" />
                  )}
                </button>
              </div>

              {/* Police */}
              <div className="flex items-center justify-between p-2 rounded-sm bg-muted/40 border border-border">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" /> Police
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {item.police}
                </span>
              </div>

              {/* Ambulance */}
              <div className="flex items-center justify-between p-2 rounded-sm bg-muted/40 border border-border">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-primary" /> Medical / Ambulance
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {item.ambulance}
                </span>
              </div>

              {/* Fire */}
              <div className="flex items-center justify-between p-2 rounded-sm bg-muted/40 border border-border">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-primary" /> Fire Brigade
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {item.fire}
                </span>
              </div>

              {item.notes && (
                <p className="text-[11px] text-muted-foreground italic pt-1 leading-relaxed">
                  💡 {item.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
