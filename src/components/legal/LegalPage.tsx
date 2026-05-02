import { useTranslations } from "next-intl";

type Section = { heading: string; body: string };

// Shared layout for terms/privacy/refund. Pulls all strings from the
// `legal.<key>` namespace so we keep markup consistent and translation
// surface tight.
export function LegalPage({ namespace, lastUpdated }: { namespace: string; lastUpdated: string }) {
  const t = useTranslations(namespace);
  const tBase = useTranslations("legal");
  const sections = t.raw("sections") as Section[];

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-20 md:px-6">
      <p className="text-sm text-plum-500 mb-3">
        {tBase("lastUpdated", { date: lastUpdated })}
      </p>
      <h1 className="font-display text-3xl md:text-5xl text-plum-900 mb-4">{t("title")}</h1>
      <p className="text-lg text-plum-700 mb-10 leading-relaxed">{t("intro")}</p>

      <div className="space-y-8">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-xl md:text-2xl text-plum-800 mb-2">{s.heading}</h2>
            <p className="text-plum-700 leading-relaxed whitespace-pre-line">{s.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
