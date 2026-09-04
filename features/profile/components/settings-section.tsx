"use client";

import { ProfileWithStats } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut, Loader2, KeyRound, CheckCircle2 } from "lucide-react";

interface SettingsSectionProps {
  profile: ProfileWithStats;
  onSignOut: () => void;
  isSigningOut: boolean;
}

export function SettingsSection({
  profile,
  onSignOut,
  isSigningOut,
}: SettingsSectionProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* 1. Account Security & Verification */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-primary/10 border border-primary/20 text-primary">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Security & Credentials</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Manage your authenticated identity and active workspace sessions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-3.5 text-xs">
          <div className="rounded-sm border border-border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">Primary Account Email</p>
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 gap-1 px-1.5 py-0"
                >
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Verified
                </Badge>
              </div>
              <p className="text-muted-foreground font-mono text-[11px]">{profile.email || "No email bound"}</p>
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              Managed via Supabase Auth
            </p>
          </div>

          <div className="rounded-sm border border-border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                <p className="font-semibold text-foreground">Authentication Provider</p>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Secure passwordless magic-link and OAuth SSO session tokens
              </p>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              Supabase Auth v2
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Session Management */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-destructive/10 border border-destructive/20 text-destructive">
              <LogOut className="h-3.5 w-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Session Management</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Sign out of your active traveler session across this client browser.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">Active Browser Session</p>
              <p className="text-muted-foreground text-[11px]">
                Clears stored Supabase session tokens and refreshes application state
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="h-8 rounded-sm text-xs gap-1.5 cursor-pointer shrink-0"
            >
              {isSigningOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

