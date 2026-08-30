import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  Globe,
  MapPin,
  CheckCircle2,
  Share2,
  BookOpen,
  CreditCard,
  Zap,
} from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { redirect } from "next/navigation";
import { AnimatedNav } from "@/components/app-shell/nav-Items";

export default async function HomePage() {
  let user = null;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    // Graceful fallback if Supabase is initializing
    user = null;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-black text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Enhanced Broader Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-sky-100/90 dark:border-sky-900/90 bg-transparent backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8 md:px-12">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight group cursor-pointer">
            <Image
              src="/logo.png"
              alt="Prava AI Logo"
              width={36}
              height={36}
              className="w-8 h-8 object-contain filter drop-shadow-xs"
              priority
            />
            <span className="text-base font-semibold tracking-wide tracking-tight text-slate-900 dark:text-sky-400">
              Prava AI
            </span>
          </Link>

          <AnimatedNav />

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 px-5 h-10 text-sm font-semibold bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] shadow-sm shadow-[#2D9BF0]/30 transition-all cursor-pointer">
                  <span>Go to Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (


              <ButtonGroup>
                <Button className="dark:bg-slate-800">
                  <Link href="/auth" className="text-xs ">
                    Sign In
                  </Link>
                </Button>
                <Button className=" px-3  text-sm font-semibold bg-sky-500 flex items-center  transition-all cursor-pointer">
                  <Link
                    href="/auth?tab=signup"
                    className="flex items-center gap-2 text-xs text-slate-900"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </ButtonGroup>
            )}
          </div>
        </div>
      </header >

      {/* Main Content */}
      < main className="flex-1" >
        {/* Hero Section with #2D9BF0 Radiant Ambient Glow */}
        < section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-border/60" >
          {/* Subtle Ambient Gradient Orbs */}
          < div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 h-72 w-[600px] rounded-full bg-gradient-to-tr from-[#2D9BF0]/20 via-[#67C2FF]/15 to-transparent blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-5xl px-6 sm:px-8 text-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/90 bg-gradient-to-r from-sky-50 to-blue-50/80 px-3.5 py-1 text-xs font-semibold text-sky-900 mb-6 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-[#2D9BF0]" />
              <span>Workspace-First Travel OS • Powered by Gemini AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
              Plan trips with precision.{" "}
              <span className="bg-gradient-to-r from-[#2D9BF0] via-[#43ABF8] to-[#0E6EB8] bg-clip-text text-transparent">
                Governed by you
              </span>
              , accelerated by AI.
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Prava AI combines structured workspaces, real-time travel essentials, and governed AI proposals.
              AI assists with suggestions and calculations—you remain in complete control.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {user ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 px-7 h-12 text-sm font-semibold bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] shadow-md shadow-[#2D9BF0]/30 transition-all cursor-pointer">
                    <span>Open Your Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login?tab=signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto gap-2 px-7 h-12 text-sm font-semibold bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] shadow-md shadow-[#2D9BF0]/30 transition-all cursor-pointer">
                      <span>Start Planning Free</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/community" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto px-7 h-12 text-sm font-medium border-slate-300 hover:bg-sky-50 hover:text-sky-900 transition-colors cursor-pointer">
                      Explore Public Itineraries
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Value Guarantees */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#2D9BF0]" />
                <span>No unsolicited AI overrides</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#2D9BF0]" />
                <span>1-Click deep cloning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#2D9BF0]" />
                <span>PostgreSQL durability</span>
              </div>
            </div>

            {/* Interactive Workspace Preview Mockup */}
            <div className="mt-14 mx-auto max-w-4xl text-left">
              <div className="rounded-xl border border-sky-100 bg-card shadow-lg shadow-sky-900/5 overflow-hidden">
                {/* Mock Window Header */}
                <div className="flex items-center justify-between border-b border-border bg-slate-50/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    <span className="ml-2 text-xs font-mono text-slate-500">
                      prava://trips/kyoto-autumn-2026
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="planning" className="text-[10px] px-2 py-0.5 bg-sky-100 text-sky-800 border-sky-200">
                      Planning
                    </Badge>
                  </div>
                </div>

                {/* Mock Workspace Interior */}
                <div className="p-5 sm:p-7 space-y-5 bg-white">
                  {/* Trip Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-bold text-slate-900">Kyoto & Tokyo Cultural Expedition</h3>
                        <Badge variant="secondary" className="text-xs bg-sky-50 text-sky-800 border-sky-200">7 Days</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#2D9BF0]" /> Japan • Oct 14 – Oct 21, 2026
                      </p>
                    </div>

                    {/* Fake Workspace Tab Bar */}
                    <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg text-xs font-medium text-slate-600 overflow-x-auto">
                      <span className="px-3 py-1 rounded-md bg-white text-slate-900 shadow-2xs font-semibold">Overview</span>
                      <span className="px-3 py-1 rounded-md">Itinerary</span>
                      <span className="px-3 py-1 rounded-md">Stays</span>
                      <span className="px-3 py-1 rounded-md">Expenses</span>
                      <span className="px-3 py-1 rounded-md">Essentials</span>
                    </div>
                  </div>

                  {/* Split Workspace View */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left: Itinerary Preview */}
                    <div className="md:col-span-2 space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Day 1 — Arashiyama & Bamboo Groves
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                          <div className="text-xs font-mono font-bold text-[#2D9BF0] shrink-0 mt-0.5">08:30</div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-semibold text-slate-900">Arashiyama Bamboo Grove Walk</div>
                            <div className="text-[11px] text-slate-500">Early morning walk before crowd peaks. Est. 1.5 hrs</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                          <div className="text-xs font-mono font-bold text-[#2D9BF0] shrink-0 mt-0.5">11:00</div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-semibold text-slate-900">Tenryu-ji Zen Temple & Gardens</div>
                            <div className="text-[11px] text-slate-500">UNESCO World Heritage Site with authentic vegetarian lunch</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                          <div className="text-xs font-mono font-bold text-[#2D9BF0] shrink-0 mt-0.5">15:00</div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-semibold text-slate-900">Traditional Matcha Tea Ceremony</div>
                            <div className="text-[11px] text-slate-500">Camellia Tea House reservation confirmed</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: AI Proposal Card */}
                    <div className="rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50/80 via-white to-sky-50/40 p-4 space-y-3 flex flex-col justify-between shadow-2xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950">
                          <Sparkles className="h-3.5 w-3.5 text-[#2D9BF0]" />
                          <span>AI Structured Proposal</span>
                        </div>
                        <p className="text-[11px] text-sky-900 leading-relaxed">
                          "I noticed your evening is free on Day 1. Would you like to add an illumination walk at Gion?"
                        </p>
                        <div className="rounded-lg border border-sky-200/90 bg-white p-2.5 text-[11px] space-y-1 shadow-2xs">
                          <div className="font-semibold text-slate-900">+ Add Activity (18:30)</div>
                          <div className="text-slate-500 text-[10px]">Gion Lantern District Evening Stroll</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button className="flex-1 rounded-lg bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] px-3 py-1.5 text-[11px] font-semibold text-white hover:from-[#1D8BE0] hover:to-[#0D6AB9] transition-all shadow-2xs cursor-pointer">
                          Accept
                        </button>
                        <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section >

        {/* Feature Highlights Grid */}
        < section id="features" className="py-16 md:py-24 bg-slate-50/50 border-b border-border/60" >
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Built for Travelers Who Value Structure
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Everything you need to orchestrate complex international journeys without bloated feeds or algorithmic distractions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="rounded-xl border border-sky-100 bg-white p-5 space-y-3 shadow-2xs hover:border-[#2D9BF0]/40 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-sky-50 text-[#2D9BF0] flex items-center justify-center">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">7-Tab Workspaces</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Dedicated tabs for Itineraries, Stays, Expenses, Notes, Checklists, Links, and AI Assistant.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-xl border border-sky-100 bg-white p-5 space-y-3 shadow-2xs hover:border-[#2D9BF0]/40 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-sky-50 text-[#2D9BF0] flex items-center justify-center">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Governed AI Actions</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  AI generates structured mutation proposals. You review and approve before anything is committed to your database.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-xl border border-sky-100 bg-white p-5 space-y-3 shadow-2xs hover:border-[#2D9BF0]/40 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-sky-50 text-[#2D9BF0] flex items-center justify-center">
                  <Globe className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Travel Essentials</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Live multi-currency calculator, real-time destination weather, REST Countries data, and maps.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-xl border border-sky-100 bg-white p-5 space-y-3 shadow-2xs hover:border-[#2D9BF0]/40 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-sky-50 text-[#2D9BF0] flex items-center justify-center">
                  <Share2 className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">1-Click Deep Cloning</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Browse community trips and templates. Clone full itineraries, stays, and checklists directly into your workspace.
                </p>
              </div>
            </div>
          </div>
        </section >

        {/* How It Works Section */}
        < section id="workflow" className="py-16 md:py-24" >
          <div className="mx-auto max-w-5xl px-6 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                How Prava AI Works
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                From initial destination concept to execution on the ground.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3 text-center md:text-left">
                <div className="text-xs font-mono font-bold text-[#2D9BF0]">STEP 01</div>
                <h3 className="text-base font-bold text-slate-900">Create Your Trip Workspace</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Set your destination, dates, and budget. Initialize a fresh workspace or clone a curated itinerary from the community.
                </p>
              </div>

              <div className="space-y-3 text-center md:text-left">
                <div className="text-xs font-mono font-bold text-[#2D9BF0]">STEP 02</div>
                <h3 className="text-base font-bold text-slate-900">Collaborate with AI Assistant</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ask AI to structure day-by-day activities, optimize schedules, or suggest accommodations. Review structured diffs before accepting.
                </p>
              </div>

              <div className="space-y-3 text-center md:text-left">
                <div className="text-xs font-mono font-bold text-[#2D9BF0]">STEP 03</div>
                <h3 className="text-base font-bold text-slate-900">Execute with Confidence</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Access packing checklists, currency rates, emergency contacts, and maps offline or on mobile during your journey.
                </p>
              </div>
            </div>

            {/* Bottom Callout Banner */}
            <div className="mt-16 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/70 via-white to-sky-50/50 p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Ready to take control of your travels?</h3>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                No credit card required. Free instant access with your workspace ready in seconds.
              </p>
              <div className="pt-2">
                <Link href={user ? "/dashboard" : "/login?tab=signup"}>
                  <Button size="lg" className="gap-2 px-7 h-12 text-sm font-semibold bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] shadow-md shadow-[#2D9BF0]/30 transition-all cursor-pointer">
                    <span>{user ? "Open Your Workspace" : "Get Started Free"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section >
      </main >

      {/* Clean Footer with Official Logo */}
      < footer className="border-t border-sky-100 bg-white py-8 text-xs text-slate-500" >
        <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-[#2D9BF0] to-[#55B8FF] p-0.5 shadow-2xs">
              <Image
                src="/logo.png"
                alt="Prava AI Logo"
                width={20}
                height={20}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-bold text-slate-900">Prava AI</span>
            <span>— Workspace First, AI Second.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/stories" className="hover:text-sky-700 transition-colors cursor-pointer">
              Stories
            </Link>
            <Link href="/community" className="hover:text-sky-700 transition-colors cursor-pointer">
              Community
            </Link>
            <Link href="/pricing" className="hover:text-sky-700 transition-colors cursor-pointer">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-sky-700 transition-colors cursor-pointer">
              Sign In
            </Link>
            <span className="text-slate-400">© {new Date().getFullYear()} Prava AI</span>
          </div>
        </div>
      </footer >
    </div >
  );
}
