"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  workspaceNavItems,
  otherNavItems,
  accountNavItems,
  NavItem,
} from "./nav-config";
import { cn } from "@/lib/utils";
import { X, Sparkles, User, Layers, Compass as CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeChanger } from "./theme-changer";

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
              isActive
                ? "bg-primary/10 text-primary font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-transform duration-150 shrink-0",
                isActive
                  ? "text-primary scale-105"
                  : "text-muted-foreground/70 group-hover:text-primary group-hover:scale-110"
              )}
            />
            <span className="truncate flex-1">{item.title}</span>
            {item.badge && (
              <span className="ml-auto rounded-full bg-primary/10 border border-primary/20 px-2 py-0.2 text-[10px] text-primary font-bold shadow-2xs">
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
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Fixed Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card/95 backdrop-blur-md transition-transform duration-300 ease-in-out md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-15 shrink-0 items-center justify-between border-b border-border px-4 bg-card/80 backdrop-blur-sm">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-bold text-foreground group cursor-pointer"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg p-1 shadow-xs transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Prava AI Logo"
                width={28}
                height={28}
                className="h-full w-full object-contain filter drop-shadow-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base tracking-tight font-extrabold text-foreground">
                Prava AI
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-xs" />
            </div>
          </Link>

          {onMobileClose && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onMobileClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>

        {/* Scrollable Middle Navigation Groups */}
        <div className="flex-1 bg-card overflow-y-auto py-4 space-y-6 scrollbar-none">
          {/* Group 1: Workspace */}
          <div>
            <div className="px-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-primary" />
              Workspace
            </div>
            {renderNavGroup(workspaceNavItems)}
          </div>

          {/* Group 2: Community & Explore */}
          <div>
            <div className="px-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CompassIcon className="h-3 w-3 text-primary" />
              Community & Explore
            </div>
            {renderNavGroup(otherNavItems)}
          </div>
        </div>

        {/* Bottom Fixed Area: Account Section, Theme Changer & AI Status Card */}
        <div className="shrink-0 border-t border-border bg-card/95 backdrop-blur-xs pt-3 pb-3 space-y-2.5">
          {/* Account Group */}
          <div>
            <div className="px-6 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="h-3 w-3 text-primary" />
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
            <div className="rounded-lg border border-border bg-muted/40 p-2.5 shadow-xs space-y-1 transition-all duration-200 hover:border-primary/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                  <span>AI Connected</span>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">
                Gemini 3.x Flash travel workspace active.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
