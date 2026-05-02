import { NextResponse } from "next/server";

// Dodo Payments — privremeno isključen. Stripe je trenutno primarni
// payment provider. Cijela implementacija je sačuvana u komentaru ispod
// i može se vratiti kad bude potrebno (uz update Dodo SDK-a — `force_language`
// više ne postoji u CheckoutSessionCreateParams tipu).
export async function POST() {
  return NextResponse.json(
    { error: "dodo-disabled", message: "Dodo Payments is currently disabled. Use /api/stripe/create-onetime instead." },
    { status: 503 },
  );
}

/* ORIGINAL IMPLEMENTATION — re-enable when Dodo is needed again
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { dodoClient, dodoForceLanguage, dodoOneTimeProductId } from "@/lib/dodo/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { packId?: string; locale?: string };
  if (!body.packId) return NextResponse.json({ error: "missing-pack" }, { status: 400 });
  const appLocale = body.locale ?? "bs";

  const service = createSupabaseServiceClient();

  const { data: pack } = await service
    .from("content_packs")
    .select("id, title, one_time_available")
    .eq("id", body.packId)
    .single();
  if (!pack || !pack.one_time_available) {
    return NextResponse.json({ error: "pack-not-available" }, { status: 404 });
  }

  const { data: profile } = await service
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "profile-missing" }, { status: 500 });

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

  const session = (await dodoClient.checkoutSessions.create({
    product_cart: [{ product_id: dodoOneTimeProductId(), quantity: 1 }],
    customer: { email: profile.email, name: profile.full_name || "Customer" },
    return_url: returnUrl,
    force_language: dodoForceLanguage(appLocale),
    metadata: {
      app_user_id: profile.id,
      mode: "onetime",
      pack_id: pack.id,
    },
  })) as unknown as { checkout_url: string; id?: string; session_id?: string };

  return NextResponse.json({
    checkoutUrl: session.checkout_url,
    sessionId: session.id ?? session.session_id ?? null,
    packTitle: pack.title,
  });
}
*/
