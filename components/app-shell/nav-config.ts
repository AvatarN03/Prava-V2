import {
  BookOpen,
  Compass,
  CreditCard,
  LayoutDashboard,
  LayoutTemplate,
  LucideIcon,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const workspaceNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Trips",
    href: "/trips",
    icon: Compass,
  },
  {
    title: "Travel Essentials",
    href: "/travel-essentials",
    icon: ShieldAlert,
  },
];

export const otherNavItems: NavItem[] = [
  {
    title: "Forum",
    href: "/forum",
    icon: MessageSquare,
  },
  {
    title: "Stories",
    href: "/stories",
    icon: BookOpen,
  },
  {
    title: "Templates",
    href: "/templates",
    icon: LayoutTemplate,
  },
];

export const accountNavItems: NavItem[] = [
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Usage",
    href: "/usage",
    icon: Sparkles,
  },
  {
    title: "Subscription",
    href: "/subscription",
    icon: CreditCard,
  },
];

// Backwards compatibility aliases if needed
export const mainNavItems = [...workspaceNavItems, ...otherNavItems];
export const secondaryNavItems = accountNavItems;

