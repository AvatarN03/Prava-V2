"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Bell,
  Calendar,
  Compass,
  Menu,
  Search,
  Sparkles,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { createClient } from "@/lib/supabase/client";

interface TopBarProps {
  onMobileMenuOpen: () => void;
}

export function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const [userInfo, setUserInfo] = useState<{
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  }>({});

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const userMeta = user.user_metadata;
          setUserInfo({
            name:
              userMeta?.full_name ||
              userMeta?.name ||
              user.email?.split("@")[0] ||
              "Traveler",
            email: user.email,
            avatarUrl: userMeta?.avatar_url || userMeta?.picture || null,
          });
        }
      } catch (err) {
        console.error("Failed to load user in topbar:", err);
      }
    }

    loadUser();
  }, [supabase]);

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/trips")) return "Trips";
    if (pathname.startsWith("/travel-essentials")) return "Travel Essentials";
    if (pathname.startsWith("/stories")) return "Travel Stories";
    if (pathname.startsWith("/community")) return "Community Forum";
    if (pathname.startsWith("/profile")) return "Account & Settings";
    if (pathname.startsWith("/pricing")) return "Subscription & Usage";
    return "Workspace";
  };

  const todayStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 shrink-0 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0A0F1D]/95 backdrop-blur-md px-4 md:px-6 md:rounded-tl-[24px] transition-colors">
        {/* Left: Mobile Trigger, Page Title & Quick Search Bar */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            onClick={onMobileMenuOpen}
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight shrink-0">
            {getPageTitle()}
          </h1>

          {/* Quick Search Input with Ctrl K pill */}
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 w-64 focus-within:border-[#2D9BF0] focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search trips, notes..."
              className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 w-full"
            />
            <kbd className="hidden md:inline-flex items-center gap-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right: Date, Live Pill, Notifications & User Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Date Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <Calendar className="h-3.5 w-3.5 text-[#2D9BF0]" />
            <span>Today ({todayStr})</span>
          </div>

          {/* Live Sync Status Indicator */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/40 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Workspace</span>
          </div>

          {/* Notifications Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-[#2D9BF0] hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Notifications & Alerts</p>
            </TooltipContent>
          </Tooltip>

          {/* User Profile Chip with Avatar & Role Badge */}
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 py-1 pl-1 pr-3 hover:border-[#2D9BF0]/50 transition-all cursor-pointer shadow-2xs group"
            title="View Profile & Settings"
          >
            <Avatar className="h-7 w-7 border border-slate-200 dark:border-slate-700 shadow-xs">
              {userInfo.avatarUrl && (
                <AvatarImage
                  src={userInfo.avatarUrl}
                  alt={userInfo.name || "Avatar"}
                />
              )}
              <AvatarFallback className="bg-gradient-to-tr from-[#2D9BF0] to-[#55B8FF] text-white font-bold text-[11px]">
                {userInfo.name ? (
                  userInfo.name.charAt(0).toUpperCase()
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#2D9BF0] transition-colors max-w-[110px] truncate leading-tight">
                {userInfo.name || "Traveler"}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                Admin
              </span>
            </div>
          </Link>
        </div>
      </header>
    </TooltipProvider>
  );
}
