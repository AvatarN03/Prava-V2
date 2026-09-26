"use client";

import { useEffect, useState } from "react";

import { Moon, Sun } from "lucide";
import { MorphIcon } from "morphicons/react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  iconSize?: number;
}

export function ThemeToggle({ className, iconSize = 19 }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [displayDark, setDisplayDark] = useState<boolean | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCurrentDark = mounted && (resolvedTheme === "dark" || theme === "dark");
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

    // Delay the actual application theme switch so the morph plays smoothly
    setTimeout(() => {
      setTheme(nextTheme);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    }, 240);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            disabled={isTransitioning}
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 text-zinc-600 dark:text-zinc-300 hover:text-[#2D9BF0] dark:hover:text-[#2D9BF0] hover:bg-zinc-100 dark:bg-slate-800/40 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors rounded-sm",
              className
            )}
            aria-label="Toggle theme"
          >
            {mounted ? (
              <MorphIcon
                icon={activeDark ? Sun : Moon}
                size={iconSize}
                strokeWidth={2.2}
                className="transition-colors duration-300 text-zinc-700 dark:text-zinc-200"
                spring="snappy"
              />
            ) : (
              <div className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          <p className="text-xs">
            {activeDark ? "Switch to Light mode" : "Switch to Dark mode"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ThemeToggle;
