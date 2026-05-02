"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { Check, Lock, Download, Baby, Home } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import type { Currency } from "@/types/db";

type Mode = "subscribe" | "oneTime";

type Props = {
  currency: Currency;
  subscribePriceCents: number;
  oneTimePriceCents: number;
};

export function PricingTabs({ currency, subscribePriceCents, oneTimePriceCents }: Props) {
  const t = useTranslations("pricing");
  const [mode, setMode] = useState<Mode>("subscribe");

  const subPrice = formatMoney(subscribePriceCents, currency);
  const oneTimePrice = formatMoney(oneTimePriceCents, currency);

  return (
    <div className="space-y-8">
      {/* Tab switcher — blended into the page bg, kept low-key on purpose */}
      <div className="mx-auto bg-plum-100/30 rounded-full p-1 inline-flex">
        <TabButton active={mode === "subscribe"} onClick={() => setMode("subscribe")}>
          {t("tabs.subscribe")}
        </TabButton>
        <TabButton active={mode === "oneTime"} onClick={() => setMode("oneTime")}>
          {t("tabs.oneTime")}
        </TabButton>
      </div>

      {/* Single card whose content swaps with the tab */}
      <div className="max-w-xl mx-auto">
        {mode === "subscribe" ? (
          <SubscribeCard
            subPrice={subPrice}
            oneTimePrice={oneTimePrice}
            subPriceCents={subscribePriceCents}
            oneTimePriceCents={oneTimePriceCents}
          />
        ) : (
          <OneTimeCard oneTimePrice={oneTimePrice} />
        )}
      </div>

      {/* Trust row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
        <TrustItem icon={Lock} label={t("trust.secure")} />
        <TrustItem icon={Download} label={t("trust.instant")} />
        <TrustItem icon={Baby} label={t("trust.age")} />
        <TrustItem icon={Home} label={t("trust.home")} />
      </div>

      {/* Small footnote */}
      <p className="max-w-2xl mx-auto text-center text-sm text-plum-600 leading-relaxed pt-2">
        {t("note")}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-5 py-2 text-sm transition",
        active
          // Active blends with page bg (cream); only weight + text colour signal state
          ? "bg-cream text-plum-900 font-bold"
          : "text-plum-500 font-medium hover:text-plum-700",
      )}
    >
      {children}
    </button>
  );
}

function SubscribeCard({
  subPrice,
  oneTimePrice,
  subPriceCents,
  oneTimePriceCents,
}: {
  subPrice: string;
  oneTimePrice: string;
  subPriceCents: number;
  oneTimePriceCents: number;
}) {
  const t = useTranslations("pricing.subscribe");
  const features = t.raw("features") as string[];

  // % saved compared to one-time price, rounded to nearest int.
  const percent = Math.round(((oneTimePriceCents - subPriceCents) / oneTimePriceCents) * 100);

  return (
    <div className="relative card pt-10">
      <span className="absolute -top-3 right-6 badge bg-sun-400 text-plum-900 shadow-soft px-3 py-1.5">
        ★ {t("label")}
      </span>
      <h2 className="font-display text-3xl text-plum-900 mb-2 pr-2">
        {t("title", { percent })}
      </h2>
      <p className="text-plum-600 mb-6">{t("tagline")}</p>

      <div className="flex items-baseline gap-3 mb-6 flex-wrap">
        <span className="font-display text-2xl text-plum-400 line-through decoration-plum-300 decoration-2">
          {oneTimePrice}
        </span>
        <span className="font-display text-5xl text-plum-900">{subPrice}</span>
        <span className="text-plum-500">{t("perWeek")}</span>
      </div>

      <ul className="space-y-2.5 mb-7">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-plum-700">
            <Check className="h-5 w-5 mt-0.5 text-teal-500 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={{ pathname: "/checkout", query: { mode: "subscription" } }}
        className="block w-full text-center btn-secondary"
      >
        {t("cta")}
      </Link>
      <p className="mt-3 text-[11px] text-plum-400 text-center font-medium">
        {t("fineprint", { price: subPrice })}
      </p>
    </div>
  );
}

function OneTimeCard({ oneTimePrice }: { oneTimePrice: string }) {
  const t = useTranslations("pricing.oneTime");
  const features = t.raw("features") as string[];
  return (
    <div className="relative rounded-bubble bg-gradient-to-br from-coral-500 to-coral-400 p-8 text-white shadow-soft">
      <h2 className="font-display text-3xl text-white mb-2">{t("title")}</h2>
      <p className="text-white/90 mb-6">{t("tagline")}</p>

      <div className="flex items-baseline gap-1 mb-6">
        <span className="font-display text-5xl">{oneTimePrice}</span>
        <span className="text-white/80">{t("perPack")}</span>
      </div>

      <p className="text-white/90 mb-5">{t("description")}</p>

      <ul className="space-y-2.5 mb-7">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="h-5 w-5 mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={{ pathname: "/checkout", query: { mode: "onetime" } }}
        className="block w-full text-center btn-yellow !shadow-[0_6px_0_0_rgba(0,0,0,0.2)]"
      >
        {t("cta")}
      </Link>
      <p className="mt-3 text-[11px] text-white/55 text-center font-medium">{t("fineprint")}</p>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-soft">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-100 text-teal-700 shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-sm font-bold text-plum-800">{label}</span>
    </div>
  );
}
