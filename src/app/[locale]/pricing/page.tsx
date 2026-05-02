import { setRequestLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { currencyByLocale, type Locale } from "@/lib/i18n/config";
import { DEFAULT_ONETIME_PRICE_CENTS, DEFAULT_SUBSCRIPTION_PRICE_CENTS } from "@/lib/utils/money";
import { PricingTabs } from "@/components/pricing/PricingTabs";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");

  const currency = currencyByLocale[locale as Locale];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="font-display text-3xl md:text-5xl text-plum-900">{t("title")}</h1>
        </div>

        <PricingTabs
          currency={currency}
          subscribePriceCents={DEFAULT_SUBSCRIPTION_PRICE_CENTS[currency]}
          oneTimePriceCents={DEFAULT_ONETIME_PRICE_CENTS[currency]}
        />
      </main>
      <Footer />
    </>
  );
}
