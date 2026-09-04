"use client";

import { ProfileWithStats } from "../actions";
import { AvatarUpload } from "@/components/storage/avatar-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Globe, Lock, Loader2 } from "lucide-react";

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
  return (
    <div className="space-y-6 max-w-3xl">
      {/* 1. Profile Picture & Summary Card */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground">Profile Picture & Identity</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Your public avatar and traveler statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AvatarUpload
                currentAvatarUrl={profile.avatarUrl}
                name={profile.fullName || profile.username}
                size="lg"
                onAvatarUpdated={onAvatarUpdated}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-foreground">
                    {profile.fullName || profile.username || "Travel Creator"}
                  </h3>
                  <Badge variant={isPublic ? "default" : "secondary"} className="text-[10px]">
                    {isPublic ? (
                      <span className="flex items-center gap-1">
                        <Globe className="h-2.5 w-2.5" /> Public Creator
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" /> Private Account
                      </span>
                    )}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-muted-foreground">
                  @{profile.username || "traveler"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-sm border border-border bg-muted/40 px-3 py-1.5 text-center min-w-[75px]">
                <div className="text-sm font-bold text-foreground">{profile.totalTrips}</div>
                <div className="text-[10px] text-muted-foreground">Total Trips</div>
              </div>
              <div className="rounded-sm border border-border bg-muted/40 px-3 py-1.5 text-center min-w-[75px]">
                <div className="text-sm font-bold text-primary">{profile.publishedTrips}</div>
                <div className="text-[10px] text-muted-foreground">Published</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Personal Details Form Card */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-foreground">Personal Details</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Your full name is editable anytime. Your username is a locked permanent identifier.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <Input
              type="text"
              placeholder="e.g. Maya Lin"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-9 text-xs"
              disabled={isSaving}
            />
          </div>

          {/* Username (Read-Only Locked) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-muted-foreground" />
                Username (Permanent Identifier)
              </label>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Locked
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground text-xs font-mono select-none">@</span>
              <Input
                type="text"
                disabled
                value={profile.username || "traveler"}
                className="h-9 pl-7 font-mono text-xs bg-muted/60 text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Your unique handle: <span className="font-mono text-foreground font-medium">prava.app/u/{profile.username || "username"}</span>
            </p>
          </div>

          {/* Email (Read-Only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email Address</label>
            <Input
              type="email"
              disabled
              value={profile.email}
              className="h-9 text-xs bg-muted/60 text-muted-foreground cursor-not-allowed"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Bio / Travel Philosophy</label>
            <Textarea
              placeholder="Tell travelers about your favorite destinations or planning habits..."
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="text-xs resize-none"
              disabled={isSaving}
            />
          </div>

          {/* Public Creator Toggle */}
          <div className="rounded-sm border border-border bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  Public Creator Profile
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
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
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-3 pb-4 px-6 border-t border-border/60">
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            size="sm"
            className="cursor-pointer"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            Save Account Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
