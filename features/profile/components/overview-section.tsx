"use client";

import Link from "next/link";

import { Globe, Lock, Loader2, Save, ExternalLink } from "lucide-react";

import { AvatarUpload } from "@/components/storage/avatar-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { ProfileWithStats } from "../actions";

interface OverviewSectionProps {
  profile: ProfileWithStats;
  fullName: string;
  setFullName: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  isPublic: boolean;
  setIsPublic: (val: boolean) => void;
  onAvatarUpdated: (url: string | null) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function OverviewSection({
  profile,
  fullName,
  setFullName,
  bio,
  setBio,
  isPublic,
  setIsPublic,
  onAvatarUpdated,
  onSave,
  isSaving,
}: OverviewSectionProps) {
  const hasUnsavedChanges =
    fullName.trim() !== (profile.fullName || "").trim() ||
    bio.trim() !== (profile.bio || "").trim() ||
    isPublic !== profile.isPublic;

  return (
    <div className="space-y-6 w-full">
      {/* 1. Profile Picture & Summary Card */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="font-sans text-sm font-semibold text-foreground">Profile Picture & Identity</CardTitle>
          <CardDescription className="font-sans text-xs text-muted-foreground">
            Your public avatar and traveler statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AvatarUpload
                currentAvatarUrl={profile.avatarUrl}
                name={profile.fullName || profile.username}
                size="lg"
                onAvatarUpdated={onAvatarUpdated}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-sans text-base font-semibold text-foreground">
                    {profile.fullName || profile.username || "Travel Creator"}
                  </h3>
                  <Badge variant={profile.isPublic ? "default" : "secondary"} className="text-[10px]">
                    {profile.isPublic ? (
                      <span className="flex items-center gap-1">
                        <Globe className="h-2.5 w-2.5" /> Public Creator
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" /> Private Account
                      </span>
                    )}
                  </Badge>
                  {isPublic !== profile.isPublic && (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40"
                    >
                      Pending Save ({isPublic ? "Will be Public" : "Will be Private"})
                    </Badge>
                  )}
                </div>
                <p className="font-sans text-xs font-mono text-muted-foreground">
                  @{profile.username || "traveler"}
                </p>
              </div>
            </div>

            {/* Live Platform Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
              <div
                className="rounded-sm border border-border bg-muted/30 px-3 py-1.5 text-center min-w-[80px]"
                title="Total created personal and collaborative trips"
              >
                <div className="font-sans text-sm font-bold text-foreground tabular-nums">
                  {profile.totalTrips ?? 0}
                </div>
                <div className="font-sans text-[10px] font-medium text-muted-foreground">Total Trips</div>
              </div>

              <div
                className="rounded-sm border border-border bg-muted/30 px-3 py-1.5 text-center min-w-[80px]"
                title="Trips published to Community Templates"
              >
                <div className="font-sans text-sm font-bold text-[#2D9BF0] tabular-nums">
                  {profile.publishedTrips ?? 0}
                </div>
                <div className="font-sans text-[10px] font-medium text-muted-foreground">Trip Templates</div>
              </div>

              <div
                className="rounded-sm border border-border bg-muted/30 px-3 py-1.5 text-center min-w-[80px]"
                title="Travel stories and guides written"
              >
                <div className="font-sans text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {profile.publishedStories ?? 0}
                </div>
                <div className="font-sans text-[10px] font-medium text-muted-foreground">Stories</div>
              </div>

              <div
                className="rounded-sm border border-border bg-muted/30 px-3 py-1.5 text-center min-w-[80px]"
                title="Discussion threads started in Traveler Forum"
              >
                <div className="font-sans text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {profile.forumDiscussions ?? 0}
                </div>
                <div className="font-sans text-[10px] font-medium text-muted-foreground">Discussions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Personal Details Form Card */}
      <Card className="rounded-sm border border-border bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="font-sans text-sm font-semibold text-foreground">Personal Details</CardTitle>
          <CardDescription className="font-sans text-xs text-muted-foreground">
            Your full name is editable anytime. Your username is a locked permanent identifier.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-foreground">Full Name</label>
            <Input
              type="text"
              placeholder="e.g. Maya Lin"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-9 font-sans text-xs rounded-sm"
              disabled={isSaving}
            />
          </div>

          {/* Username (Read-Only Locked) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-sans text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-muted-foreground" />
                Username (Permanent Identifier)
              </label>
              <span className="font-sans text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Locked
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground text-xs font-mono select-none">@</span>
              <Input
                type="text"
                disabled
                value={profile.username || "traveler"}
                className="h-9 pl-7 font-mono text-xs bg-muted/60 text-muted-foreground cursor-not-allowed rounded-sm"
              />
            </div>
            <p className="font-sans text-[11px] text-muted-foreground">
              Your unique handle: <span className="font-mono text-foreground font-medium">prava.app/u/{profile.username || "username"}</span>
            </p>
          </div>

          {/* Email (Read-Only) */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-foreground">Email Address</label>
            <Input
              type="email"
              disabled
              value={profile.email}
              className="h-9 font-sans text-xs bg-muted/60 text-muted-foreground cursor-not-allowed rounded-sm"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-foreground">Bio / Travel Philosophy</label>
            <Textarea
              placeholder="Tell travelers about your favorite destinations or planning habits..."
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="font-sans text-xs resize-none rounded-sm"
              disabled={isSaving}
            />
          </div>

          {/* Public Creator Toggle */}
          <div className="rounded-sm border border-border bg-muted/30 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <div className="font-sans text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-[#2D9BF0]" />
                  Public Creator Profile
                </div>
                <p className="font-sans text-[11px] text-muted-foreground leading-relaxed">
                  Allow other travelers to view your public profile and cloned itineraries at <span className="font-mono font-medium text-foreground">/u/{profile.username || "username"}</span>.
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="cursor-pointer"
                disabled={isSaving}
              />
            </div>

            <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div className="font-sans text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-foreground">Current State:</span>
                {isPublic ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Public (Enabled)
                  </span>
                ) : (
                  <span className="text-muted-foreground font-medium">
                    Private (Hidden from public)
                  </span>
                )}
                {isPublic !== profile.isPublic && (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    — Click &quot;Save Configurations&quot; to apply
                  </span>
                )}
              </div>

              {profile.isPublic && profile.username ? (
                <Link href={`/u/${profile.username}`} target="_blank" className="shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 font-sans text-[11px] gap-1 text-[#2D9BF0] hover:text-[#2D9BF0] hover:bg-[#2D9BF0]/10 cursor-pointer"
                  >
                    <Globe className="h-3 w-3" />
                    View as Public Visitor
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Button>
                </Link>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled
                  className="h-7 px-2 font-sans text-[11px] gap-1 text-muted-foreground opacity-60 cursor-not-allowed shrink-0"
                  title="Profile is private. Save configurations to enable public viewing."
                >
                  <Lock className="h-3 w-3" />
                  View as Public Visitor (Disabled)
                </Button>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-4 px-6 border-t border-border/60">
          <div>
            {hasUnsavedChanges ? (
              <p className="font-sans text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                You have unsaved changes. Click Save Configurations to update.
              </p>
            ) : (
              <p className="font-sans text-[11px] text-muted-foreground">
                All personal details are up to date.
              </p>
            )}
          </div>
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            size="sm"
            className={`h-9 px-4 rounded-sm font-sans text-xs font-semibold gap-1.5 shadow-xs hover:shadow transition-all active:scale-[0.99] bg-[#2D9BF0] hover:bg-[#2587D3] text-white border border-[#2D9BF0]/30 w-full sm:w-auto ${
              isSaving || !hasUnsavedChanges
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            Save Configurations
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
