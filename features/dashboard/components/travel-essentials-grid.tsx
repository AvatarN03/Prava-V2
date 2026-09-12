import Link from "next/link";

import {
  ArrowUpRight,
  BookOpen,
  CloudSun,
  Coins,
  Languages,
  Map,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TravelEssentialsGrid() {
  const essentialsTools = [
    {
      title: "Weather",
      subtitle: "Live forecasts & radar",
      icon: CloudSun,
      href: "/travel-essentials?tab=weather",
    },
    {
      title: "Currency (FX)",
      subtitle: "Live ECB rates & converter",
      icon: Coins,
      href: "/travel-essentials?tab=currency",
    },
    {
      title: "Interactive Maps",
      subtitle: "Leaflet & OSM exploration",
      icon: Map,
      href: "/travel-essentials?tab=maps",
    },
    {
      title: "Country Guide",
      subtitle: "Visa facts & emergency lines",
      icon: BookOpen,
      href: "/travel-essentials?tab=guide",
    },
    {
      title: "Language Essentials",
      subtitle: "Local phrases & essentials",
      icon: Languages,
      href: "/travel-essentials?tab=language",
    },
  ];

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Travel Essentials
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Contextual live utilities for active &amp; foreign travel
          </p>
        </div>

        <Link
          href="/travel-essentials"
          className="text-xs text-primary font-medium hover:underline inline-flex items-center"
        >
          Open all <ArrowUpRight className="w-3 h-3 ml-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {essentialsTools.map((tool, index) => {
            const Icon = tool.icon;
            // Span last item across full row if odd number on 2-col or just natural layout
            const isLastOnTwoCol = index === 4;

            return (
              <Link
                key={tool.title}
                href={tool.href}
                className={`p-3 rounded-md border border-border/80 bg-background hover:border-primary/50 hover:bg-accent/40 transition-colors text-left group flex flex-col justify-between space-y-2.5 cursor-pointer shadow-2xs ${
                  isLastOnTwoCol ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-sm bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>

                <div>
                  <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {tool.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {tool.subtitle}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
