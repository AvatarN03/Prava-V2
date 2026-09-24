"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ArrowRight, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { User } from "@supabase/supabase-js";

interface LandingHeaderProps {
  user: User | null;
}

export function LandingHeader({ user }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-[#FAFAF9]/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-zinc-950 dark:text-zinc-50 cursor-pointer text-lg"
        >
          <Image
            src="/logo.png"
            alt="Prava"
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
            priority
          />
          <span>Prava</span>
        </Link>

        {/* Center Editorial Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-normal text-zinc-600 dark:text-zinc-400">
          <a
            href="#workspace"
            className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            Workspace
          </a>
          <a
            href="#community"
            className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            Community
          </a>
          <a
            href="#travel-tools"
            className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            Travel Tools
          </a>
          <Link
            href="/pricing"
            className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            Pricing
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="hidden sm:inline-flex">
              <Button
                size="sm"
                className="bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-xs font-medium px-4 h-8 rounded-sm gap-1.5 cursor-pointer shadow-none"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-5">
              <Link
                href="/auth"
                className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </Link>
              <Button
                asChild
                size="sm"
                className="bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-xs font-medium px-4 h-8 rounded-sm gap-1.5 cursor-pointer shadow-none transition-all"
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
            className="md:hidden p-1.5 rounded-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-[#FAFAF9] dark:bg-zinc-950 px-6 py-5 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <a
              href="#workspace"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
            >
              Workspace
            </a>
            <a
              href="#community"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
            >
              Community
            </a>
            <a
              href="#travel-tools"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
            >
              Travel Tools
            </a>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
            >
              Pricing
            </Link>
          </nav>
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
            {user ? (
              <Button asChild className="w-full bg-zinc-950 text-white rounded-sm text-xs">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild className="w-full rounded-sm text-xs border-zinc-300">
                  <Link href="/auth">Sign In</Link>
                </Button>
                <Button asChild className="w-full bg-zinc-950 text-white rounded-sm text-xs">
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
