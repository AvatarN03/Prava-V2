"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Compass as CompassIcon,
  Layers,
  Sparkles,
  User,
  X,
} from "lucide-react";

import {
  accountNavItems,
  NavItem,
  otherNavItems,
  workspaceNavItems,
} from "@/components/app-shell/nav-config";
import { ThemeChanger } from "@/components/app-shell/theme-changer";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const renderNavGroup = (items: NavItem[]) => (
    <nav className="space-y-1 px-3">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMobileClose}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 relative cursor-pointer",
              // Opposite-theme styling: In light mode, sidebar is dark; in dark mode, sidebar is light
              isActive
                ? "bg-[#2D9BF0] text-white shadow-xs font-semibold"
                : "text-slate-400 hover:text-white hover:bg-white/10 dark:text-slate-600 dark:hover:text-slate-950 dark:hover:bg-slate-200/80"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-transform duration-150 shrink-0",
                isActive
                  ? "text-white scale-105"
                  : "text-slate-400 group-hover:text-white group-hover:scale-110 dark:text-slate-500 dark:group-hover:text-slate-900"
              )}
            />
            <span className="truncate flex-1">{item.title}</span>
            {item.badge && (
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold shadow-2xs",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-slate-300 dark:bg-slate-300 dark:text-slate-800"
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Fixed Sidebar Container with Opposite-Theme Styling: Dark in light mode, Light in dark mode */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col transition-transform duration-300 ease-in-out md:translate-x-0",
          // Light mode: deep dark navy; Dark mode: light slate
          "bg-[#090E1A] text-slate-200 border-r border-[#152033] dark:bg-slate-100 dark:text-slate-900 dark:border-r dark:border-slate-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#152033] dark:border-slate-300 px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-bold group cursor-pointer"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg p-1 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Prava AI Logo"
                width={28}
                height={28}
                className="h-full w-full object-contain filter drop-shadow-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base tracking-tight font-extrabold text-white dark:text-slate-900">
                Prava AI
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#2D9BF0] animate-pulse shadow-xs" />
            </div>
          </Link>

          {onMobileClose && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 text-slate-400 hover:text-white dark:text-slate-600 dark:hover:text-slate-900"
              onClick={onMobileClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>

        {/* Scrollable Middle Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-none">
          {/* Group 1: Workspace */}
          <div>
            <div className="px-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-[#2D9BF0]" />
              Workspace
            </div>
            {renderNavGroup(workspaceNavItems)}
          </div>

          {/* Group 2: Community & Explore */}
          <div>
            <div className="px-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <CompassIcon className="h-3 w-3 text-[#2D9BF0]" />
              Community & Explore
            </div>
            {renderNavGroup(otherNavItems)}
          </div>
        </div>

        {/* Bottom Fixed Area: Account Section, Theme Changer & AI Status Card */}
        <div className="shrink-0 border-t border-[#152033] dark:border-slate-300 pt-3 pb-3 space-y-2.5">
          {/* Account Group */}
          <div>
            <div className="px-6 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <User className="h-3 w-3 text-[#2D9BF0]" />
              Account
            </div>
            {renderNavGroup(accountNavItems)}
          </div>

          {/* Theme Changer Switcher */}
          <div className="px-3">
            <ThemeChanger />
          </div>

          {/* AI Workspace Status Card */}
          <div className="px-3">
            <div className="rounded-lg border border-[#1E293B] bg-[#0E1726] dark:border-slate-300 dark:bg-white p-2.5 shadow-xs space-y-1 transition-all duration-200 hover:border-[#2D9BF0]/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white dark:text-slate-900">
                  <Sparkles className="h-3.5 w-3.5 text-[#2D9BF0] animate-pulse" />
                  <span>AI Connected</span>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D9BF0]/60 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2D9BF0]"></span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-snug">
                Gemini 2.5 Flash travel workspace active.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
