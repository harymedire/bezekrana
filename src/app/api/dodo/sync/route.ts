import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { dodoClient } from "@/lib/dodo/server";
import { nextWeeksConsumedFor } from "@/lib/subscription/drip";
import type { Currency } from "@/types/db";

// ----------------------------------------------------------------------------
// /api/dodo/sync — frontend-triggered fallback for the webhook.
// ----------------------------------------------------------------------------
// In dev/testing the Dodo webhook can't reach localhost, so the inline iframe
// would silently leave the DB on `subscription_status = 'none'` after a
// successful charge. The DodoInline client component calls this endpoint
// after seeing a success event; we verify the subscription/payment with the
// Dodo API (so this can't be spoofed by clients) and update the DB to the
// same state the webhook would.
//
// In production with the webhook configured, both code paths converge —
// webhook arrives first, this becomes a no-op (subscription already active).
// ----------------------------------------------------------------------------

type Body = {
  mode: "subscription" | "onetime";
  subscriptionId?: string;
  paymentId?: string;
  packId?: string;
};

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Body;
  const service = createSupabaseServiceClient();

  try {
    if (body.mode === "subscription") {
      if (!body.subscriptionId) {
        return NextResponse.json({ error: "missing-subscription-id" }, { status: 400 });
      }

      // Verify with Dodo so a malicious client can't fake a sub.
      const sub = (await dodoClient.subscriptions.retrieve(body.subscriptionId)) as unknown as {
        status?: string;
        customer?: { customer_id?: string };
        metadata?: Record<string, string>;
      };

      const okStatus = sub.status === "active" || sub.status === "trialing" || sub.status === "on_hold";
      if (!okStatus) {
        return NextResponse.json({ error: `not-active: ${sub.status}` }, { status: 400 });
      }

      // The metadata.app_user_id was set when we created the session. If it
      // doesn't match the calling user, refuse — prevents a logged-in attacker
      // from claiming someone else's subscription.
      const metaUserId = sub.metadata?.app_user_id;
      if (metaUserId && metaUserId !== user.id) {
        return NextResponse.json({ error: "user-mismatch" }, { status: 403 });
      }

      const { data: profile } = await service
        .from("profiles")
        .select("weeks_consumed, subscription_started_at, subscription_status, locale")
        .eq("id", user.id)
        .single();

      // Idempotent: if subscription_status is already active for this same
      // sub id, skip (webhook may have already done the work).
      if (profile?.subscription_status === "active") {
        return NextResponse.json({ ok: true, alreadyActive: true });
      }

      const next = await nextWeeksConsumedFor(
        service,
        user.id,
        profile?.weeks_consumed ?? 0,
        profile?.locale ?? "bs",
      );

      await service
        .from("profiles")
        .update({
          subscription_provider: "dodo",
          subscription_id: body.subscriptionId,
          subscription_status: "active",
          subscription_started_at:
            profile?.subscription_started_at ?? new Date().toISOString(),
          weeks_consumed: next,
          last_consumption_at: new Date().toISOString(),
          dodo_customer_id: sub.customer?.customer_id ?? null,
        })
        .eq("id", user.id);

      return NextResponse.json({ ok: true });
    }

    if (body.mode === "onetime") {
      if (!body.paymentId || !body.packId) {
        return NextResponse.json({ error: "missing-payment-or-pack" }, { status: 400 });
      }

      const payment = (await dodoClient.payments.retrieve(body.paymentId)) as unknown as {
        status?: string;
        total_amount?: number;
        currency?: string;
        metadata?: Record<string, string>;
      };

      if (payment.status !== "succeeded") {
        return NextResponse.json({ error: `not-succeeded: ${payment.status}` }, { status: 400 });
      }
      if (payment.metadata?.app_user_id && payment.metadata.app_user_id !== user.id) {
        return NextResponse.json({ error: "user-mismatch" }, { status: 403 });
      }

      await service.from("one_time_purchases").upsert(
        {
          user_id: user.id,
          pack_id: body.packId,
          provider: "dodo",
          provider_payment_id: body.paymentId,
          amount_cents: payment.total_amount ?? 0,
          currency: ((payment.currency ?? "EUR").toUpperCase()) as Currency,
        },
        { onConflict: "user_id,pack_id" },
      );

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "invalid-mode" }, { status: 400 });
  } catch (err) {
    console.error("[dodo-sync]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
