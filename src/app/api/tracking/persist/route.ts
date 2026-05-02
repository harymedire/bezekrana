import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Called from the client right after sign-up. Reads the UTM/landing cookies
// the middleware set on first visit and writes a single user_tracking row.
// Idempotent via the UNIQUE(user_id) constraint.
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const cookieStore = await cookies();
  const headerStore = await headers();
  const utmRaw = cookieStore.get("bz_utm")?.value;
  const landingRaw = cookieStore.get("bz_landing")?.value;

  let utm: Record<string, string> = {};
  let landing: { url?: string; ref?: string } = {};
  try { if (utmRaw) utm = JSON.parse(utmRaw); } catch {}
  try { if (landingRaw) landing = JSON.parse(landingRaw); } catch {}

  await supabase.from("user_tracking").insert({
    user_id: user.id,
    utm_source: utm.utm_source ?? null,
    utm_medium: utm.utm_medium ?? null,
    utm_campaign: utm.utm_campaign ?? null,
    utm_term: utm.utm_term ?? null,
    utm_content: utm.utm_content ?? null,
    referrer: landing.ref ?? null,
    landing_page_url: landing.url ?? null,
    user_agent: headerStore.get("user-agent") ?? null,
  });

  return NextResponse.json({ ok: true });
}
