"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import {
  accountNavItems,
  NavItem,
  otherNavItems,
  workspaceNavItems,
} from "@/components/app-shell/nav-config";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const renderNavGroup = (items: NavItem[]) => (
    <nav className="space-y-1 pl-0 pr-3">
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
              "group flex items-center gap-2.5 rounded-l-none rounded-r-md pl-4 pr-3 py-2 text-xs font-normal transition-all duration-200 ease-in-out relative cursor-pointer",
              // Opposite-theme styling: In light mode, sidebar is dark; in dark mode, sidebar is light
              isActive
                ? "bg-[#2D9BF0] text-white/90  shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-100/15 hover:translate-x-0.5 dark:text-slate-600 dark:hover:text-slate-950 dark:hover:bg-slate-200 dark:hover:translate-x-0.5"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-transform duration-200 shrink-0",
                isActive
                  ? "text-white scale-105"
                  : "text-slate-400 group-hover:text-white group-hover:scale-110 dark:text-slate-500 dark:group-hover:text-slate-900"
              )}
            />
            <span className="truncate flex-1">{item.title}</span>
            {item.badge && (
              <span
                className={cn(
                  "ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-medium shadow-2xs",
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

      {/* Sidebar Container: Static flex child on desktop, fixed overlay drawer on mobile */}
      <aside
        className={cn(
          "w-52 shrink-0 flex flex-col transition-transform duration-300 ease-in-out",
          // Mobile fixed drawer styling
          "fixed inset-y-0 left-0 z-40 bg-[#090E1A] text-slate-200 border-r border-[#152033] dark:bg-slate-100 dark:text-slate-900 dark:border-slate-300",
          // Desktop flex child styling (seamless transparent background matching outer shell)
          "md:static md:translate-x-0 md:bg-transparent md:border-r-0 dark:md:bg-transparent dark:md:border-r-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#152033] dark:border-slate-300 px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold group cursor-pointer"
          >
            <div className="relative flex h-8 w-8 items-end justify-center rounded-lg p-1 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Prava AI Logo"
                width={26}
                height={26}
                className="h-full w-full object-contain filter drop-shadow-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-md font-light text-white dark:text-slate-900">
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
            <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500/90 select-none">
              Workspace
            </div>
            {renderNavGroup(workspaceNavItems)}
          </div>

          {/* Group 2: Explore */}
          <div>
            <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500/90 select-none">
              Explore
            </div>
            {renderNavGroup(otherNavItems)}
          </div>
        </div>

        {/* Bottom Area: Account Section (No border, with generous bottom padding) */}
        <div className="shrink-0 pt-2 pb-8 md:pb-10">
          <div>
            <div className="px-4 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500/90 select-none">
              Account
            </div>
            {renderNavGroup(accountNavItems)}
          </div>
        </div>
      </aside>
    </>
  );
}


