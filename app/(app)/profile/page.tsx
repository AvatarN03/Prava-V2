import { Suspense } from "react";

import { AlertCircle } from "lucide-react";

import { ProfileEditor } from "@/features/profile/components/profile-editor";

import { getCurrentProfile } from "@/features/profile/actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account & Profile",
  description:
    "Manage your personal identity, locked username, regional travel preferences, and workspace settings on Prava.",
};

export default async function ProfilePage() {
  const res = await getCurrentProfile();

  if (!res.success || !res.profile) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="rounded-sm border border-destructive/20 bg-destructive/10 p-4 font-sans text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load account details. Please make sure you are signed in.</span>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center font-sans text-xs text-muted-foreground">Loading account details...</div>}>
      <ProfileEditor initialProfile={res.profile} />
    </Suspense>
  );
}
