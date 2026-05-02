import { useTranslations } from "next-intl";
import { Sunrise, CloudRain, Boxes, ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";

const icons = [Sunrise, CloudRain, Boxes];

export function Problem() {
  const t = useTranslations("landing.problem");
  const items = t.raw("items") as { eyebrow: string; title: string; body: string }[];
  const differentScenario = t("differentScenario");

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <h2 className="font-display text-3xl md:text-5xl text-center text-plum-900 mb-12">
        {t("title")}
      </h2>
      <div className="grid md:grid-cols-3 gap-5">
        {items.map((item, i) => {
          const Icon = icons[i];
          return (
            <Link
              href="/register"
              key={i}
              className="group relative block overflow-hidden rounded-bubble border border-plum-100 bg-white p-7 transition-all duration-300 hover:bg-plum-900 hover:border-plum-900 hover:-translate-y-1 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-coral-300/50"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral-100 text-coral-600 transition group-hover:bg-coral-500 group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-coral-600 transition group-hover:text-sun-300">
                    {item.eyebrow}
                  </span>
                </div>

                <h3 className="font-display text-xl mb-3 text-plum-900 transition group-hover:text-white leading-snug">
                  {item.title}
                </h3>
                <p className="text-plum-700 transition group-hover:text-white/85 leading-relaxed">
                  {item.body}
                </p>

                {/* Reveals on hover — the "promise" line */}
                <div className="mt-5 flex items-center gap-2 text-sun-300 font-bold text-sm opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  <ArrowRight className="h-4 w-4" />
                  <span>{differentScenario}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
