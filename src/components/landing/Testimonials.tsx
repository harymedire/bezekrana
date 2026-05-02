import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";

export function Testimonials() {
  const t = useTranslations("landing.testimonials");
  const items = t.raw("items") as { quote: string; author: string }[];

  return (
    <section className="bg-plum-50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-display text-3xl md:text-5xl text-center text-plum-900 mb-12">
          {t("title")}
        </h2>
        {/* auto-rows-fr keeps every card in the same row at equal height; flex-col
            on the card itself pushes the author block to the bottom regardless
            of quote length, so the visual rhythm stays uniform. */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
          {items.map((it, i) => (
            <div key={i} className="card relative h-full flex flex-col">
              <Quote className="absolute -top-4 left-6 h-9 w-9 text-coral-400 fill-coral-400" />
              <p className="text-plum-800 font-medium leading-relaxed pt-2 grow">
                &ldquo;{it.quote}&rdquo;
              </p>
              <p className="mt-4 text-sm font-bold text-plum-500 shrink-0">— {it.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
