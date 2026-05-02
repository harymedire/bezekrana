import { setRequestLocale } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import type { Banner } from "@/types/db";

const MAX_PER_LOCALE = 5;

export default async function AdminBannersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("banners")
    .select("*")
    .order("locale", { ascending: true })
    .order("sort_order", { ascending: true });
  const banners = (rows ?? []) as Banner[];

  // Group by locale for the per-locale capacity counter.
  const byLocale: Record<string, Banner[]> = { bs: [], sr: [], hr: [] };
  for (const b of banners) {
    if (byLocale[b.locale]) byLocale[b.locale].push(b);
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-plum-900">Reklame</h2>
          <p className="text-sm text-plum-500">
            336 × 288 px · Maksimalno {MAX_PER_LOCALE} aktivnih po jeziku · rotira se nasumično
          </p>
        </div>
        <Link href="/admin/banners/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" /> Novi banner
          </Button>
        </Link>
      </div>

      {/* Per-locale capacity hint */}
      <div className="grid grid-cols-3 gap-3">
        {(["bs", "sr", "hr"] as const).map((loc) => {
          const active = byLocale[loc].filter((b) => b.is_active).length;
          const total = byLocale[loc].length;
          return (
            <div key={loc} className="card text-center">
              <div className="text-xs uppercase tracking-wider font-bold text-plum-500">{loc}</div>
              <div className="font-display text-2xl text-plum-900">
                {active}<span className="text-plum-300">/{MAX_PER_LOCALE}</span>
              </div>
              <div className="text-xs text-plum-500">{total} ukupno</div>
            </div>
          );
        })}
      </div>

      {banners.length === 0 ? (
        <div className="card text-center py-12 text-plum-500">
          Još nema banner reklama. Kreiraj prvu.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="card">
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image_url}
                  alt={b.title ?? ""}
                  className="w-32 h-auto rounded-lg border border-plum-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge bg-plum-100 text-plum-700 uppercase">{b.locale}</span>
                    {b.is_active ? (
                      <span className="badge bg-teal-100 text-teal-700">Aktivan</span>
                    ) : (
                      <span className="badge bg-coral-100 text-coral-700">Pauziran</span>
                    )}
                  </div>
                  <h3 className="font-display text-lg text-plum-900 line-clamp-1">
                    {b.title || "(bez naslova)"}
                  </h3>
                  <a
                    href={b.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-coral-600 hover:underline mt-1 truncate max-w-full"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{b.link_url}</span>
                  </a>
                  <div className="mt-3">
                    <Link
                      href={`/admin/banners/${b.id}`}
                      className="inline-flex items-center gap-1 text-coral-600 font-bold hover:underline text-sm"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Uredi
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
