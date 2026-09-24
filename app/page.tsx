import {
  AiAssistanceSection,
  CommunityStoriesSection,
  CorePhilosophySection,
  CtaBanner,
  ExpensesSection,
  HeroSection,
  ItinerarySection,
  LandingFooter,
  LandingHeader,
  LandscapeBanner,
  ScatteredVsUnified,
  ThesisSection,
  TravelEssentialsSection,
  WorkspaceShowcase,
} from "@/features/landing";

import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  let user = null;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    // Graceful fallback if Supabase is initializing or unconfigured
    user = null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 flex flex-col selection:bg-[#2D9BF0]/20 selection:text-[#2D9BF0] transition-colors">
      <LandingHeader user={user} />
      <main className="flex-1">
        <HeroSection user={user} />
        <ThesisSection />
        <ScatteredVsUnified />
        <WorkspaceShowcase />
        <ItinerarySection />
        <ExpensesSection />
        <TravelEssentialsSection />
        <AiAssistanceSection />
        <CommunityStoriesSection />
        <LandscapeBanner />
        <CorePhilosophySection />
        <CtaBanner user={user} />
      </main>
      <LandingFooter />
    </div>
  );
}
