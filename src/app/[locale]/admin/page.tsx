import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, ShoppingBag } from "lucide-react";
import { formatMoney, DEFAULT_ONETIME_PRICE_CENTS } from "@/lib/utils/money";
import type { ContentPack, Currency } from "@/types/db";

export default async function AdminPacksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.packs");

  const supabase = await createSupabaseServerClient();
  const { data: packs } = await supabase
    .from("content_packs")
    .select("*")
    .order("locale", { ascending: true })
    .order("sequence_number", { ascending: true });

  const list = (packs ?? []) as ContentPack[];

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-plum-900">{t("title")}</h2>
        <Link href="/admin/packs/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" /> {t("newPack")}
          </Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="card text-center py-12 text-plum-500">{t("noPacks")}</div>
      ) : (
        <div className="overflow-hidden rounded-bubble bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-plum-50 text-plum-700">
              <tr>
                <th className="px-4 py-3 font-bold">{t("sequence")}</th>
                <th className="px-4 py-3 font-bold">{t("locale")}</th>
                <th className="px-4 py-3 font-bold">{t("packTitle")}</th>
                <th className="px-4 py-3 font-bold">{t("oneTimeAvailable")}</th>
                <th className="px-4 py-3 font-bold text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-plum-50">
              {list.map((p) => {
                const currency = (p.one_time_currency ?? "BAM") as Currency;
                const price =
                  p.one_time_price_cents ?? DEFAULT_ONETIME_PRICE_CENTS[currency];
                return (
                  <tr key={p.id} className="hover:bg-cream/60">
                    <td className="px-4 py-3 font-bold text-plum-900">#{p.sequence_number}</td>
                    <td className="px-4 py-3 uppercase text-plum-500">{p.locale}</td>
                    <td className="px-4 py-3 text-plum-900">{p.title}</td>
                    <td className="px-4 py-3">
                      {p.one_time_available ? (
                        <span className="badge bg-teal-100 text-teal-700">
                          <ShoppingBag className="h-3 w-3" /> {formatMoney(price, currency)}
                        </span>
                      ) : (
                        <span className="text-plum-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/packs/${p.id}`}
                        className="inline-flex items-center gap-1 text-coral-600 font-bold hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" /> {t("edit")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
