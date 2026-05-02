import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { dodoClient } from "@/lib/dodo/server";
import { nextWeeksConsumedFor } from "@/lib/subscription/drip";
import { promoteToPaid, demoteToFree } from "@/lib/brevo";
import type { Currency } from "@/types/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Dodo events arrive here. We translate them into the same internal state
// mutations the Stripe webhook performs, so the rest of the app doesn't care
// which provider was used.
//
// Drip rule (mirrors Stripe webhook):
//   • subscription paid → weeks_consumed += 1, status = active
//   • subscription cancelled → status = canceled (weeks_consumed preserved)
//   • one-time payment succeeded → row in one_time_purchases

export async function POST(request: Request) {
  const rawBody = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  let event: {
    id?: string;
    type?: string;
    data?: {
      subscription_id?: string;
      payment_id?: string;
      customer?: { customer_id?: string; email?: string };
      metadata?: Record<string, string>;
      amount_received?: number;
      currency?: string;
      total_amount?: number;
    };
  };

  try {
    event = (await dodoClient.webhooks.unwrap(rawBody, { headers })) as typeof event;
  } catch (err) {
    return NextResponse.json(
      { error: `signature-verification-failed: ${(err as Error).message}` },
      { status: 401 },
    );
  }

  if (!event.id) return NextResponse.json({ error: "no-event-id" }, { status: 400 });

  const service = createSupabaseServiceClient();

  // Idempotency
  const { data: existing } = await service
    .from("webhook_events")
    .select("id")
    .eq("provider", "dodo")
    .eq("event_id", event.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true, dedup: true });

  try {
    const data = event.data ?? {};
    const meta = data.metadata ?? {};
    const userId = meta.app_user_id;
    const mode = meta.mode;

    switch (event.type) {
      // First-time subscription invoice / activation
      case "subscription.active":
      case "subscription_created":
      case "subscription.renewed":
      case "subscription_renewed": {
        if (!userId) break;
        const { data: profile } = await service
          .from("profiles")
          .select("id, email, full_name, weeks_consumed, subscription_started_at, locale")
          .eq("id", userId)
          .single();
        if (!profile) break;

        const next = await nextWeeksConsumedFor(
          service,
          profile.id,
          profile.weeks_consumed ?? 0,
          profile.locale ?? "bs",
        );

        await service
          .from("profiles")
          .update({
            subscription_provider: "dodo",
            subscription_id: data.subscription_id ?? null,
            subscription_status: "active",
            subscription_started_at:
              profile.subscription_started_at ?? new Date().toISOString(),
            weeks_consumed: next,
            last_consumption_at: new Date().toISOString(),
            dodo_customer_id: data.customer?.customer_id ?? null,
          })
          .eq("id", profile.id);

        // Brevo: free list (#29) → paid list (#30).
        promoteToPaid({
          email: profile.email,
          fullName: profile.full_name ?? undefined,
          locale: profile.locale ?? "bs",
        }).catch((err) => console.error("[dodo-webhook] brevo promote failed", err));
        break;
      }

      case "subscription.cancelled":
      case "subscription_cancelled": {
        if (!userId) break;
        await service
          .from("profiles")
          .update({ subscription_status: "canceled" })
          .eq("id", userId);

        // Brevo: paid list (#30) → free list (#29). Re-engage opportunity.
        const { data: prof } = await service
          .from("profiles")
          .select("email, locale")
          .eq("id", userId)
          .single();
        if (prof?.email) {
          demoteToFree({ email: prof.email, locale: prof.locale ?? "bs" })
            .catch((err) => console.error("[dodo-webhook] brevo demote failed", err));
        }
        break;
      }

      case "subscription.paused":
      case "subscription_paused": {
        if (!userId) break;
        await service
          .from("profiles")
          .update({ subscription_status: "paused" })
          .eq("id", userId);
        break;
      }

      // One-time pack purchase
      case "payment.succeeded":
      case "payment_succeeded": {
        if (mode !== "onetime" || !userId || !meta.pack_id) break;
        await service.from("one_time_purchases").upsert(
          {
            user_id: userId,
            pack_id: meta.pack_id,
            provider: "dodo",
            provider_payment_id: data.payment_id ?? "",
            amount_cents: data.total_amount ?? data.amount_received ?? 0,
            currency: ((data.currency ?? "EUR").toUpperCase()) as Currency,
          },
          { onConflict: "user_id,pack_id" },
        );

        // One-time buyer is also a paying customer — Brevo paid list.
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
          }).catch((err) => console.error("[dodo-webhook] brevo promote (one-time) failed", err));
        }
        break;
      }
    }

    await service.from("webhook_events").insert({
      provider: "dodo",
      event_id: event.id,
      event_type: event.type ?? "unknown",
    });
  } catch (err) {
    console.error("[dodo-webhook]", event.type, err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
