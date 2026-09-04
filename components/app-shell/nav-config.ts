import {
  LayoutDashboard,
  Compass,
  Users,
  ShieldAlert,
  BookOpen,
  User,
  CreditCard,
  LucideIcon,
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
    title: "My Trips",
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
    title: "Community Forum",
    href: "/community",
    icon: Users,
    badge: "Active",
  },
  {
    title: "Travel Stories",
    href: "/stories",
    icon: BookOpen,
  },
];

export const accountNavItems: NavItem[] = [
  {
    title: "Account",
    href: "/profile",
    icon: User,
  },
  {
    title: "Subscription & Usage",
    href: "/pricing",
    icon: CreditCard,
    badge: "Quota",
  },
];

// Backwards compatibility aliases if needed
export const mainNavItems = [...workspaceNavItems, ...otherNavItems];
export const secondaryNavItems = accountNavItems;
