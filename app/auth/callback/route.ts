import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { syncUserProfile } from "@/lib/auth";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Determine safe redirect path
  let next = searchParams.get("next") ?? "/dashboard";
  // Prevent open redirect attacks by ensuring "next" is a relative path starting with "/"
  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/dashboard";
  }

  const cookieStore = await cookies();

  // Helper to ensure all session cookies are explicitly attached to the redirect response
  const createRedirectWithCookies = (targetUrl: string) => {
    const response = NextResponse.redirect(targetUrl);
    cookieStore.getAll().forEach((c) => {
      response.cookies.set(c.name, c.value, c);
    });
    return response;
  };

  // Determine target origin (supporting x-forwarded-host in production)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const redirectOrigin = isLocalEnv || !forwardedHost ? origin : `https://${forwardedHost}`;

  // Handle OAuth or Supabase provider error (e.g., user cancelled Google login or stale state)
  if (error) {
    const message = errorDescription || error;
    // Check if session is already active despite provider error parameter
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        await syncUserProfile(user);
      } catch (e) {
        console.error("Profile sync error on active user:", e);
      }
      return createRedirectWithCookies(`${redirectOrigin}${next}`);
    }
    return createRedirectWithCookies(`${redirectOrigin}/auth?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();

  // 1. PKCE Code Exchange (Email confirmation link, Google OAuth callback)
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await syncUserProfile(user);
        } catch (e) {
          console.error("Profile sync error on Google sign-in:", e);
        }
      }
      return createRedirectWithCookies(`${redirectOrigin}${next}`);
    } else {
      console.warn("Auth callback code exchange warning:", exchangeError.message);
      // Resilient fallback: Check if session is already active (e.g. duplicate callback or session already established)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await syncUserProfile(user);
        } catch (e) {
          console.error("Profile sync error on active session:", e);
        }
        return createRedirectWithCookies(`${redirectOrigin}${next}`);
      }
      return createRedirectWithCookies(
        `${redirectOrigin}/auth?error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  // 2. Token Hash verification (Direct OTP / Email verification tokens)
  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!verifyError) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await syncUserProfile(user);
        } catch (e) {
          console.error("Profile sync error on OTP verify:", e);
        }
      }
      return createRedirectWithCookies(`${redirectOrigin}${next}`);
    } else {
      console.error("Auth callback token verification error:", verifyError.message);
      return createRedirectWithCookies(
        `${redirectOrigin}/auth?error=${encodeURIComponent(verifyError.message)}`
      );
    }
  }

  // Fallback: If no code or token_hash was provided, check if user has active session
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    return createRedirectWithCookies(`${redirectOrigin}${next}`);
  }

  return createRedirectWithCookies(
    `${redirectOrigin}/auth?error=${encodeURIComponent("Invalid or expired authentication link.")}`
  );
}
