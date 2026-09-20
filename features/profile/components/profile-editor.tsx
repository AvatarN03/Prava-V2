"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";
import {
  Globe,
  ExternalLink,
  User,
  SlidersHorizontal,
  Shield,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { OverviewSection } from "./overview-section";
import { GeneralSection } from "./general-section";
import { SettingsSection } from "./settings-section";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { ProfileWithStats, updateProfile, updateGeneralPreferences } from "../actions";

type TabKey = "overview" | "general" | "security";

interface ProfileEditorProps {
  initialProfile: ProfileWithStats;
}

const NAV_ITEMS: { id: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: User },
  { id: "general", label: "General", icon: SlidersHorizontal },
  { id: "security", label: "Security", icon: Shield },
];

export function ProfileEditor({ initialProfile }: ProfileEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<ProfileWithStats>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile.fullName || "");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [isPublic, setIsPublic] = useState(initialProfile.isPublic);

  // General & Workspace Preferences (Loaded from Database)
  const [defaultCurrency, setDefaultCurrency] = useState(initialProfile.defaultCurrency || "INR");
  const [aiAutoPropose, setAiAutoPropose] = useState(initialProfile.aiAutoPropose ?? true);
  const [emailNotifications, setEmailNotifications] = useState(initialProfile.emailNotifications ?? true);
  const [offlineMode, setOfflineMode] = useState(initialProfile.offlineMode ?? false);
  const [travelPreferences, setTravelPreferences] = useState(initialProfile.travelPreferences || "");

  // Tab State with URL query parameter synchronization
  const tabFromQuery = searchParams.get("tab") as TabKey | null;
  const validInitialTab: TabKey =
    tabFromQuery === "general" || tabFromQuery === "security"
      ? tabFromQuery
      : tabFromQuery === ("settings" as TabKey)
        ? "general"
        : "overview";

  const [activeTab, setActiveTab] = useState<TabKey>(validInitialTab);
  const [isSaving, startSaving] = useTransition();
  const [isSavingAiPreferences, startSavingAiPreferences] = useTransition();
  const [isUpdatingNotification, setIsUpdatingNotification] = useState(false);
  const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (tabFromQuery) {
      if (tabFromQuery === "overview" || tabFromQuery === "general" || tabFromQuery === "security") {
        setActiveTab(tabFromQuery);
      } else if ((tabFromQuery as string) === "settings") {
        setActiveTab("general");
      }
    }
  }, [tabFromQuery]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab === "overview") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  };

  const handleSaveProfile = () => {
    const hasUnsavedChanges =
      fullName.trim() !== (profile.fullName || "").trim() ||
      bio.trim() !== (profile.bio || "").trim() ||
      isPublic !== profile.isPublic;

    if (!hasUnsavedChanges) {
      toast.info("No personal details changes to save.");
      return;
    }

    startSaving(async () => {
      const res = await updateProfile({
        fullName: fullName.trim() || null,
        bio: bio.trim() || null,
        isPublic,
      });

      if (res.success && res.profile) {
        setProfile((prev) => ({
          ...prev,
          fullName: res.profile.fullName,
          bio: res.profile.bio,
          isPublic: res.profile.isPublic,
        }));
        toast.success("Account configurations saved successfully.");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("prava-profile-updated"));
        }
      } else {
        toast.error(res.error || "Failed to save changes.");
      }
    });
  };

  const handleUpdateCurrency = async (newCurrency: string) => {
    setDefaultCurrency(newCurrency);
    setIsUpdatingCurrency(true);
    try {
      const res = await updateGeneralPreferences({
        defaultCurrency: newCurrency,
        aiAutoPropose,
        offlineMode,
        travelPreferences: travelPreferences.trim() || null,
        emailNotifications,
      });

      if (res.success && res.profile) {
        setProfile((prev) => ({
          ...prev,
          defaultCurrency: (res.profile as unknown as { defaultCurrency?: string }).defaultCurrency || newCurrency,
        }));
        toast.success(`Default currency updated to ${newCurrency}.`);
      } else {
        toast.error(res.error || "Failed to update default currency.");
      }
    } catch {
      toast.error("Failed to update default currency.");
    } finally {
      setIsUpdatingCurrency(false);
    }
  };

  const handleSaveAiPreferences = (aiData: {
    aiAutoPropose: boolean;
    offlineMode: boolean;
    travelPreferences: string;
  }) => {
    startSavingAiPreferences(async () => {
      const res = await updateGeneralPreferences({
        defaultCurrency,
        emailNotifications,
        aiAutoPropose: aiData.aiAutoPropose,
        offlineMode: aiData.offlineMode,
        travelPreferences: aiData.travelPreferences.trim() || null,
      });

      if (res.success && res.profile) {
        setProfile((prev) => ({
          ...prev,
          aiAutoPropose: (res.profile as unknown as { aiAutoPropose?: boolean }).aiAutoPropose ?? aiData.aiAutoPropose,
          offlineMode: (res.profile as unknown as { offlineMode?: boolean }).offlineMode ?? aiData.offlineMode,
          travelPreferences: (res.profile as unknown as { travelPreferences?: string | null }).travelPreferences || aiData.travelPreferences,
        }));
        toast.success("AI assistant preferences & offline settings saved to database.");
      } else {
        toast.error(res.error || "Failed to save AI preferences.");
      }
    });
  };

  const handleUpdateNotification = async (checked: boolean) => {
    setEmailNotifications(checked);
    setIsUpdatingNotification(true);
    try {
      const res = await updateGeneralPreferences({
        defaultCurrency,
        aiAutoPropose,
        offlineMode,
        travelPreferences: travelPreferences.trim() || null,
        emailNotifications: checked,
      });

      if (res.success && res.profile) {
        setProfile((prev) => ({
          ...prev,
          emailNotifications: (res.profile as unknown as { emailNotifications?: boolean }).emailNotifications ?? checked,
        }));
        toast.success(
          checked
            ? "Trip departure reminders enabled in database."
            : "Trip departure reminders disabled in database."
        );
      } else {
        toast.error(res.error || "Failed to update reminder settings.");
        setEmailNotifications(!checked);
      }
    } catch {
      toast.error("Failed to update reminder settings.");
      setEmailNotifications(!checked);
    } finally {
      setIsUpdatingNotification(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Signed out successfully.");
      router.push("/auth");
      router.refresh();
    } catch {
      toast.error("Failed to sign out.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const publicProfileUrl = profile.username ? `/u/${profile.username}` : null;

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Account & Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your personal traveler identity, regional defaults, travel preferences, and session security.
          </p>
        </div>

        {profile.isPublic && publicProfileUrl ? (
          <Link href={publicProfileUrl} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              View Public Page
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="gap-1.5 text-xs cursor-not-allowed opacity-50"
            title="Public profile is disabled for private accounts. Enable Public Creator Profile and click Save Configurations to activate."
          >
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            View Public Page (Private)
          </Button>
        )}
      </div>

      {/* ── DESKTOP / TABLET: GITHUB-STYLE VERTICAL SIDEBAR LAYOUT ── */}
      <div className="hidden md:flex items-start gap-8">
        {/* Left Vertical Navigation Sidebar */}
        <aside className="w-56 shrink-0 space-y-1">
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </p>
          <nav className="space-y-1" aria-label="Account Settings Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-xs rounded-sm transition-colors text-left cursor-pointer",
                    isActive
                      ? "bg-secondary text-secondary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Selected Section Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "overview" && (
            <OverviewSection
              profile={profile}
              fullName={fullName}
              setFullName={setFullName}
              bio={bio}
              setBio={setBio}
              isPublic={isPublic}
              setIsPublic={setIsPublic}
              onAvatarUpdated={(url) => setProfile((p) => ({ ...p, avatarUrl: url }))}
              onSave={handleSaveProfile}
              isSaving={isSaving}
            />
          )}

          {activeTab === "general" && (
            <GeneralSection
              profile={profile}
              defaultCurrency={defaultCurrency}
              onUpdateCurrency={handleUpdateCurrency}
              isUpdatingCurrency={isUpdatingCurrency}
              aiAutoPropose={aiAutoPropose}
              setAiAutoPropose={setAiAutoPropose}
              offlineMode={offlineMode}
              setOfflineMode={setOfflineMode}
              travelPreferences={travelPreferences}
              setTravelPreferences={setTravelPreferences}
              onSaveAiPreferences={handleSaveAiPreferences}
              isSavingAiPreferences={isSavingAiPreferences}
              emailNotifications={emailNotifications}
              onUpdateNotification={handleUpdateNotification}
              isUpdatingNotification={isUpdatingNotification}
            />
          )}

          {activeTab === "security" && (
            <SettingsSection
              profile={profile}
              onSignOut={handleSignOut}
              isSigningOut={isSigningOut}
            />
          )}
        </div>
      </div>

      {/* ── MOBILE: ONE CONTINUOUS CONSOLIDATED ACCOUNT EXPERIENCE ── */}
      <div className="block md:hidden space-y-10">
        {/* 1. Overview */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Overview
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Profile details and public creator settings
            </p>
          </div>
          <OverviewSection
            profile={profile}
            fullName={fullName}
            setFullName={setFullName}
            bio={bio}
            setBio={setBio}
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            onAvatarUpdated={(url) => setProfile((p) => ({ ...p, avatarUrl: url }))}
            onSave={handleSaveProfile}
            isSaving={isSaving}
          />
        </div>

        {/* 2. General */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              General Preferences
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Currency, regional defaults, AI assistants, and notification reminders
            </p>
          </div>
          <GeneralSection
            profile={profile}
            defaultCurrency={defaultCurrency}
            onUpdateCurrency={handleUpdateCurrency}
            isUpdatingCurrency={isUpdatingCurrency}
            aiAutoPropose={aiAutoPropose}
            setAiAutoPropose={setAiAutoPropose}
            offlineMode={offlineMode}
            setOfflineMode={setOfflineMode}
            travelPreferences={travelPreferences}
            setTravelPreferences={setTravelPreferences}
            onSaveAiPreferences={handleSaveAiPreferences}
            isSavingAiPreferences={isSavingAiPreferences}
            emailNotifications={emailNotifications}
            onUpdateNotification={handleUpdateNotification}
            isUpdatingNotification={isUpdatingNotification}
          />
        </div>

        {/* 3. Security */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Security & Session
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Account authentication provider and active session logout
            </p>
          </div>
          <SettingsSection
            profile={profile}
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
          />
        </div>
      </div>
    </div>
  );
}


