import { useTranslations } from "next-intl";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section className="relative overflow-hidden">
      <div className="blob bg-coral-300 -top-24 -left-24 h-72 w-72" />
      <div className="blob bg-sun-300 top-10 right-10 h-64 w-64" />
      <div className="blob bg-teal-300 bottom-0 left-1/3 h-72 w-72" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <span className="badge bg-sun-200 text-plum-800">
            <Sparkles className="h-3.5 w-3.5" />
            {t("badge")}
          </span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.05] text-plum-900">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-plum-700 max-w-xl">{t("subtitle")}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button variant="primary" size="lg">
                {t("ctaPrimary")} <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="plum" size="lg">
                {t("ctaSecondary")}
              </Button>
            </a>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <div className="flex -space-x-2">
              {["bg-coral-400", "bg-sun-400", "bg-teal-400", "bg-plum-400"].map((c, i) => (
                <div
                  key={i}
                  className={`h-9 w-9 rounded-full border-2 border-cream ${c}`}
                />
              ))}
            </div>
            <p className="text-sm font-bold text-plum-700">{t("trust")}</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-bubble bg-gradient-to-br from-sun-200 via-coral-200 to-teal-200 blur-2xl opacity-70" />
          <div className="relative animate-float">
            <div className="rounded-bubble bg-white shadow-soft p-6 rotate-[-3deg]">
              <div className="rounded-2xl bg-gradient-to-br from-coral-100 to-sun-100 p-6 mb-4">
                <div className="text-xs font-bold uppercase tracking-wide text-coral-700">Sedmični sistem #1</div>
                <h3 className="font-display text-2xl text-plum-900 mt-1">Moć običnih stvari</h3>
                <p className="text-sm text-plum-700 mt-2">
                  7 dana u kojima dijete zaboravi na ekran.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { day: "Pon", title: "Tajna misija: Boje" },
                  { day: "Uto", title: "Tunel za spašavanje" },
                  { day: "Sri", title: "Riječ dana (tajna riječ)" },
                  { day: "Čet", title: "Mini kuhar" },
                ].map((d, i) => (
                  <div key={i} className="rounded-xl bg-cream border-2 border-plum-100 p-3">
                    <div className="text-xs font-bold text-plum-500">{d.day}</div>
                    <div className="text-sm font-bold text-plum-800 mt-0.5 leading-snug">
                      {d.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-4 rounded-2xl bg-teal-500 text-white px-4 py-2 shadow-playful font-bold rotate-[6deg] animate-wiggle">
              7 dana aktivnosti
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
