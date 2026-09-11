import {
  CtaBanner,
  FeatureHighlights,
  HeroSection,
  InteractiveMockup,
  LandingFooter,
  LandingHeader,
  WorkflowSection,
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
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary transition-colors">
      <LandingHeader user={user} />
      <main className="flex-1">
        <HeroSection user={user} />
        <InteractiveMockup />
        <FeatureHighlights />
        <WorkflowSection />
        <CtaBanner user={user} />
      </main>
      <LandingFooter />
    </div>
  );
}
