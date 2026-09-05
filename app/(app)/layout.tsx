import { AppShell } from "@/components/app-shell/app-shell";
import { getCurrentProfile } from "@/features/profile/actions";
import { OfflineSyncProvider } from "@/lib/offline";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const res = await getCurrentProfile();
  const userId = res.success && res.profile ? res.profile.id : "";
  const offlineMode = res.success && res.profile ? res.profile.offlineMode : false;

  return (
    <OfflineSyncProvider userId={userId} initialOfflineMode={offlineMode}>
      <AppShell>{children}</AppShell>
    </OfflineSyncProvider>
  );
}

