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
import { X, Sparkles, User, Settings, FolderTree, Compass as CompassIcon, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

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
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ease-out relative cursor-pointer",
              isActive
                ? "bg-sky-50 text-sky-900 font-semibold shadow-xs shadow-[#2D9BF0]/10"
                : "text-slate-600 hover:bg-sky-50/70 hover:text-sky-900"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-transform duration-200 ease-out shrink-0",
                isActive
                  ? "text-[#2D9BF0] drop-shadow-[0_2px_4px_rgba(45,155,240,0.4)] scale-105"
                  : "text-slate-400 group-hover:text-[#2D9BF0] group-hover:scale-110"
              )}
            />
            <span className="truncate flex-1">{item.title}</span>
            {item.badge && (
              <span className="ml-auto rounded-full bg-sky-100 border border-sky-200 px-2 py-0.2 text-[10px] text-sky-800 font-bold shadow-2xs">
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
          "fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-sky-100 bg-gradient-to-b from-sky-50/50 via-slate-50/60 to-sky-50/30 backdrop-blur-md transition-transform duration-300 ease-in-out md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-15 shrink-0 items-center justify-between border-b border-sky-100/80 px-4 bg-white/80 backdrop-blur-sm">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-bold text-foreground group cursor-pointer"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg  p-1 shadow-sm shadow-[#2D9BF0]/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Image
                src="/logo.png"
                alt="Prava AI Logo"
                width={28}
                height={28}
                className="h-full w-full object-contain filter drop-shadow-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base tracking-tight font-extrabold text-slate-900">
                Prava AI
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#2D9BF0] animate-pulse shadow-xs shadow-[#2D9BF0]" />
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
        <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-none">
          {/* Group 1: Workspace */}
          <div>
            <div className="px-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-sky-900/60 flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-[#2D9BF0]" />
              Workspace
            </div>
            {renderNavGroup(workspaceNavItems)}
          </div>

          {/* Group 2: Community & Explore */}
          <div>
            <div className="px-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-sky-900/60 flex items-center gap-1.5">
              <CompassIcon className="h-3 w-3 text-[#2D9BF0]" />
              Community & Explore
            </div>
            {renderNavGroup(otherNavItems)}
          </div>
        </div>

        {/* Bottom Fixed Area: Account Section & AI Status Card */}
        <div className="shrink-0 border-t border-sky-100/80 bg-white/70 backdrop-blur-xs pt-3 pb-3 space-y-3">
          {/* Account Group */}
          <div>
            <div className="px-6 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-900/60 flex items-center gap-1.5">
              <User className="h-3 w-3 text-[#2D9BF0]" />
              Account
            </div>
            {renderNavGroup(accountNavItems)}
          </div>

          {/* AI Workspace Status Card */}
          <div className="px-3">
            <div className="rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50/90 via-white to-sky-50/60 p-2.5 shadow-xs space-y-1 transition-all duration-200 hover:border-[#2D9BF0]/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950">
                  <Sparkles className="h-3.5 w-3.5 text-[#2D9BF0] animate-pulse" />
                  <span>AI Connected</span>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D9BF0]/60 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2D9BF0]"></span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                Gemini 3.x Flash travel workspace active.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
