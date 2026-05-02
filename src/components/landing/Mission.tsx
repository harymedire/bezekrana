import { useTranslations } from "next-intl";
import { Clock, HandHeart, Wind } from "lucide-react";

const icons = [Clock, HandHeart, Wind];

export function Mission() {
  const t = useTranslations("landing.mission");
  const items = t.raw("items") as { title: string; body: string }[];

  return (
    <section className="relative bg-gradient-to-b from-cream to-plum-50 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="badge bg-plum-100 text-plum-700 mb-4">
            {t("eyebrow")}
          </span>
          <h2 className="font-display text-3xl md:text-5xl text-plum-900 mt-4 leading-tight">
            {t("title")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((item, i) => {
            const Icon = icons[i];
            return (
              <div
                key={i}
                className="group relative rounded-bubble bg-white p-7 shadow-soft transition hover:-translate-y-1"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-coral-400 to-coral-500 text-white mb-5 shadow-playful">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl mb-2 text-plum-900">{item.title}</h3>
                <p className="text-plum-700 leading-relaxed">{item.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
