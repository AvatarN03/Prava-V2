"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeChanger = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-8 w-full" />;
    }

    return (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-1 text-xs">
            <button
                onClick={() => setTheme("light")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 transition-all ${theme === "light"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
            </button>

            <button
                onClick={() => setTheme("dark")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 transition-all ${theme === "dark"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
            </button>

            <button
                onClick={() => setTheme("system")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 transition-all ${theme === "system"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                <Monitor className="h-3.5 w-3.5" />
                <span>System</span>
            </button>
        </div>
    );
};

export default ThemeChanger;
