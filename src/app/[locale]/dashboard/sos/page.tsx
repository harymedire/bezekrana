import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SosTip } from "@/types/db";

export default async function SosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const supabase = await createSupabaseServerClient();
  const { data: tips } = await supabase
    .from("sos_tips")
    .select("*")
    .in("locale", [locale, "en"]) // fallback to English if locale-specific tips missing
    .order("sort_order", { ascending: true });

  // Prefer locale-specific tips when both exist for the same sort_order.
  const seen = new Set<number>();
  const list = (tips as SosTip[] | null ?? [])
    .sort((a, b) => (a.locale === locale ? -1 : 1))
    .filter((tip) => {
      if (seen.has(tip.sort_order)) return false;
      seen.add(tip.sort_order);
      return true;
    });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-plum-900">{t("sos")}</h1>
        <p className="text-plum-600">{t("sosSubtitle")}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((tip) => (
          <div key={tip.id} className="card hover:-translate-y-0.5 transition">
            <h3 className="font-display text-lg text-plum-900 mb-2">{tip.title}</h3>
            <p className="text-sm text-plum-700 leading-relaxed">{tip.body}</p>
          </div>
        ))}
        {list.length === 0 && (
          <p className="col-span-full text-center text-plum-500 py-10">
            Još nema SOS ideja u ovom jeziku.
          </p>
        )}
      </div>
    </section>
  );
}
