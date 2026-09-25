"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";

import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import type { User } from "@supabase/supabase-js";

interface LandingHeaderProps {
  user: User | null;
}

export function LandingHeader({ user }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSectionTheme, setActiveSectionTheme] = useState<"light" | "dark">("light");
  const [activeSectionAlwaysDark, setActiveSectionAlwaysDark] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect which section is currently positioned beneath the sticky navbar
  const evaluateNavbarTheme = useCallback(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section, [data-nav-theme]")
    );
    if (!sections.length) return;

    // Viewport position just beneath the 64px navbar
    const navTriggerY = 56;
    let detectedTheme: "light" | "dark" = "light";
    let detectedAlwaysDark = false;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= navTriggerY && rect.bottom > navTriggerY) {
        const navThemeAttr = section.getAttribute("data-nav-theme");
        const alwaysDarkAttr = section.getAttribute("data-always-dark") === "true";

        if (navThemeAttr === "dark") {
          detectedTheme = "dark";
        } else if (navThemeAttr === "light") {
          detectedTheme = "light";
        } else {
          detectedTheme = section.className.includes("dark:bg") ? "dark" : "light";
        }

        detectedAlwaysDark = alwaysDarkAttr;
        break;
      }
    }

    setActiveSectionTheme(detectedTheme);
    setActiveSectionAlwaysDark(detectedAlwaysDark);
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          evaluateNavbarTheme();
          ticking = false;
        });
        ticking = true;
      }
    };

    evaluateNavbarTheme();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", evaluateNavbarTheme, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", evaluateNavbarTheme);
    };
  }, [evaluateNavbarTheme]);

  // The navbar turns dark text->light text when the section is dark AND the page is in dark mode,
  // OR if the section itself has an inherently dark surface (such as the photographic LandscapeBanner).
  const isNavDark = mounted && (
    activeSectionAlwaysDark || (resolvedTheme === "dark" && activeSectionTheme === "dark")
  );

  // Smooth scroll to top when clicking the brand logo
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    if (window.location.hash) {
      window.history.pushState(null, "", window.location.pathname);
    }
  };

  // Smooth scroll to specific landing sections with sticky offset
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      window.history.pushState(null, "", `#${targetId}`);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur-md backdrop-saturate-150 transition-all duration-300",
        isNavDark
          ? "border-b border-zinc-800/80 bg-zinc-950/75 shadow-md shadow-black/20"
          : "border-b border-zinc-200/60 bg-white/80 shadow-2xs"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        {/* Brand with Smooth Scroll to Top */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="group flex items-center gap-3 cursor-pointer"
          aria-label="Scroll to top"
        >
          <Image
            src="/logo.png"
            alt="Prava"
            width={26}
            height={26}
            className="w-6.5 h-6.5 object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <span
            className={cn(
              "font-brand font-medium tracking-[0.26em] text-base sm:text-lg uppercase transition-colors duration-300",
              isNavDark ? "text-zinc-50" : "text-zinc-950"
            )}
          >
            Prava
          </span>
        </Link>

        {/* Center Editorial Links with Dynamic Theme Color Transition */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-normal">
          {[
            { id: "workspace", label: "Workspace" },
            { id: "travel-tools", label: "Travel Tools" },
            { id: "community", label: "Community" },
            { id: "pricing", label: "Pricing" },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className={cn(
                "transition-colors duration-300 cursor-pointer",
                isNavDark
                  ? "text-zinc-400 hover:text-white"
                  : "text-zinc-600 hover:text-zinc-950"
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Group */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          {user ? (
            <Link href="/dashboard" className="hidden sm:inline-flex">
              <Button
                size="sm"
                className={cn(
                  "text-xs font-medium px-4 h-8 rounded-sm gap-1.5 cursor-pointer shadow-none transition-all duration-300",
                  isNavDark
                    ? "bg-zinc-100 text-zinc-950 hover:bg-white"
                    : "bg-zinc-950 text-white hover:bg-black"
                )}
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-5">
              <Link
                href="/auth"
                className={cn(
                  "text-xs font-medium transition-colors duration-300 cursor-pointer",
                  isNavDark
                    ? "text-zinc-300 hover:text-white"
                    : "text-zinc-600 hover:text-zinc-950"
                )}
              >
                Sign In
              </Link>
              <Button
                asChild
                size="sm"
                className={cn(
                  "text-xs font-medium px-4 h-8 rounded-sm gap-1.5 cursor-pointer shadow-none transition-all duration-300",
                  isNavDark
                    ? "bg-zinc-100 text-zinc-950 hover:bg-white"
                    : "bg-zinc-950 text-white hover:bg-black"
                )}
              >
                <Link href="/auth?tab=signup">
                  <span>Start Planning</span>
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={cn(
              "md:hidden p-1.5 rounded-sm transition-colors duration-300 cursor-pointer",
              isNavDark
                ? "text-zinc-300 hover:bg-zinc-800"
                : "text-zinc-600 hover:bg-zinc-100"
            )}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={cn(
            "md:hidden border-t backdrop-blur-lg px-6 py-5 space-y-4 transition-colors duration-300",
            isNavDark
              ? "border-zinc-800/80 bg-zinc-950/90 text-zinc-200"
              : "border-zinc-200/80 bg-white/90 text-zinc-800"
          )}
        >
          <nav className="flex flex-col space-y-3 text-sm font-medium">
            {[
              { id: "workspace", label: "Workspace" },
              { id: "travel-tools", label: "Travel Tools" },
              { id: "community", label: "Community" },
              { id: "pricing", label: "Pricing" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={cn(
                  "py-1 cursor-pointer transition-colors duration-200",
                  isNavDark ? "hover:text-white" : "hover:text-zinc-950"
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div
            className={cn(
              "pt-2 border-t flex flex-col gap-2",
              isNavDark ? "border-zinc-800" : "border-zinc-200"
            )}
          >
            {user ? (
              <Button
                asChild
                className={cn(
                  "w-full rounded-sm text-xs",
                  isNavDark ? "bg-zinc-100 text-zinc-950" : "bg-zinc-950 text-white"
                )}
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  asChild
                  className={cn(
                    "w-full rounded-sm text-xs",
                    isNavDark ? "border-zinc-700 text-zinc-200" : "border-zinc-300"
                  )}
                >
                  <Link href="/auth">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className={cn(
                    "w-full rounded-sm text-xs",
                    isNavDark ? "bg-zinc-100 text-zinc-950" : "bg-zinc-950 text-white"
                  )}
                >
                  <Link href="/auth?tab=signup">Start Planning</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
