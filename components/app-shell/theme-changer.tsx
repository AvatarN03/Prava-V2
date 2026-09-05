"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeChanger({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-full rounded-md bg-muted/40 animate-pulse" />;
  }

  return (
    <div
      className={`flex items-center justify-between rounded-lg border border-border bg-muted/40 p-1 text-xs ${
        className || ""
      }`}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-xs transition-all cursor-pointer ${
          theme === "light"
            ? "bg-background text-foreground shadow-xs font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Sun className="h-3.5 w-3.5 text-amber-500" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-xs transition-all cursor-pointer ${
          theme === "dark"
            ? "bg-background text-foreground shadow-xs font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Moon className="h-3.5 w-3.5 text-sky-400" />
        <span>Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-xs transition-all cursor-pointer ${
          theme === "system"
            ? "bg-background text-foreground shadow-xs font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
        <span>System</span>
      </button>
    </div>
  );
}

export default ThemeChanger;
