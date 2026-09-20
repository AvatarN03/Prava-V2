"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import {
  Bell,
  BookOpen,
  Compass,
  CreditCard,
  LayoutDashboard,
  LayoutTemplate,
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
}

export function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const pathname = usePathname();
  const supabase = createClient();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<TopBarUserInfo>({
    name: "Traveler",
    email: null,
    avatarUrl: null,
    username: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        setLoading(true);
        // Fetch verified user profile with avatar from Postgres database
        const res = await getTopBarUserInfo();
        if (res.success && res.data && isMounted) {
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
          setUserInfo({
            name:
              userMeta.full_name ||
              userMeta.name ||
              user.email?.split("@")[0] ||
              "Traveler",
            email: user.email || null,
            avatarUrl: userMeta.avatar_url || userMeta.picture || null,
            username: userMeta.username || null,
          });
        }
      } catch (err) {
        console.error("Failed to load user in topbar:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    // Listen for custom profile update events (e.g. after uploading a new avatar)
    const handleProfileUpdate = () => {
      loadUser();
    };
    window.addEventListener("prava-profile-updated", handleProfileUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("prava-profile-updated", handleProfileUpdate);
    };
  }, [supabase, pathname]);

  const getPageInfo = () => {
    if (pathname.startsWith("/dashboard")) {
      return { title: "Prava Dashboards", icon: LayoutDashboard };
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
            <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-sky-50 dark:bg-sky-950/40 text-[#2D9BF0] border border-sky-200/60 dark:border-sky-800/40 shadow-2xs shrink-0">
              <PageIcon className="h-4 w-4" />
            </div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
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

          {/* User Profile (Avatar and Name with Loading Skeleton & Fallback) */}
          {loading ? (
            <div className="flex items-center gap-2 pl-1 pr-1" aria-busy="true" aria-label="Loading profile">
              <Skeleton className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-3.5 w-16 rounded bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-1 pr-1">
              <Avatar className="h-7 w-7 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
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
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[130px] truncate select-none hidden sm:inline">
                {userInfo.name || "Traveler"}
              </span>
            </div>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}

