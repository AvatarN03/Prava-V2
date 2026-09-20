"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ArrowRight, Menu, X } from "lucide-react";

import { AnimatedNav } from "./animated-nav";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

import type { User } from "@supabase/supabase-js";

interface LandingHeaderProps {
  user: User | null;
}

export function LandingHeader({ user }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sky-100/80 dark:border-slate-200/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8 md:px-12">
        {/* Logo & Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold tracking-tight group cursor-pointer"
        >
          <Image
            src="/logo.png"
            alt="Prava Logo"
            width={36}
            height={36}
            className="w-8 h-8 object-contain filter drop-shadow-xs transition-transform group-hover:scale-105"
            priority
          />
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Prava
          </span>
        </Link>

        {/* Desktop Navigation */}
        <AnimatedNav />

        {/* Right Actions & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="hidden sm:inline-flex">
              <Button
                size="lg"
                className="gap-2 px-5 h-10 text-sm font-semibold bg-linear-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] text-white shadow-sm shadow-[#2D9BF0]/30 transition-all cursor-pointer"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center">
              <ButtonGroup>
                <Button variant="outline" asChild className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Link href="/auth" className="text-xs font-medium">
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="px-3.5 text-sm font-semibold bg-[#2D9BF0] hover:bg-[#1D8BE0] text-white transition-all cursor-pointer shadow-xs">
                  <Link
                    href="/auth?tab=signup"
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </ButtonGroup>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-6 py-5 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#2D9BF0] transition-colors"
            >
              Features
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#2D9BF0] transition-colors"
            >
              How it Works
            </a>
            <Link
              href="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#2D9BF0] transition-colors"
            >
              Community
            </Link>
            <Link
              href="/templates"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#2D9BF0] transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/subscription"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#2D9BF0] transition-colors"
            >
              Subscription & Plans
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
            {user ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center gap-2 bg-[#2D9BF0] hover:bg-[#1D8BE0] text-white">
                  <span>Open Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/auth?tab=signup"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full justify-center gap-2 bg-[#2D9BF0] hover:bg-[#1D8BE0] text-white">
                    <span>Get Started Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
