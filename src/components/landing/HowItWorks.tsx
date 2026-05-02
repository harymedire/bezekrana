import { useTranslations } from "next-intl";

type Step = { title: string; subtitle?: string; body: string };

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <h2 className="font-display text-3xl md:text-5xl text-center text-plum-900 mb-12">
        {t("title")}
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="card h-full flex flex-col">
            <div className="font-display text-7xl text-coral-200 leading-none mb-2">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="font-display text-xl mb-1.5">{step.title}</h3>
            {step.subtitle && (
              <p className="text-coral-600 font-bold mb-2">{step.subtitle}</p>
            )}
            <p className="text-plum-700 leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
