import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { currencyByLocale, type Locale } from "@/lib/i18n/config";
import { DEFAULT_ONETIME_PRICE_CENTS } from "@/lib/utils/money";
import type { Currency } from "@/types/db";

// Creates a one-time PaymentIntent for a single content pack purchase.
// The pack metadata travels on the PaymentIntent so the webhook can grant
// access in one shot when payment_intent.succeeded arrives.
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { packId?: string; locale?: Locale };
  if (!body.packId) return NextResponse.json({ error: "missing-pack" }, { status: 400 });
  const locale = body.locale ?? "bs";
  const fallbackCurrency = currencyByLocale[locale];

  const service = createSupabaseServiceClient();

  const { data: pack } = await service
    .from("content_packs")
    .select("id, title, one_time_available, one_time_price_cents, one_time_currency")
    .eq("id", body.packId)
    .single();

  if (!pack || !pack.one_time_available) {
    return NextResponse.json({ error: "pack-not-available" }, { status: 404 });
  }

  const { data: profile } = await service
    .from("profiles")
    .select("id, email, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "profile-missing" }, { status: 500 });

  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: { app_user_id: profile.id },
    });
    customerId = customer.id;
    await service.from("profiles").update({ stripe_customer_id: customerId }).eq("id", profile.id);
  }

  const currency = (pack.one_time_currency ?? fallbackCurrency) as Currency;
  const amount = pack.one_time_price_cents ?? DEFAULT_ONETIME_PRICE_CENTS[currency];

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata: {
      app_user_id: profile.id,
      mode: "onetime",
      pack_id: pack.id,
    },
  });

  return NextResponse.json({
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount,
    currency,
    packTitle: pack.title,
  });
}
