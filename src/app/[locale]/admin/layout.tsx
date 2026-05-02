import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/lib/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/lib/i18n/navigation";
import { Package, Users, Megaphone } from "lucide-react";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login", locale });
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (profile?.role !== "admin") redirect({ href: "/dashboard", locale });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 flex-1">
        <h1 className="font-display text-3xl text-plum-900 mb-6">{t("title")}</h1>
        <nav className="flex flex-wrap items-center gap-1 mb-8 bg-white rounded-full p-1 shadow-soft w-fit">
          <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-plum-700 hover:bg-plum-50">
            <Package className="h-4 w-4" /> {t("tabs.packs")}
          </Link>
          <Link href="/admin/users" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-plum-700 hover:bg-plum-50">
            <Users className="h-4 w-4" /> {t("tabs.users")}
          </Link>
          <Link href="/admin/banners" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-plum-700 hover:bg-plum-50">
            <Megaphone className="h-4 w-4" /> Reklame
          </Link>
        </nav>
        {children}
      </div>
      <Footer />
    </div>
  );
}
