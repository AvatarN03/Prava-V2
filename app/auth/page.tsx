"use client";

import { Suspense, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Compass,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AuthBackgroundPattern } from "./auth-background-pattern";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "signup";
  const [isSignUp, setIsSignUp] = useState(initialTab);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("tab") === "signup") {
      setIsSignUp(true);
    } else if (searchParams.get("tab") === "signin") {
      setIsSignUp(false);
    }

    const errorParam = searchParams.get("error");
    if (errorParam) {
      setErrorMessage(errorParam);
      toast.error(errorParam, { id: "auth-error-param" });
    }
  }, [searchParams]);

  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    try {
      setOauthLoading(true);
      setErrorMessage(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setErrorMessage(error.message);
        setOauthLoading(false);
      }
    } catch {
      toast.error("Failed to initialize Google Sign In. Please try again.");
      setOauthLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          toast.error("Please enter your full name.");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          toast.error("Password must be at least 6 characters long.");
          setLoading(false);
          return;
        }

        // Generate clean username base from full name or email
        const baseUsername = fullName
          .toLowerCase()
          .trim()
          .replace(/[\s-]+/g, "_")
          .replace(/[^a-z0-9_]/g, "")
          .slice(0, 18);

        const generatedUsername =
          baseUsername && baseUsername.length >= 3
            ? `${baseUsername}_${Math.floor(10 + Math.random() * 90)}`
            : `traveler_${Math.floor(1000 + Math.random() * 9000)}`;

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName.trim(),
              name: fullName.trim(),
              username: generatedUsername,
            },
          },
        });

        if (signUpError) {
          toast.error(signUpError.message);
          setErrorMessage(signUpError.message);
        } else if (data?.session) {
          toast.success("Account created successfully!");
          router.push("/dashboard");
          router.refresh();
        } else {
          toast.info(
            "Account created! Please check your email to confirm your registration.",
            {
              duration: 6000,
            }
          );
          setFullName("");
          setEmail("");
          setPassword("");
          setShowPassword(false);
          setIsSignUp(false);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          toast.error(signInError.message);
          setErrorMessage(signInError.message);
        } else {
          toast.success("Welcome back!");
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch {
      toast.error("An unexpected authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isActionDisabled = loading || oauthLoading;

  return (
    <div className="relative min-h-screen bg-[#FAFAF9] dark:bg-[#070B12] text-zinc-950 dark:text-zinc-50 flex flex-col selection:bg-[#2D9BF0]/20 selection:text-[#2D9BF0] transition-colors overflow-hidden">
      {/* Fluent Animated Canvas Waves & Ambient Radial Glow (Hero/CTA Style) */}
      <AuthBackgroundPattern />

      {/* Background Subtle Grid Texture */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] z-0"
        aria-hidden="true"
      />

      {/* Minimalist Top Navigation */}
      <header className="relative z-20 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#070B12]/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-12">
          {/* Brand Wordmark */}
          <Link
            href="/"
            className="group flex items-center gap-3 cursor-pointer"
            aria-label="Back to Prava home"
          >
            <Image
              src="/logo.png"
              alt="Prava Logo"
              width={26}
              height={26}
              className="w-6.5 h-6.5 object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <span className="font-brand font-medium tracking-[0.26em] text-base uppercase text-zinc-950 dark:text-zinc-50 transition-colors">
              Prava
            </span>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors cursor-pointer px-2.5 py-1.5 rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Feature & Narrative Column (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-4">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px] font-sans w-fit">
                <span>Prava Access</span>
                <span>·</span>
                <span className="text-[#2D9BF0]">Workspace</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.18] break-words">
                Plan the route.
                <span className="block font-serif italic font-normal text-zinc-900 dark:text-zinc-100 mt-1 sm:mt-1.5">
                  Keep the journey moving.
                </span>
              </h2>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-md pt-0.5">
                The structured travel workspace where multi-day itineraries, stays, expenses, and travel essentials stay coordinated without the chaos.
              </p>
            </div>

            {/* Curated Mini Journey Preview Card */}
            <div className="rounded-md border border-zinc-200/90 dark:border-zinc-800/90 bg-white/90 dark:bg-zinc-900/70 p-5 shadow-xs space-y-4 backdrop-blur-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#2D9BF0]/10 text-[#2D9BF0]">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold tracking-wider uppercase text-zinc-900 dark:text-zinc-100 block">
                      Ladakh Expedition
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-mono">
                      34.1526° N, 77.5771° E · 8 Days
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60 font-medium">
                  Workspace Active
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2.5 rounded-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-semibold text-[#2D9BF0]">06:30</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">Sunrise Prayers at Thiksey</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Indus Ridge</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2.5 rounded-sm bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-semibold text-[#2D9BF0]">11:00</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">Khardung La Pass Crossing</span>
                  </div>
                  <span className="text-[10px] text-sky-700 dark:text-sky-300 font-medium">5,359m Summit</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Postgres persistence · AI governed</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">₹42,500 tracked</span>
              </div>
            </div>

            {/* Feature Reassurance Badges */}
            <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-zinc-500 dark:text-zinc-400 font-sans">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#2D9BF0]" /> Free 10-trip tier
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#2D9BF0]" /> Offline sync ready
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#2D9BF0]" /> Zero credit card required
              </span>
            </div>
          </div>

          {/* Right Auth Form Column */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-md rounded-md border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/80 p-6 sm:p-8 shadow-xs backdrop-blur-xs space-y-6">
              
              {/* Form Header */}
              <div className="space-y-1.5">
                <h1 className="text-2xl font-light tracking-tight text-zinc-950 dark:text-zinc-50">
                  {isSignUp ? "Create your workspace account" : "Welcome back"}
                </h1>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal">
                  {isSignUp
                    ? "Sign up to start organizing trips with structured AI assistance."
                    : "Sign in to access your trips, workspaces, and custom itineraries."}
                </p>
              </div>

              {/* Segment Tab Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-sm bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 text-xs">
                <button
                  type="button"
                  disabled={isActionDisabled}
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage(null);
                  }}
                  className={cn(
                    "py-1.5 text-xs font-medium rounded-xs transition-all cursor-pointer",
                    !isSignUp
                      ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-2xs font-semibold"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200"
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  disabled={isActionDisabled}
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage(null);
                  }}
                  className={cn(
                    "py-1.5 text-xs font-medium rounded-xs transition-all cursor-pointer",
                    isSignUp
                      ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-2xs font-semibold"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200"
                  )}
                >
                  Create Account
                </button>
              </div>

              {/* Error banner if URL parameter or action contains error */}
              {errorMessage && (
                <div className="rounded-sm border border-red-200 dark:border-red-900/50 bg-red-50/90 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-400 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Google OAuth Button */}
              <Button
                type="button"
                variant="outline"
                disabled={isActionDisabled}
                onClick={handleGoogleSignIn}
                className="w-full h-10 font-medium text-xs rounded-sm border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-2xs flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
              >
                {oauthLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                ) : (
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {oauthLoading
                    ? "Connecting to Google..."
                    : isSignUp
                    ? "Sign up with Google"
                    : "Continue with Google"}
                </span>
              </Button>

              {/* Minimalist Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] font-sans font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest shrink-0">
                  Or continue with email
                </span>
                <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-zinc-400" /> Full Name
                    </label>
                    <Input
                      type="text"
                      required
                      disabled={isActionDisabled}
                      autoFocus
                      placeholder="e.g. Maya Lin"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10 rounded-sm border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-200 placeholder:text-zinc-400"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" /> Email address
                  </label>
                  <Input
                    type="email"
                    required
                    disabled={isActionDisabled}
                    autoFocus={!isSignUp}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 rounded-sm border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-200 placeholder:text-zinc-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 text-zinc-400" /> Password
                    </label>
                    {isSignUp && (
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Min. 6 characters</span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isActionDisabled}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 pr-10 rounded-sm border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-200 placeholder:text-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 focus:outline-none cursor-pointer p-0.5"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 font-medium text-xs rounded-sm shadow-xs bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition-all cursor-pointer flex items-center justify-center gap-2"
                  disabled={isActionDisabled}
                >
                  {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  {isSignUp ? "Create Workspace Account" : "Sign In to Workspace"}
                </Button>
              </form>

              {/* Inline Switcher Footer */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-center text-xs text-zinc-500 dark:text-zinc-400">
                {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
                <button
                  type="button"
                  disabled={isActionDisabled}
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMessage(null);
                  }}
                  className="font-medium text-zinc-950 dark:text-zinc-50 hover:underline underline-offset-4 cursor-pointer ml-1"
                >
                  {isSignUp ? "Sign In instead" : "Create one free"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#070B12] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#2D9BF0]" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}

