import {
  BookOpen,
  Compass,
  CreditCard,
  LayoutDashboard,
  LucideIcon,
  ShieldAlert,
  Sparkles,
  User,
  Users,
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
    title: "Community",
    href: "/community",
    icon: Users,
    badge: "Active",
  },
  {
    title: "Stories",
    href: "/stories",
    icon: BookOpen,
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
    badge: "AI",
  },
  {
    title: "Subscription",
    href: "/pricing",
    icon: CreditCard,
  },
];

// Backwards compatibility aliases if needed
export const mainNavItems = [...workspaceNavItems, ...otherNavItems];
export const secondaryNavItems = accountNavItems;

