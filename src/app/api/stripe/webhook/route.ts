import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { nextWeeksConsumedFor } from "@/lib/subscription/drip";
import { promoteToPaid, demoteToFree } from "@/lib/brevo";
import type Stripe from "stripe";
import type { Currency } from "@/types/db";

export const runtime = "nodejs";
// Stripe needs the raw body for signature verification.
export const dynamic = "force-dynamic";

// ----------------------------------------------------------------------------
// Drip-counter rule (the core of how this product works):
//   • On the FIRST successful invoice for a subscription, we set
//     subscription_started_at and weeks_consumed = 1. The user immediately
//     unlocks pack #1.
//   • On EACH subsequent successful weekly invoice, we increment
//     weeks_consumed by 1, unlocking pack #(weeks_consumed) for that user.
//   • If the user pauses/cancels, weeks_consumed is NOT decremented. When
//     they reactivate, the next successful invoice continues from where
//     they left off — that's how "no double pay for the same content" works.
// ----------------------------------------------------------------------------

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "missing-signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `signature-verification-failed: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  const service = createSupabaseServiceClient();

  // Idempotency — short-circuit if we've already processed this event.
  const { data: existing } = await service
    .from("webhook_events")
    .select("id")
    .eq("provider", "stripe")
    .eq("event_id", event.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true, dedup: true });

  try {
    switch (event.type) {
      case "invoice.payment_succeeded":
        await handleInvoicePaid(event.data.object as Stripe.Invoice, service);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscriptionState(event.data.object as Stripe.Subscription, service);
        break;
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, service);
        break;
    }

    await service.from("webhook_events").insert({
      provider: "stripe",
      event_id: event.id,
      event_type: event.type,
    });
  } catch (err) {
    console.error("[stripe-webhook]", event.type, err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// ----------------------------------------------------------------------------
async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  service: ReturnType<typeof createSupabaseServiceClient>,
) {
  if (!invoice.subscription || !invoice.customer) return;
  const subscriptionId = String(invoice.subscription);
  const customerId = String(invoice.customer);

  const { data: profile } = await service
    .from("profiles")
    .select("id, email, full_name, weeks_consumed, subscription_started_at, subscription_status, locale")
    .eq("stripe_customer_id", customerId)
    .single();
  if (!profile) return;

  const isFirstInvoice = invoice.billing_reason === "subscription_create";
  const nextWeeks = await nextWeeksConsumedFor(
    service,
    profile.id,
    profile.weeks_consumed ?? 0,
    profile.locale ?? "bs",
  );

  await service
    .from("profiles")
    .update({
      subscription_provider: "stripe",
      subscription_id: subscriptionId,
      subscription_status: "active",
      subscription_started_at: profile.subscription_started_at ?? new Date().toISOString(),
      weeks_consumed: nextWeeks,
      last_consumption_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  // Move user from "bezekrana" free list (#29) to "bezekrana paid" (#30).
  // Fire-and-forget — Brevo failure must not block the webhook.
  promoteToPaid({
    email: profile.email,
    fullName: profile.full_name ?? undefined,
    locale: profile.locale ?? "bs",
  }).catch((err) => console.error("[stripe-webhook] brevo promote failed", err));

  // (Optional) — fire transactional email that pack #N is unlocked.
  // Wired up later when we add Resend/Postmark.
  void isFirstInvoice;
}

async function syncSubscriptionState(
  subscription: Stripe.Subscription,
  service: ReturnType<typeof createSupabaseServiceClient>,
) {
  const customerId = String(subscription.customer);
  const status = mapStripeStatus(subscription.status);
  const endsAt =
    subscription.cancel_at ?? subscription.current_period_end
      ? new Date((subscription.cancel_at ?? subscription.current_period_end) * 1000).toISOString()
      : null;

  await service
    .from("profiles")
    .update({
      subscription_provider: "stripe",
      subscription_id: subscription.id,
      subscription_status: status,
      subscription_ends_at: endsAt,
    })
    .eq("stripe_customer_id", customerId);

  // On cancellation, move user back to the free list — they may want to
  // resubscribe later and shouldn't get the "paying customer" emails.
  if (status === "canceled") {
    const { data: prof } = await service
      .from("profiles")
      .select("email, locale")
      .eq("stripe_customer_id", customerId)
      .single();
    if (prof?.email) {
      demoteToFree({ email: prof.email, locale: prof.locale ?? "bs" })
        .catch((err) => console.error("[stripe-webhook] brevo demote failed", err));
    }
  }
}

function mapStripeStatus(s: Stripe.Subscription.Status): "active" | "past_due" | "canceled" | "paused" {
  if (s === "active" || s === "trialing") return "active";
  if (s === "past_due" || s === "unpaid") return "past_due";
  if (s === "paused") return "paused";
  return "canceled";
}

// ----------------------------------------------------------------------------
async function handlePaymentIntentSucceeded(
  pi: Stripe.PaymentIntent,
  service: ReturnType<typeof createSupabaseServiceClient>,
) {
  const mode = pi.metadata?.mode;
  if (mode !== "onetime") return; // subscription PIs are handled via invoice.paid

  const userId = pi.metadata?.app_user_id;
  const packId = pi.metadata?.pack_id;
  if (!userId || !packId) return;

  await service
    .from("one_time_purchases")
    .upsert(
      {
        user_id: userId,
        pack_id: packId,
        provider: "stripe",
        provider_payment_id: pi.id,
        amount_cents: pi.amount_received,
        currency: pi.currency.toUpperCase() as Currency,
      },
      { onConflict: "user_id,pack_id" },
    );

  // One-time buyer is also a paying customer — move to "paid" list.
  const { data: prof } = await service
    .from("profiles")
    .select("email, full_name, locale")
    .eq("id", userId)
    .single();
  if (prof?.email) {
    promoteToPaid({
      email: prof.email,
      fullName: prof.full_name ?? undefined,
      locale: prof.locale ?? "bs",
    }).catch((err) => console.error("[stripe-webhook] brevo promote (one-time) failed", err));
  }
}
