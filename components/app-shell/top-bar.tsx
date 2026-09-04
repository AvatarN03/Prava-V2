import { useEffect, useState } from "react";
import { Menu, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface TopBarProps {
  onMobileMenuOpen: () => void;
}

export function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const [userInfo, setUserInfo] = useState<{
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  }>({});

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const userMeta = user.user_metadata;
          setUserInfo({
            name: userMeta?.full_name || userMeta?.name || user.email?.split("@")[0] || "Traveler",
            email: user.email,
            avatarUrl: userMeta?.avatar_url || userMeta?.picture || null,
          });
        }
      } catch (err) {
        console.error("Failed to load user in topbar:", err);
      }
    }

    loadUser();
  }, [supabase]);

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/trips")) return "Trips";
    if (pathname.startsWith("/travel-essentials")) return "Travel Essentials";
    if (pathname.startsWith("/stories")) return "Travel Stories";
    if (pathname.startsWith("/community")) return "Community Forum";
    if (pathname.startsWith("/profile")) return "Account & Settings";
    if (pathname.startsWith("/pricing")) return "Subscription & Usage";
    return "Workspace";
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 shrink-0 flex h-15 w-full items-center justify-between border-b border-sky-100/90 bg-white/90 backdrop-blur-md px-4 md:px-6">
        {/* Left: Mobile trigger & Page Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-slate-500 hover:text-slate-900 cursor-pointer"
            onClick={onMobileMenuOpen}
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right: Notifications & Logged-in User Badge */}
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-[#2D9BF0] hover:bg-sky-50 cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Notifications</p>
            </TooltipContent>
          </Tooltip>

          {/* User Profile Pill with shadcn Avatar */}
          <Link
            href="/profile"
            className="flex items-center gap-2.5 rounded-full border border-sky-200/80 bg-sky-50/70 py-1 pl-1 pr-3.5 hover:bg-sky-100/80 transition-all cursor-pointer shadow-2xs group"
            title="View Profile"
          >
            <Avatar className="h-7 w-7 border border-sky-200 shadow-xs">
              {userInfo.avatarUrl && (
                <AvatarImage src={userInfo.avatarUrl} alt={userInfo.name || "Avatar"} />
              )}
              <AvatarFallback className="bg-gradient-to-tr from-[#2D9BF0] to-[#55B8FF] text-white font-bold text-[11px]">
                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-slate-800 group-hover:text-[#2D9BF0] transition-colors max-w-[120px] truncate">
              {userInfo.name || "My Account"}
            </span>
          </Link>
        </div>
      </header>
    </TooltipProvider>
  );
}
