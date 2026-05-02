import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import type { Profile } from "@/types/db";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.users");

  const supabase = await createSupabaseServerClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const list = (users ?? []) as Profile[];

  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl text-plum-900">{t("title")}</h2>
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
          </tbody>
        </table>
      </div>
    </section>
  );
}
