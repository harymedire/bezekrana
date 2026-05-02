import { NextResponse } from "next/server";
import { subscribeNewUser } from "@/lib/brevo";

// Adds a newly-registered user to the Brevo "bezekrana" free list (#29).
// Called from RegisterForm right after a successful supabase.auth.signUp().
// Idempotent and silently swallows Brevo errors so a marketing-list hiccup
// never blocks signup.
export async function POST(request: Request) {
  let body: { email?: string; fullName?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "invalid-email" }, { status: 400 });
  }

  await subscribeNewUser({
    email,
    fullName: body.fullName,
    locale: body.locale,
  });

  return NextResponse.json({ ok: true });
}
