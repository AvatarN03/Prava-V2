import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

  // Handle OAuth or Supabase provider error (e.g., user cancelled Google login)
  if (error) {
    const message = errorDescription || error;
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();

  // 1. PKCE Code Exchange (Email confirmation link, Google OAuth callback)
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error("Auth callback code exchange error:", exchangeError.message);
      return NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent(exchangeError.message)}`
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
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error("Auth callback token verification error:", verifyError.message);
      return NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent(verifyError.message)}`
      );
    }
  }

  // Fallback: If no code or token_hash was provided
  return NextResponse.redirect(
    `${origin}/auth?error=${encodeURIComponent("Invalid or expired authentication link.")}`
  );
}
