import { useTranslations } from "next-intl";
import { Calendar, Wand2, GraduationCap, Zap } from "lucide-react";

const icons = [Calendar, Wand2, GraduationCap, Zap];
const tints = [
  "bg-coral-500",
  "bg-sun-500",
  "bg-teal-500",
  "bg-plum-500",
];

export function Solution() {
  const t = useTranslations("landing.solution");
  const features = t.raw("features") as { title: string; body: string }[];

  return (
    <section className="bg-gradient-to-b from-cream via-coral-50 to-cream py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-5xl text-plum-900 mb-4">{t("title")}</h2>
          <p className="text-lg text-plum-700">{t("subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f, i) => {
            const Icon = icons[i];
            return (
              <div
                key={i}
                className="card flex gap-5 hover:-translate-y-1 transition"
              >
                <div
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${tints[i]} text-white shadow-playful`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl mb-2">{f.title}</h3>
                  <p className="text-plum-700 leading-relaxed">{f.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
