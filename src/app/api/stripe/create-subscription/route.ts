import { NextResponse } from "next/server";
import { stripe, stripeSubscriptionPriceId } from "@/lib/stripe/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { currencyByLocale, type Locale } from "@/lib/i18n/config";

// Returns a SetupIntent + Subscription whose first invoice is in
// 'incomplete' state, plus the PaymentIntent client_secret so the browser's
// Payment Element can confirm without ever leaving our domain.
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { locale?: Locale };
  const locale = body.locale ?? "bs";
  const currency = currencyByLocale[locale];

  const service = createSupabaseServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("id, email, stripe_customer_id, subscription_id, subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "profile-missing" }, { status: 500 });

  // Reuse Stripe customer if one already exists.
  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: { app_user_id: profile.id },
    });
    customerId = customer.id;
    await service.from("profiles").update({ stripe_customer_id: customerId }).eq("id", profile.id);
  }

  // If user already has an active subscription, surface that to the client
  // instead of creating a duplicate.
  if (profile.subscription_status === "active") {
    return NextResponse.json({ alreadyActive: true });
  }

  const priceId = stripeSubscriptionPriceId(currency);

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: {
      payment_method_types: ["card"],
      save_default_payment_method: "on_subscription",
    },
    expand: ["latest_invoice.payment_intent"],
    metadata: { app_user_id: profile.id, mode: "subscription" },
  });

  const invoice = subscription.latest_invoice as
    | (typeof subscription.latest_invoice & { payment_intent: { client_secret: string } })
    | null;
  const clientSecret = invoice?.payment_intent?.client_secret ?? null;

  if (!clientSecret) {
    return NextResponse.json({ error: "no-client-secret" }, { status: 500 });
  }

  return NextResponse.json({
    clientSecret,
    subscriptionId: subscription.id,
    customerId,
  });
}
