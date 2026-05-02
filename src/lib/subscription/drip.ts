// ============================================================================
// Drip-counter helper used by both Stripe and Dodo webhooks + the Dodo sync.
// ============================================================================
// When a subscription invoice succeeds, weeks_consumed must increase by one.
// BUT — if the user already owns one-time packs above their current
// weeks_consumed (e.g. they bought pack #1 as one-time, then later subscribed),
// the subscription should pick up where the one-time left off, NOT re-deliver
// content they already have.
//
// Algorithm:
//   1. Find the highest sequence_number among the user's one_time_purchases
//      (in their locale).
//   2. baseline = max(profile.weeks_consumed, that highest one-time seq)
//   3. new weeks_consumed = baseline + 1
//
// Example: user owns pack #1 via one-time, weeks_consumed=0, then subscribes.
//   baseline = max(0, 1) = 1
//   new weeks_consumed = 2  → next invoice unlocks pack #2 directly.
// ============================================================================

import type { SupabaseClient } from "@supabase/supabase-js";

export async function nextWeeksConsumedFor(
  service: SupabaseClient,
  userId: string,
  currentWeeksConsumed: number,
  locale: string,
): Promise<number> {
  const { data: rows } = await service
    .from("one_time_purchases")
    .select("pack_id, content_packs!inner(sequence_number, locale)")
    .eq("user_id", userId);

  let maxOneTimeSeq = 0;
  for (const r of (rows ?? []) as Array<{
    content_packs: { sequence_number: number; locale: string } | { sequence_number: number; locale: string }[];
  }>) {
    // Supabase returns the embedded relation as either an object or array
    // depending on PostgREST version — normalise.
    const packs = Array.isArray(r.content_packs) ? r.content_packs : [r.content_packs];
    for (const p of packs) {
      if (p.locale === locale && p.sequence_number > maxOneTimeSeq) {
        maxOneTimeSeq = p.sequence_number;
      }
    }
  }

  const baseline = Math.max(currentWeeksConsumed, maxOneTimeSeq);
  return baseline + 1;
}
