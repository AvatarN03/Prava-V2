"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const navItems = [
    {
        label: "Features",
        href: "#features",
        type: "anchor",
    },
    {
        label: "How it Works",
        href: "#workflow",
        type: "anchor",
    },
    {
        label: "Community",
        href: "/community",
        type: "link",
    },
    {
        label: "Templates",
        href: "/templates",
        type: "link",
    },
    {
        label: "Pricing",
        href: "/pricing",
        type: "link",
    },
];

export function AnimatedNav() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    const hoveredItem =
        hoveredIndex !== null ? itemRefs.current[hoveredIndex] : null;

    return (
        <nav
            onMouseLeave={() => setHoveredIndex(null)}
            className="
        relative hidden lg:flex items-center gap-1
        text-sm font-light
        bg-slate-50/80
        dark:bg-slate-900/80
        border border-slate-200/70
        dark:border-slate-800/70
        px-2 py-1
        rounded-md
        shadow-2xs
      "
        >
            {/* Sliding hover background */}
            <div
                className="
          pointer-events-none
          absolute
          top-1
          left-0
          h-[calc(100%-0.5rem)]
          rounded-md
          bg-sky-50
          dark:bg-sky-950
          transition-all
          duration-200
          ease-out
        "
                style={{
                    opacity: hoveredItem ? 1 : 0,
                    width: hoveredItem?.offsetWidth ?? 0,
                    transform: hoveredItem
                        ? `translateX(${hoveredItem.offsetLeft}px)`
                        : "translateX(0)",
                }}
            />

            {navItems.map((item, index) => {
                const commonClassName = `
          relative z-10
          px-3.5 py-1.5
          rounded-md
          transition-colors duration-150
          ${hoveredIndex === index
                        ? "text-sky-900 dark:text-sky-300"
                        : "text-slate-600 dark:text-slate-300"
                    }
        `;

                if (item.type === "anchor") {
                    return (
                        <a
                            key={item.href}
                            ref={(el) => {
                                itemRefs.current[index] = el;
                            }}
                            href={item.href}
                            onMouseEnter={() => setHoveredIndex(index)}
                            className={commonClassName}
                        >
                            {item.label}
                        </a>
                    );
                }

                return (
                    <Link
                        key={item.href}
                        ref={(el) => {
                            itemRefs.current[index] = el;
                        }}
                        href={item.href}
                        onMouseEnter={() => setHoveredIndex(index)}
                        className={commonClassName}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}