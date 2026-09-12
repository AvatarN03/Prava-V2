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

export interface WorkspaceCounts {
  itinerary?: number;
  accommodations?: number;
  expenses?: number;
  notes?: number;
  checklist?: { completed: number; total: number };
  links?: number;
}

interface WorkspaceNavProps {
  tripId: string;
  counts?: WorkspaceCounts;
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

export function WorkspaceNav({ tripId, counts }: WorkspaceNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Derive active tab from the current URL segment
  const activeTab =
    NAV_ITEMS.find((item) => pathname.includes(`/${item.value}`))?.value ??
    "overview";

  const handleTabChange = (value: string) => {
    router.push(`/trips/${tripId}/${value}`);
  };

  const getBadgeContent = (tabValue: string) => {
    if (!counts) return null;
    switch (tabValue) {
      case "itinerary":
        return counts.itinerary !== undefined && counts.itinerary > 0 ? String(counts.itinerary) : null;
      case "accommodations":
        return counts.accommodations !== undefined && counts.accommodations > 0 ? String(counts.accommodations) : null;
      case "expenses":
        return counts.expenses !== undefined && counts.expenses > 0
          ? `$${Math.round(counts.expenses).toLocaleString()}`
          : null;
      case "notes":
        return counts.notes !== undefined && counts.notes > 0 ? String(counts.notes) : null;
      case "checklist":
        return counts.checklist && counts.checklist.total > 0
          ? `${counts.checklist.completed}/${counts.checklist.total}`
          : null;
      case "links":
        return counts.links !== undefined && counts.links > 0 ? String(counts.links) : null;
      default:
        return null;
    }
  };

  return (
    <div className="border-b border-border bg-background">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList
          className={cn(
            "w-full h-auto justify-start rounded-none bg-transparent p-0 gap-0 overflow-x-auto no-scrollbar"
          )}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            const badge = getBadgeContent(item.value);

            return (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className={cn(
                  "group inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap cursor-pointer",
                  "rounded-none border-b-2 transition-colors duration-150",
                  "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                  "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  "data-[state=active]:text-primary data-[state=active]:border-primary",
                  "data-[state=active]:font-semibold"
                )}
              >
                <Icon
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.label}</span>
                {badge && (
                  <span
                    className={cn(
                      "ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-semibold transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
