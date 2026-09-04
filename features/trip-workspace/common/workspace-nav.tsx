"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  ListTodo,
  BedDouble,
  Receipt,
  FileText,
  CheckSquare,
  Link2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface WorkspaceNavProps {
  tripId: string;
}

const NAV_ITEMS = [
  { label: "Overview",      value: "overview",       icon: Compass,     },
  { label: "Itinerary",     value: "itinerary",      icon: ListTodo,    },
  { label: "Accommodation", value: "accommodations", icon: BedDouble,   },
  { label: "Expenses",      value: "expenses",       icon: Receipt,     },
  { label: "Notes",         value: "notes",          icon: FileText,    },
  { label: "Checklist",     value: "checklist",      icon: CheckSquare, },
  { label: "Links",         value: "links",          icon: Link2,       },
];

export function WorkspaceNav({ tripId }: WorkspaceNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Derive active tab from the current URL segment
  const activeTab =
    NAV_ITEMS.find((item) => pathname.includes(`/${item.value}`))?.value ??
    "overview";

  const handleTabChange = (value: string) => {
    router.push(`/trips/${tripId}/${value}`);
  };

  return (
    <div className="border-b border-border bg-background">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList
          className={cn(
            // Override default muted pill shape → use a flat underline-style strip
            "w-full h-auto justify-start rounded-none bg-transparent p-0 gap-0 overflow-x-auto no-scrollbar"
          )}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className={cn(
                  // Base
                  "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap",
                  "rounded-none border-b-2 transition-colors duration-150",
                  // Inactive
                  "border-transparent text-muted-foreground",
                  "hover:text-foreground hover:border-border",
                  // Active — override Radix data-[state=active] defaults
                  "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  "data-[state=active]:text-primary data-[state=active]:border-primary",
                  "data-[state=active]:font-semibold"
                )}
              >
                <Icon
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {item.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
