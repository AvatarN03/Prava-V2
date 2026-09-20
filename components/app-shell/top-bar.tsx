"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  Coins,
  Compass,
  CreditCard,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  Menu,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import { Moon, Sun } from "lucide";
import { MorphIcon } from "morphicons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { getTopBarUserInfo, type TopBarUserInfo } from "@/features/profile/actions";

interface TopBarProps {
  onMobileMenuOpen: () => void;
  initialUserInfo?: TopBarUserInfo | null;
}

// In-memory module cache to completely eliminate redundant roundtrips and avatar flashing across route navigations
let cachedUserInfo: TopBarUserInfo | null = null;

export function TopBar({ onMobileMenuOpen, initialUserInfo }: TopBarProps) {
  const pathname = usePathname();
  const supabase = createClient();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [userInfo, setUserInfo] = useState<TopBarUserInfo>(() => {
    if (initialUserInfo) {
      cachedUserInfo = initialUserInfo;
      return initialUserInfo;
    }
    if (cachedUserInfo) {
      return cachedUserInfo;
    }
    return {
      name: "Traveler",
      email: null,
      avatarUrl: null,
      username: null,
    };
  });

  const [loading, setLoading] = useState(!initialUserInfo && !cachedUserInfo);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUser(showSkeleton = false) {
      try {
        if (showSkeleton) {
          setLoading(true);
        }
        // Fetch verified user profile with avatar from Postgres database
        const res = await getTopBarUserInfo();
        if (res.success && res.data && isMounted) {
          cachedUserInfo = res.data;
          setUserInfo(res.data);
          setLoading(false);
          return;
        }

        // Fallback to client-side Supabase session metadata
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && isMounted) {
          const userMeta = user.user_metadata || {};
          const fallbackData: TopBarUserInfo = {
            name:
              userMeta.full_name ||
              userMeta.name ||
              user.email?.split("@")[0] ||
              "Traveler",
            email: user.email || null,
            avatarUrl: userMeta.avatar_url || userMeta.picture || null,
            username: userMeta.username || null,
          };
          cachedUserInfo = fallbackData;
          setUserInfo(fallbackData);
        }
      } catch (err) {
        console.error("Failed to load user in topbar:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Only load if not cached yet or if needing background refresh
    if (!cachedUserInfo) {
      loadUser(!initialUserInfo);
    }

    // Listen for custom profile update events (e.g. after uploading a new avatar)
    const handleProfileUpdate = () => {
      loadUser(false);
    };
    window.addEventListener("prava-profile-updated", handleProfileUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("prava-profile-updated", handleProfileUpdate);
    };
  }, [supabase]);

  const getPageInfo = () => {
    if (pathname.startsWith("/dashboard")) {
      return { title: "Prava Dashboard", icon: LayoutDashboard };
    }
    if (pathname.startsWith("/trips")) {
      return { title: "Prava Trips", icon: Compass };
    }
    if (pathname.startsWith("/travel-essentials")) {
      return { title: "Prava Travel Essentials", icon: ShieldAlert };
    }
    if (pathname.startsWith("/forum") || pathname.startsWith("/community")) {
      return { title: "Forum", icon: MessageSquare };
    }
    if (pathname.startsWith("/stories")) {
      return { title: "Travel Stories", icon: BookOpen };
    }
    if (pathname.startsWith("/templates")) {
      return { title: "Templates", icon: LayoutTemplate };
    }
    if (pathname.startsWith("/profile")) {
      return { title: "Account & Settings", icon: User };
    }
    if (pathname.startsWith("/usage")) {
      return { title: "Usage & Quotas", icon: Sparkles };
    }
    if (pathname.startsWith("/subscription") || pathname.startsWith("/pricing")) {
      return { title: "Subscription & Plans", icon: CreditCard };
    }
    return { title: "Prava Workspace", icon: Compass };
  };

  const pageInfo = getPageInfo();
  const PageIcon = pageInfo.icon;

  const isCurrentDark = mounted && (resolvedTheme === "dark" || theme === "dark");
  const [displayDark, setDisplayDark] = useState<boolean | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeDark = displayDark !== null ? displayDark : isCurrentDark;

  useEffect(() => {
    if (mounted && displayDark === null) {
      setDisplayDark(isCurrentDark);
    }
  }, [isCurrentDark, mounted, displayDark]);

  const toggleTheme = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const nextIsDark = !activeDark;
    const nextTheme = nextIsDark ? "dark" : "light";

    // Start morph animation first
    setDisplayDark(nextIsDark);

    // Delay the actual application theme switch so the morph plays smoothly first
    setTimeout(() => {
      setTheme(nextTheme);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    }, 240);
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 shrink-0 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0A0F1D]/95 backdrop-blur-md px-4 md:px-6 rounded-none md:rounded-tl-[24px] transition-colors">
        {/* Left: Mobile Trigger & Page Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            onClick={onMobileMenuOpen}
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex h-7 w-7 items-center justify-center rounded-xs bg-sky-50 dark:bg-sky-950/40 text-[#2D9BF0] border border-sky-200/60 dark:border-sky-800/40 shadow-2xs shrink-0">
              <PageIcon className="h-4 w-4" />
            </div>
            <h1 className="text-sm sm:text-base font-light sm:font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Right: Theme Toggle, Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Toggle Button with MorphIcons Transition (Sun <-> Moon) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                disabled={isTransitioning}
                className="h-9 w-9 text-slate-500 dark:text-slate-400 hover:text-[#2D9BF0] hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                aria-label="Toggle theme"
              >
                {mounted ? (
                  <MorphIcon
                    icon={activeDark ? Sun : Moon}
                    size={20}
                    strokeWidth={2.2}
                    className={cn(
                      "transition-colors duration-300 text-slate-600 dark:text-slate-300"
                    )}
                    spring="snappy"
                  />
                ) : (
                  <div className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {activeDark ? "Switch to Light mode" : "Switch to Dark mode"}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Notifications Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-500 dark:text-slate-400 hover:text-[#2D9BF0] hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Notifications &amp; Alerts</p>
            </TooltipContent>
          </Tooltip>

          {/* User Profile (Avatar and Name collected in a single interactive Popover trigger) */}
          {loading ? (
            <div className="flex items-center gap-2 pl-1 pr-1" aria-busy="true" aria-label="Loading profile">
              <Skeleton className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-3.5 w-16 rounded bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            </div>
          ) : (
            <Popover open={profileOpen} onOpenChange={setProfileOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 pl-1 pr-1.5 sm:pr-2.5 py-1 rounded-md border border-transparent hover:border-slate-200/80 dark:hover:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2D9BF0]"
                  aria-label="User profile overview"
                >
                  <div className="relative shrink-0">
                    <Avatar
                      className={cn(
                        "h-7 w-7 transition-all",
                        userInfo.tier === "pro"
                          ? "ring-2 ring-amber-400 dark:ring-amber-400 ring-offset-1 ring-offset-background shadow-xs"
                          : "ring-1 ring-slate-200/60 dark:ring-slate-700/60"
                      )}
                    >
                      {userInfo.avatarUrl && (
                        <AvatarImage
                          src={userInfo.avatarUrl}
                          alt={userInfo.name || "Avatar"}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-gradient-to-tr from-[#2D9BF0] to-[#55B8FF] text-white font-bold text-[11px]">
                        {userInfo.name ? (
                          userInfo.name.replace(/^@/, "").charAt(0).toUpperCase()
                        ) : (
                          <User className="h-3.5 w-3.5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {userInfo.tier === "pro" && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-500 ring-1 ring-white dark:ring-slate-900"
                        title="Verified Pro Member"
                      >
                        <Sparkles className="h-1.5 w-1.5 text-white" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[130px] truncate select-none hidden sm:inline">
                    {userInfo.name || "Traveler"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-80 p-0 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] shadow-xl overflow-hidden"
              >
                {/* Profile Identity Card */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <Avatar
                        className={cn(
                          "h-11 w-11 shadow-xs",
                          userInfo.tier === "pro"
                            ? "ring-2 ring-amber-400 dark:ring-amber-400 ring-offset-2 ring-offset-background"
                            : "ring-2 ring-white dark:ring-slate-800"
                        )}
                      >
                        {userInfo.avatarUrl && (
                          <AvatarImage
                            src={userInfo.avatarUrl}
                            alt={userInfo.name || "Avatar"}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-gradient-to-tr from-[#2D9BF0] to-[#55B8FF] text-white font-bold text-sm">
                          {userInfo.name ? (
                            userInfo.name.replace(/^@/, "").charAt(0).toUpperCase()
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {userInfo.tier === "pro" && (
                        <span
                          className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 ring-1.5 ring-white dark:ring-slate-900 text-white shadow-xs"
                          title="Verified Pro Member"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {userInfo.name || "Traveler"}
                        </p>
                        {userInfo.tier === "pro" ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles className="h-2.5 w-2.5" />
                            Pro
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Free
                          </span>
                        )}
                      </div>
                      {userInfo.username && (
                        <p className="text-xs text-[#2D9BF0] dark:text-[#55B8FF] font-medium truncate mt-0.5">
                          @{userInfo.username}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details at a glance */}
                <div className="p-3.5 space-y-2.5 text-xs">
                  {/* Email */}
                  <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-400">
                    <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                        Email
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium break-all select-all">
                        {userInfo.email || "No email linked"}
                      </span>
                    </div>
                  </div>

                  {/* Currency & Trips */}
                  <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <Coins className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                          Default Currency
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {userInfo.defaultCurrency || "INR"}
                        </span>
                      </div>
                      {userInfo.totalTrips !== undefined && (
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                            Workspace Trips
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {userInfo.totalTrips} {userInfo.totalTrips === 1 ? "Trip" : "Trips"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member Since */}
                  {userInfo.memberSince && (
                    <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="text-[11px]">
                        Member since {userInfo.memberSince}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer: View & Edit Profile Link (Strictly NO sign-out) */}
                <div className="p-2.5 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80">
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-md text-xs font-semibold text-[#2D9BF0] hover:text-white bg-[#2D9BF0]/10 hover:bg-[#2D9BF0] transition-all duration-150 cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      View Profile &amp; Settings
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}

