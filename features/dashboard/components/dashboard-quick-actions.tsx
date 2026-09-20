"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CloudSun,
  Coins,
  Globe,
  Languages,
  LayoutTemplate,
  Map,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";

export function DashboardQuickActions() {
  const quickActionGroups = [
    {
      id: "live-essentials",
      title: "Weather & Currency Tools",
      category: "Live Travel Utilities",
      description: "Check live 5-day destination forecasts, atmospheric conditions, and convert currencies to INR with live ECB rates.",
      icon: CloudSun,
      iconColor: "text-[#2D9BF0] bg-[#2D9BF0]/10",
      mainHref: "/travel-essentials?tab=weather",
      tools: [
        { label: "5-Day Weather Radar", href: "/travel-essentials?tab=weather", icon: CloudSun },
        { label: "FX Converter (INR)", href: "/travel-essentials?tab=currency", icon: Coins },
        { label: "Interactive Maps", href: "/travel-essentials?tab=maps", icon: Map },
      ],
    },
    {
      id: "culture-guide",
      title: "Country Guide & Languages",
      category: "Destination Intelligence",
      description: "Access 250+ country profiles, verified visa facts, emergency contact numbers, and native language travel phrases.",
      icon: Globe,
      iconColor: "text-emerald-500 bg-emerald-500/10",
      mainHref: "/travel-essentials?tab=guide",
      tools: [
        { label: "Country Facts & Visa", href: "/travel-essentials?tab=guide", icon: Globe },
        { label: "Emergency Numbers", href: "/travel-essentials?tab=guide", icon: BookOpen },
        { label: "Local Phrases", href: "/travel-essentials?tab=language", icon: Languages },
      ],
    },
    {
      id: "community-templates",
      title: "Curated Templates & Forum",
      category: "Community & Discovery",
      description: "Clone community-crafted day schedules in 1-click, read traveler stories, and discuss recommendations in the forum.",
      icon: LayoutTemplate,
      iconColor: "text-amber-500 bg-amber-500/10",
      mainHref: "/templates",
      tools: [
        { label: "1-Click Templates", href: "/templates", icon: Sparkles },
        { label: "Travel Stories", href: "/stories", icon: BookOpen },
        { label: "Traveler Forum", href: "/forum", icon: MessageSquare },
      ],
    },
  ];

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Actions &amp; Travel Utilities
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Combined travel essentials, destination intelligence, and curated community shortcuts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActionGroups.map((group) => {
          const GroupIcon = group.icon;
          return (
            <Card
              key={group.id}
              className="border-border bg-card shadow-xs rounded-sm hover:border-[#2D9BF0]/40 transition-colors flex flex-col justify-between p-4 space-y-3.5"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-xs ${group.iconColor}`}>
                      <GroupIcon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.category}
                    </span>
                  </div>

                  <Link
                    href={group.mainHref}
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                    title={`Open ${group.title}`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <div>
                  <Link
                    href={group.mainHref}
                    className="text-sm font-bold text-foreground hover:text-primary transition-colors block"
                  >
                    {group.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                    {group.description}
                  </p>
                </div>
              </div>

              {/* Combined Sub-Tools Pills */}
              <div className="pt-2 border-t border-border/60">
                <div className="flex flex-wrap gap-1.5">
                  {group.tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <Link
                        key={tool.label}
                        href={tool.href}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xs text-[11px] font-medium bg-muted/60 hover:bg-muted text-slate-700 dark:text-slate-300 hover:text-foreground transition-colors cursor-pointer border border-border/50"
                      >
                        <ToolIcon className="w-3 h-3 text-primary shrink-0" />
                        <span>{tool.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
