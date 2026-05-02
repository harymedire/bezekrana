import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/lib/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { currencyByLocale, type Locale } from "@/lib/i18n/config";
import { DEFAULT_ONETIME_PRICE_CENTS, DEFAULT_SUBSCRIPTION_PRICE_CENTS } from "@/lib/utils/money";

type SP = { mode?: "subscription" | "onetime"; packId?: string };

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SP>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const mode = sp.mode ?? "subscription";

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const next = mode === "onetime" && sp.packId
      ? `/checkout?mode=onetime&packId=${sp.packId}`
      : `/checkout?mode=${mode}`;
    redirect({ href: `/login?next=${encodeURIComponent(next)}`, locale });
  }

  const t = await getTranslations("checkout");
  const currency = currencyByLocale[locale as Locale];

  // Resolve display values
  let title = t("subscriptionItem");
  let amountCents: number = DEFAULT_SUBSCRIPTION_PRICE_CENTS[currency];

  if (mode === "onetime") {
    if (!sp.packId) redirect({ href: "/pricing", locale });
    const { data: pack } = await supabase
      .from("content_packs")
      .select("title, one_time_price_cents, one_time_currency, one_time_available")
      .eq("id", sp.packId!)
      .single();
    if (!pack || !pack.one_time_available) redirect({ href: "/pricing", locale });
    title = t("oneTimeItem", { title: pack!.title });
    amountCents = pack!.one_time_price_cents ?? DEFAULT_ONETIME_PRICE_CENTS[currency];
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <h1 className="font-display text-3xl text-plum-900 mb-6">{t("title")}</h1>
        <CheckoutClient
          mode={mode}
          packId={sp.packId ?? null}
          locale={locale}
          summary={{ title, amountCents, currency }}
        />
      </main>
    </>
  );
}
