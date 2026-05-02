import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Download } from "lucide-react";
import { userCanAccessPack } from "@/lib/utils/access";
import type { ContentPack, OneTimePurchase, Profile } from "@/types/db";

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: packs }, { data: purchases }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase
      .from("content_packs")
      .select("*")
      .eq("locale", locale)
      .eq("published", true)
      .order("sequence_number", { ascending: true }),
    supabase.from("one_time_purchases").select("pack_id").eq("user_id", user!.id),
  ]);

  const typedProfile = profile as Profile | null;
  const typedPacks = (packs ?? []) as ContentPack[];
  const typedPurchases = (purchases ?? []) as Pick<OneTimePurchase, "pack_id">[];

  const unlocked = typedPacks.filter((p) =>
    userCanAccessPack(p, typedProfile, typedPurchases),
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-plum-900">{t("collection")}</h1>
        <p className="text-plum-600">{t("collectionSubtitle")}</p>
      </div>

      {unlocked.length === 0 ? (
        <div className="card text-center py-12 text-plum-500">
          {t("noPackYet")}
        </div>
      ) : (
        <ul className="divide-y divide-plum-100 bg-white rounded-bubble shadow-soft overflow-hidden">
          {unlocked.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-cream/60">
              <div className="min-w-0">
                <div className="text-xs font-bold text-coral-600">
                  {t("weekN", { n: p.sequence_number })}
                </div>
                <div className="font-bold text-plum-900 truncate">{p.title}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.pdf_storage_path_no_bg && (
                  <a
                    href={`/api/content/download/${p.id}?bw=1`}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full border-2 border-plum-100 px-3 py-1.5 text-xs font-bold text-plum-700 hover:border-plum-300 hover:bg-plum-50 transition"
                    title="Verzija bez pozadinskih boja"
                  >
                    <Download className="h-3 w-3" /> Bez pozadina
                  </a>
                )}
                <a href={`/api/content/download/${p.id}`} className="btn-primary">
                  <Download className="h-4 w-4" /> {t("download")}
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
