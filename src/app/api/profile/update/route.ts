import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

// Updates the user's full_name in BOTH places it lives:
//   • public.profiles.full_name (what the dashboard reads)
//   • auth.users.raw_user_meta_data.full_name (what new signUps seed via the
//     handle_new_user trigger; also what we read for Dodo customer.name)
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { fullName?: string };
  const fullName = (body.fullName ?? "").trim();
  if (fullName.length < 2 || fullName.length > 200) {
    return NextResponse.json({ error: "invalid-name" }, { status: 400 });
  }

  const service = createSupabaseServiceClient();

  // Update profiles row (RLS allows the user to update their own — but using
  // service to also write the locked fields would not apply here; we keep
  // service for consistency with other admin paths).
  const { error: profileErr } = await service
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);
  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  // Update auth metadata via admin API so future logins / Dodo flows pick up
  // the new value without a re-login.
  const { error: authErr } = await service.auth.admin.updateUserById(user.id, {
    user_metadata: { ...(user.user_metadata ?? {}), full_name: fullName },
  });
  if (authErr) {
    // Non-fatal — profile is the source of truth for our app reads.
    console.warn("[profile-update] auth metadata update failed:", authErr.message);
  }

  return NextResponse.json({ ok: true });
}
