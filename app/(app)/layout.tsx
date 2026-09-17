import { AppShell } from "@/components/app-shell/app-shell";

import { WorkspaceAiProvider } from "@/features/trip-workspace/context/workspace-ai-context";
import { OfflineSyncProvider } from "@/lib/offline";

import { getCurrentProfile } from "@/features/profile/actions";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const res = await getCurrentProfile();
  const userId = res.success && res.profile ? res.profile.id : "";
  const offlineMode = res.success && res.profile ? res.profile.offlineMode : false;
  const userAvatarUrl = res.success && res.profile ? res.profile.avatarUrl : null;

  return (
    <OfflineSyncProvider userId={userId} initialOfflineMode={offlineMode}>
      <WorkspaceAiProvider userAvatarUrl={userAvatarUrl}>
        <AppShell>{children}</AppShell>
      </WorkspaceAiProvider>
    </OfflineSyncProvider>
  );
}


