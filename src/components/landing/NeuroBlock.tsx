import { useTranslations } from "next-intl";
import { Brain } from "lucide-react";

export function NeuroBlock() {
  const t = useTranslations("landing.howItWorks.neuro");
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 md:px-6 md:pt-24">
      <div className="relative rounded-bubble bg-gradient-to-br from-plum-900 via-plum-800 to-plum-700 p-8 md:p-10 shadow-soft overflow-hidden">
        <div className="blob bg-coral-400/30 -top-16 -right-10 h-48 w-48" />
        <div className="blob bg-teal-400/20 -bottom-16 -left-10 h-48 w-48" />

        <div className="relative grid md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-start">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-sun-400 text-plum-900 shadow-playful">
            <Brain className="h-8 w-8" />
          </div>

          <div>
            <h3 className="font-display text-2xl md:text-3xl text-white mb-3">
              {t("title")}
            </h3>
            <p className="text-white/85 text-lg leading-relaxed">
              {t("body")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
