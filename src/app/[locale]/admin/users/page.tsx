import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import type { Profile } from "@/types/db";

const PAGE_SIZE = 25;
const STATUS_FILTERS = ["all", "active", "canceled", "paused", "past_due", "none"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; sort?: string; page?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("admin.users");

  const status: StatusFilter = (STATUS_FILTERS as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as StatusFilter)
    : "all";
  const sort: "newest" | "oldest" = sp.sort === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: sort === "oldest" });

  if (status !== "all") {
    query = query.eq("subscription_status", status);
  }
  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: users, count } = await query;
  const list = (users ?? []) as Profile[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (overrides: { status?: string; sort?: string; page?: number }) => {
    const params = new URLSearchParams();
    const s = overrides.status ?? status;
    const so = overrides.sort ?? sort;
    const p = overrides.page ?? page;
    if (s !== "all") params.set("status", s);
    if (so !== "newest") params.set("sort", so);
    if (p !== 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/users${qs ? `?${qs}` : ""}`;
  };

  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl text-plum-900">{t("title")}</h2>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s}
              href={buildHref({ status: s, page: 1 })}
              className={`badge ${
                status === s
                  ? "bg-plum-600 text-white"
                  : "bg-plum-100 text-plum-700 hover:bg-plum-200"
              }`}
            >
              {t(`filters.${s}`)}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-plum-600">{t("sort.label")}:</span>
          <Link
            href={buildHref({ sort: "newest", page: 1 })}
            className={`badge ${
              sort === "newest"
                ? "bg-plum-600 text-white"
                : "bg-plum-100 text-plum-700 hover:bg-plum-200"
            }`}
          >
            {t("sort.newest")}
          </Link>
          <Link
            href={buildHref({ sort: "oldest", page: 1 })}
            className={`badge ${
              sort === "oldest"
                ? "bg-plum-600 text-white"
                : "bg-plum-100 text-plum-700 hover:bg-plum-200"
            }`}
          >
            {t("sort.oldest")}
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-bubble bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-plum-50 text-plum-700">
            <tr>
              <th className="px-4 py-3 font-bold">{t("email")}</th>
              <th className="px-4 py-3 font-bold">{t("status")}</th>
              <th className="px-4 py-3 font-bold">{t("weeksConsumed")}</th>
              <th className="px-4 py-3 font-bold">{t("subscribed")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-plum-50">
            {list.map((u) => (
              <tr key={u.id} className="hover:bg-cream/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-plum-900 font-bold hover:text-coral-600 hover:underline"
                  >
                    {u.email}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${
                    u.subscription_status === "active" ? "bg-teal-100 text-teal-700"
                    : u.subscription_status === "canceled" ? "bg-coral-100 text-coral-700"
                    : u.subscription_status === "paused" ? "bg-sun-100 text-sun-800"
                    : "bg-plum-100 text-plum-600"
                  }`}>
                    {u.subscription_status}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-plum-900">{u.weeks_consumed}</td>
                <td className="px-4 py-3 text-plum-500">
                  {u.subscription_started_at
                    ? new Date(u.subscription_started_at).toLocaleDateString(locale)
                    : "—"}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-plum-500">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-plum-600">{t("pagination.count", { count: total })}</p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={buildHref({ page: page - 1 })}
                className="badge bg-plum-100 text-plum-700 hover:bg-plum-200"
              >
                ← {t("pagination.prev")}
              </Link>
            ) : (
              <span className="badge bg-plum-50 text-plum-300">← {t("pagination.prev")}</span>
            )}
            <span className="font-bold text-plum-700">
              {t("pagination.page", { page, total: totalPages })}
            </span>
            {page < totalPages ? (
              <Link
                href={buildHref({ page: page + 1 })}
                className="badge bg-plum-100 text-plum-700 hover:bg-plum-200"
              >
                {t("pagination.next")} →
              </Link>
            ) : (
              <span className="badge bg-plum-50 text-plum-300">{t("pagination.next")} →</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
