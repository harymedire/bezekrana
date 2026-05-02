import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/lib/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { CheckoutSuccessClient } from "@/components/checkout/CheckoutSuccessClient";
import type { Profile } from "@/types/db";

// Dedicated post-payment success page. Reachable ONLY after Stripe confirms
// payment — both the inline path (router.replace) and 3DS redirect path
// (return_url) land here. Used as the conversion-tracking URL for Google
// Ads / Meta Pixel.
//
// Server guard: if a user lands here without an actual paid subscription
// or recent one-time purchase on file, we silently bounce them to /dashboard
// — that prevents accidental conversion firing from bookmarks / direct URL
// access.
export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    redirect_status?: string;
    payment_intent?: string;
    mode?: string;
  }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login", locale });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const typedProfile = profile as Profile | null;

  // 3DS redirect path will carry redirect_status=succeeded.
  const stripeSaysOk = sp.redirect_status === "succeeded";

  // Inline path doesn't carry any Stripe param — verify via DB. Either:
  //   • subscription is now active with a real subscription_id, OR
  //   • there is at least one one-time purchase row.
  const { count: purchaseCount } = await supabase
    .from("one_time_purchases")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const hasSub =
    !!typedProfile?.subscription_id &&
    ["active", "past_due"].includes(typedProfile.subscription_status);
  const hasPurchase = (purchaseCount ?? 0) > 0;

  if (!stripeSaysOk && !hasSub && !hasPurchase) {
    // Direct visit without a real payment → bounce silently. Conversion
    // event MUST not fire in this case.
    redirect({ href: "/dashboard", locale });
  }

  const mode: "subscription" | "onetime" = sp.mode === "onetime" ? "onetime" : "subscription";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-16 md:py-24">
        <CheckoutSuccessClient mode={mode} locale={locale} />
      </main>
    </>
  );
}
