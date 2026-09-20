"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  KeyRound,
  Mail,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Layers,
  User,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

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
          // If auto-confirm is enabled in Supabase
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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-primary/20 selection:text-primary">
      <div className="mx-auto w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Feature Column (Visible on Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 w-fit">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Workspace First, AI Second</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight leading-tight">
            Intelligent travel planning with complete deterministic control.
          </h2>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-foreground">Dedicated Workspace Tabs</h4>
                <p className="text-xs text-muted-foreground">
                  Coordinate itineraries, stays, expenses, and notes in one synchronized hub.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-sky-100 text-sky-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-foreground">Governed AI Proposals</h4>
                <p className="text-xs text-muted-foreground">
                  AI generates structured suggestions; you review and approve every change.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-foreground">PostgreSQL Persistence</h4>
                <p className="text-xs text-muted-foreground">
                  Your application owns memory and state with zero data lock-in to LLM providers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Form Column */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md space-y-6">
            {/* Top back link */}
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Home
              </Link>
            </div>

            {/* Brand Header */}
            <div className="flex flex-col items-center sm:items-start space-y-1">
              <Link href="/" className="flex items-center gap-2.5 mb-2 group cursor-pointer">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2D9BF0] to-[#55B8FF] p-1 shadow-md shadow-[#2D9BF0]/25 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/logo.png"
                    alt="Prava Logo"
                    width={32}
                    height={32}
                    className="h-full w-full object-contain filter drop-shadow-xs"
                  />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">Prava</span>
              </Link>
              <h1 className="text-2xl font-bold tracking-tight">
                {isSignUp ? "Create your workspace account" : "Welcome back"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isSignUp
                  ? "Sign up to start organizing trips with structured AI assistance"
                  : "Sign in to access your trips, workspaces, and custom itineraries"}
              </p>
            </div>

            {/* Error banner if URL parameter contains error */}
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {/* Auth Card */}
            <Card className="border-border shadow-xs">
              {/* Tab switch buttons */}
              <div className="grid grid-cols-2 border-b border-border bg-muted/30 p-1 rounded-t-sm">
                <button
                  type="button"
                  disabled={isActionDisabled}
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage(null);
                  }}
                  className={`py-2 text-xs font-semibold rounded-xs transition-all cursor-pointer ${
                    !isSignUp
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
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
                  className={`py-2 text-xs font-semibold rounded-xs transition-all cursor-pointer ${
                    isSignUp
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <CardContent className="pt-6 space-y-4">
                {/* Google OAuth Button */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={isActionDisabled}
                  onClick={handleGoogleSignIn}
                  className="w-full h-10 font-medium text-xs border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  {oauthLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
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

                {/* Divider */}
                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-card px-2 text-[11px] text-muted-foreground uppercase tracking-wider shrink-0 font-medium">
                    Or continue with email
                  </span>
                  <div className="border-t border-slate-200 w-full" />
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" /> Full Name
                      </label>
                      <Input
                        type="text"
                        required
                        disabled={isActionDisabled}
                        autoFocus
                        placeholder="e.g. Maya Lin"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-10"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email address
                    </label>
                    <Input
                      type="email"
                      required
                      disabled={isActionDisabled}
                      autoFocus={!isSignUp}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-muted-foreground" /> Password
                      </label>
                      {isSignUp && (
                        <span className="text-[11px] text-muted-foreground">Min. 6 characters</span>
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
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
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
                    className="w-full h-10 font-semibold shadow-xs bg-[#2D9BF0] hover:bg-[#1279CE] text-white transition-colors cursor-pointer"
                    disabled={isActionDisabled}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSignUp ? "Create Workspace Account" : "Sign In to Workspace"}
                  </Button>
                </form>

                <div className="pt-2 border-t border-border text-center text-xs text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
                  <button
                    type="button"
                    disabled={isActionDisabled}
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setErrorMessage(null);
                    }}
                    className="font-semibold text-primary hover:underline underline-offset-2 cursor-pointer"
                  >
                    {isSignUp ? "Sign In instead" : "Create one free"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
