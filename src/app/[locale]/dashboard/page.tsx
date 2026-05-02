import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { userCanAccessPack } from "@/lib/utils/access";
import type { ContentPack, OneTimePurchase, Profile } from "@/types/db";
import { DashboardWeeks } from "@/components/dashboard/DashboardWeeks";

export default async function DashboardHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: packs }, { data: purchases }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase
      .from("content_packs")
      .select("*")
      .eq("locale", locale)
      .eq("published", true)
      .order("sequence_number", { ascending: true }),
    supabase.from("one_time_purchases").select("pack_id").eq("user_id", user!.id),
  ]);

  const typedProfile = profile as Profile | null;
  const typedPacks = (packs ?? []) as ContentPack[];
  const typedPurchases = (purchases ?? []) as Pick<OneTimePurchase, "pack_id">[];

  // "Real" recurring subscription requires a provider-side subscription_id —
  // status alone isn't enough because admin's "Dodaj sedmicu" flips a one-time
  // user to status="active" without creating an actual recurring billing
  // relationship. We use subscription_id as the authoritative signal so those
  // users still see the upgrade CTA. "canceled" status also shows the CTA so
  // we can nudge churned users to re-subscribe.
  const hasRecurringSub =
    !!typedProfile?.subscription_id &&
    ["active", "past_due"].includes(typedProfile?.subscription_status ?? "");

  const unlockedPacks = typedPacks.filter((p) =>
    userCanAccessPack(p, typedProfile, typedPurchases),
  );
  const unlockedNewestFirst = [...unlockedPacks].sort(
    (a, b) => b.sequence_number - a.sequence_number,
  );

  const showSubscribeCta = !hasRecurringSub;
  const noSubAndNoPurchases = !hasRecurringSub && unlockedPacks.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-plum-900">
          {t("welcome", { name: typedProfile?.full_name ?? user!.email!.split("@")[0] })}
        </h1>
      </div>

      {/* No-purchases path: full-width red CTA. */}
      {noSubAndNoPurchases && (
        <div className="rounded-bubble bg-gradient-to-br from-coral-500 to-coral-400 text-white p-6 md:p-8 shadow-soft">
          <h2 className="font-display text-2xl mb-2">{t("noSubscription")}</h2>
          <p className="text-white/90 mb-5">Pretplati se i otključaj prvi paket odmah.</p>
          <Link href="/pricing">
            <Button variant="yellow">{t("subscribeCta")}</Button>
          </Link>
        </div>
      )}

      <DashboardWeeks
        unlockedNewestFirst={unlockedNewestFirst}
        allPacks={typedPacks}
        unlockedIds={unlockedPacks.map((p) => p.id)}
        hasActiveSub={hasRecurringSub}
        currentWeekLabel={t("currentWeek")}
        archiveLabel={t("archive")}
        totalLabel={`Ukupno ${typedPacks.length} sedmica`}
        noPackYetLabel={t("noPackYet")}
        upgradeCta={
          showSubscribeCta && unlockedPacks.length > 0 ? (
            <section key="upgrade-cta">
              <div className="rounded-bubble bg-gradient-to-br from-plum-700 via-plum-600 to-coral-500 text-white p-6 md:p-7 shadow-soft max-w-2xl">
                <h3 className="font-display text-xl md:text-2xl mb-2">{t("upgradeTitle")}</h3>
                <p className="text-white/90 mb-5">{t("upgradeBody")}</p>
                <Link href="/pricing">
                  <Button variant="yellow" size="md">
                    {t("upgradeCta")} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </section>
          ) : null
        }
      />
    </div>
  );
}
