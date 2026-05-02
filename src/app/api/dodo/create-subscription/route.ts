import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { dodoClient, dodoForceLanguage, dodoSubscriptionProductId } from "@/lib/dodo/server";

// Creates a Dodo checkout session for the weekly subscription. Returns the
// checkout_url which the client mounts inside an inline iframe.
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { locale?: string };
  const appLocale = body.locale ?? "bs";

  const service = createSupabaseServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("id, email, full_name, subscription_status")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "profile-missing" }, { status: 500 });

  if (profile.subscription_status === "active") {
    return NextResponse.json({ alreadyActive: true });
  }

  // return_url is mostly a fallback — with manualRedirect: true the iframe
  // never actually navigates here, but Dodo requires the field.
  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

  const session = (await dodoClient.checkoutSessions.create({
    product_cart: [{ product_id: dodoSubscriptionProductId(), quantity: 1 }],
    customer: { email: profile.email, name: profile.full_name || "Customer" },
    return_url: returnUrl,
    force_language: dodoForceLanguage(appLocale),
    metadata: {
      app_user_id: profile.id,
      mode: "subscription",
    },
  })) as unknown as { checkout_url: string; id?: string; session_id?: string };

  return NextResponse.json({
    checkoutUrl: session.checkout_url,
    sessionId: session.id ?? session.session_id ?? null,
  });
}
