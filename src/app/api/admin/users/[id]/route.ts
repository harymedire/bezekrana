import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { promoteToPaid, demoteToFree, removeContactFromList, BREVO_LISTS } from "@/lib/brevo";
import { stripe } from "@/lib/stripe/server";
import type { SubscriptionStatus } from "@/types/db";

// PATCH /api/admin/users/[id] — admin-only user actions.
// Body: { action: <name>, ...payload }
//
// Supported actions:
//   • set_name   { full_name }
//   • set_email  { email }
//   • set_status { status: 'active'|'paused'|'canceled'|'none' }
//   • grant_week
//   • revoke_week
//   • mark_subscribed     — flag user as a real subscriber (sentinel sub_id)
//   • unmark_subscribed   — clear that flag back to "no recurring sub"
//   • block
//   • unblock

async function ensureAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, msg: "unauthenticated" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { ok: false as const, status: 403, msg: "forbidden" };
  return { ok: true as const, adminId: user.id };
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await ensureAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.msg }, { status: auth.status });

  const { id: userId } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    full_name?: string;
    email?: string;
    status?: SubscriptionStatus;
  };

  const service = createSupabaseServiceClient();

  try {
    switch (body.action) {
      case "set_name": {
        const name = (body.full_name ?? "").trim();
        if (name.length < 2) return NextResponse.json({ error: "name-too-short" }, { status: 400 });
        await service.from("profiles").update({ full_name: name }).eq("id", userId);
        await service.auth.admin.updateUserById(userId, {
          user_metadata: { full_name: name },
        });
        return NextResponse.json({ ok: true });
      }

      case "set_email": {
        const email = (body.email ?? "").trim().toLowerCase();
        if (!email.includes("@")) return NextResponse.json({ error: "invalid-email" }, { status: 400 });
        const { error: authErr } = await service.auth.admin.updateUserById(userId, {
          email,
          email_confirm: true,
        });
        if (authErr) throw authErr;
        await service.from("profiles").update({ email }).eq("id", userId);
        return NextResponse.json({ ok: true });
      }

      case "set_status": {
        const status = body.status;
        if (!status || !["active", "paused", "canceled", "none", "past_due"].includes(status)) {
          return NextResponse.json({ error: "invalid-status" }, { status: 400 });
        }
        await service.from("profiles").update({ subscription_status: status }).eq("id", userId);
        return NextResponse.json({ ok: true });
      }

      case "grant_week": {
        const { data: row } = await service
          .from("profiles")
          .select("weeks_consumed, subscription_started_at, subscription_status")
          .eq("id", userId)
          .single();
        const next = (row?.weeks_consumed ?? 0) + 1;
        await service.from("profiles").update({
          weeks_consumed: next,
          last_consumption_at: new Date().toISOString(),
          subscription_started_at: row?.subscription_started_at ?? new Date().toISOString(),
          subscription_status: row?.subscription_status === "none" ? "active" : row?.subscription_status,
        }).eq("id", userId);
        return NextResponse.json({ ok: true, weeks_consumed: next });
      }

      case "mark_subscribed": {
        // Manually flag a user as a real recurring subscriber. Used when admin
        // grants paid access outside Stripe/Dodo (gift, comp, internal account).
        // The dashboard treats subscription_id != null as "real sub", so this
        // sentinel removes the upgrade-CTA without faking a provider.
        await service.from("profiles").update({
          subscription_status: "active",
          subscription_id: `manual:${Date.now()}`,
          subscription_started_at: new Date().toISOString(),
        }).eq("id", userId);

        // Brevo: free → paid list.
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
          }).catch((err) => console.error("[admin/users] brevo promote failed", err));
        }
        return NextResponse.json({ ok: true });
      }

      case "unmark_subscribed": {
        // Reverse of mark_subscribed: clears manual sentinel and returns user
        // to the "no recurring sub" state. Does NOT touch real provider IDs
        // (those start with 'sub_' from Stripe/Dodo, not 'manual:').
        const { data: row } = await service
          .from("profiles")
          .select("subscription_id, email, locale")
          .eq("id", userId)
          .single();
        const subId = (row?.subscription_id as string | null) ?? "";
        if (subId.startsWith("manual:")) {
          await service.from("profiles").update({
            subscription_id: null,
            subscription_status: "none",
          }).eq("id", userId);

          if (row?.email) {
            demoteToFree({ email: row.email, locale: row.locale ?? "bs" })
              .catch((err) => console.error("[admin/users] brevo demote failed", err));
          }
        }
        return NextResponse.json({ ok: true });
      }

      case "revoke_week": {
        const { data: row } = await service
          .from("profiles")
          .select("weeks_consumed")
          .eq("id", userId)
          .single();
        const current = row?.weeks_consumed ?? 0;
        if (current <= 0) {
          return NextResponse.json({ error: "weeks-already-zero" }, { status: 400 });
        }
        const next = current - 1;
        await service.from("profiles").update({
          weeks_consumed: next,
        }).eq("id", userId);
        return NextResponse.json({ ok: true, weeks_consumed: next });
      }

      case "block": {
        // Supabase: set banned_until far in the future. The user can't sign in
        // and Supabase prevents re-registration of the same email.
        const farFuture = new Date("2099-12-31").toISOString();
        const { error: banErr } = await service.auth.admin.updateUserById(userId, {
          ban_duration: "876000h", // 100 years
        } as { ban_duration: string });
        if (banErr) {
          // Fallback: write banned_until directly (older Supabase versions).
          await service.from("profiles").update({
            subscription_status: "canceled",
          }).eq("id", userId);
          throw banErr;
        }
        return NextResponse.json({ ok: true, banned_until: farFuture });
      }

      case "unblock": {
        const { error: unbanErr } = await service.auth.admin.updateUserById(userId, {
          ban_duration: "none",
        } as { ban_duration: string });
        if (unbanErr) throw unbanErr;
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "unknown-action" }, { status: 400 });
    }
  } catch (err) {
    console.error("[admin/users/PATCH]", body.action, err);
    return NextResponse.json(
      { error: (err as Error).message || "server-error" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/users/[id] — fully remove a user. Drops the auth row
// (profiles cascades), and best-effort removes them from Brevo lists. Admin
// cannot delete themselves to prevent locking out the only admin account.
export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await ensureAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.msg }, { status: auth.status });

  const { id: userId } = await ctx.params;
  if (userId === auth.adminId) {
    return NextResponse.json({ error: "cannot-delete-self" }, { status: 400 });
  }

  const service = createSupabaseServiceClient();

  try {
    // Pull email + provider sub IDs first so we can cancel billing & clean up
    // Brevo. Profile row is dropped by auth.users → profiles ON DELETE CASCADE.
    const { data: profile } = await service
      .from("profiles")
      .select("email, subscription_provider, subscription_id, stripe_customer_id")
      .eq("id", userId)
      .single();

    // Cancel Stripe subscription before deleting the auth row, so the user
    // doesn't continue getting charged. Manual sentinels (subscription_id
    // starting with "manual:") aren't real Stripe subs — skip those. Customer
    // object is left in Stripe for invoice history; Stripe doesn't allow
    // deleting customers with prior charges anyway.
    const subId = profile?.subscription_id ?? "";
    const isRealStripeSub =
      profile?.subscription_provider === "stripe" &&
      subId.startsWith("sub_");
    if (isRealStripeSub) {
      try {
        await stripe.subscriptions.cancel(subId);
      } catch (err) {
        // Already canceled / not found is fine — log and proceed with deletion.
        console.warn("[admin/users/DELETE] stripe cancel failed (continuing)", err);
      }
    }

    const { error: delErr } = await service.auth.admin.deleteUser(userId);
    if (delErr) throw delErr;

    if (profile?.email) {
      // Best-effort cleanup from both lists.
      await Promise.allSettled([
        removeContactFromList({ email: profile.email, listId: BREVO_LISTS.freeSignup }),
        removeContactFromList({ email: profile.email, listId: BREVO_LISTS.paid }),
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/users/DELETE]", err);
    return NextResponse.json(
      { error: (err as Error).message || "server-error" },
      { status: 500 },
    );
  }
}
