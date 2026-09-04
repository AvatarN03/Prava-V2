import { Suspense } from "react";
import { getCurrentProfile } from "@/features/profile/actions";
import { ProfileEditor } from "@/features/profile/components/profile-editor";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account — Prava AI",
  description:
    "Manage your personal identity, locked username, AI credits usage, and workspace preferences on Prava AI.",
};

export default async function ProfilePage() {
  const res = await getCurrentProfile();

  if (!res.success || !res.profile) {
    return (
      <div className="rounded-sm border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Failed to load account details. Please make sure you are signed in.</span>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading account details...</div>}>
      <ProfileEditor initialProfile={res.profile} />
    </Suspense>
  );
}

