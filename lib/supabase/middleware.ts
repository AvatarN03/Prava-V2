import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // If env vars are missing (e.g. initial dev before setup), allow request through without auth errors
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  // Crucial: Allow /auth/callback to process PKCE code exchange directly without premature getUser() session modification
  if (pathname.startsWith("/auth/callback")) {
    return supabaseResponse;
  }

  // IMPORTANT: Avoid writing any logic between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fallback: If auth code or token_hash lands on any route other than /auth/callback,
  // redirect immediately to /auth/callback to ensure server-side PKCE / OTP exchange.
  const hasAuthCode = request.nextUrl.searchParams.has("code") || request.nextUrl.searchParams.has("token_hash");
  if (hasAuthCode) {
    const callbackUrl = new URL("/auth/callback", request.url);
    request.nextUrl.searchParams.forEach((val, key) => {
      callbackUrl.searchParams.set(key, val);
    });
    const redirectResponse = NextResponse.redirect(callbackUrl);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, c);
    });
    return redirectResponse;
  }

  // Handle legacy /login and /signup route requests
  if (pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }
  if (pathname === "/signup") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("tab", "signup");
    return NextResponse.redirect(url);
  }

  // Protected application routes
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/trips") ||
    pathname.startsWith("/travel-essentials") ||
    pathname.startsWith("/forum") ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/templates") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/stories/new") ||
    pathname.startsWith("/stories/manage") ||
    pathname.includes("/edit");

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated user away from auth pages
  if (pathname.startsWith("/auth") && !pathname.startsWith("/auth/callback") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
