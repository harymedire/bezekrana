import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/config";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const UTM_COOKIE = "bz_utm";
const LANDING_COOKIE = "bz_landing";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

function captureUtmIfPresent(request: NextRequest, response: NextResponse) {
  const params = request.nextUrl.searchParams;
  const utm: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) utm[key] = v;
  }
  if (Object.keys(utm).length > 0) {
    response.cookies.set(UTM_COOKIE, JSON.stringify(utm), {
      maxAge: COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  if (!request.cookies.get(LANDING_COOKIE)) {
    response.cookies.set(
      LANDING_COOKIE,
      JSON.stringify({
        url: request.nextUrl.pathname + request.nextUrl.search,
        ref: request.headers.get("referer") || "",
      }),
      {
        maxAge: COOKIE_MAX_AGE_SECONDS,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    );
  }
}

export async function middleware(request: NextRequest) {
  // 1) i18n routing first — produces a NextResponse with locale-aware redirects/rewrites
  const intlResponse = intlMiddleware(request);

  // 2) UTM/landing capture rides on whatever response we're about to return
  captureUtmIfPresent(request, intlResponse);

  // 3) Supabase session refresh (cookies pass through into the response).
  // Webhook routes are excluded by the matcher below, not here, so this is safe.
  await refreshSupabaseSession(request, intlResponse);

  return intlResponse;
}

export const config = {
  // Skip Next internals, static files, and all /api routes (handled directly by their own handlers).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
