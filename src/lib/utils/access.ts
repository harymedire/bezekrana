import type { ContentPack, OneTimePurchase, Profile } from "@/types/db";

// Mirror of the SQL access rule, computed in JS for UI rendering.
// Single source of truth for "is this pack unlocked for this user?" UX —
// the actual security check still happens in Postgres / API routes.
export function userCanAccessPack(
  pack: Pick<ContentPack, "id" | "sequence_number">,
  profile: Pick<Profile, "subscription_status" | "weeks_consumed"> | null,
  oneTimePurchases: Pick<OneTimePurchase, "pack_id">[],
): boolean {
  if (!profile) return false;

  const subActive = ["active", "canceled", "past_due"].includes(profile.subscription_status);
  if (subActive && pack.sequence_number <= (profile.weeks_consumed ?? 0)) return true;

  return oneTimePurchases.some((p) => p.pack_id === pack.id);
}
