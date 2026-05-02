import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/lib/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/lib/i18n/navigation";
import { Calendar, Library, AlertTriangle, Settings, ShieldCheck } from "lucide-react";
import { BannerSlot } from "@/components/dashboard/BannerSlot";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login", locale });

  const [{ data: profile }, { count: oneTimeCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, full_name, subscription_status")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("one_time_purchases")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id),
  ]);

  // Paywall: anyone hitting /dashboard without any purchase is sent to /pricing.
  // TEMPORARILY DISABLED in development so we can iterate on the dashboard UI
  // without needing a real subscription. Re-enables automatically in production.
  const everSubscribed = !!profile && profile.subscription_status !== "none";
  const hasOneTime = (oneTimeCount ?? 0) > 0;

  if (process.env.NODE_ENV === "production" && !everSubscribed && !hasOneTime) {
    redirect({ href: "/pricing", locale });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 flex-1">
        <nav className="flex flex-wrap items-center gap-1 mb-2 bg-white rounded-full p-1 shadow-soft w-fit">
          <NavTab href="/dashboard" icon={Calendar}>{t("currentWeek")}</NavTab>
          <NavTab href="/dashboard/archive" icon={Library}>{t("collection")}</NavTab>
          <NavTab href="/dashboard/sos" icon={AlertTriangle}>{t("sos")}</NavTab>
          <NavTab href="/dashboard/settings" icon={Settings}>{t("settings")}</NavTab>
          {profile?.role === "admin" && (
            <NavTab href="/admin" icon={ShieldCheck}>Admin</NavTab>
          )}
        </nav>
        <BannerSlot locale={locale} />
        {children}
      </div>
      <Footer />
    </div>
  );
}

function NavTab({
  href,
  children,
  icon: Icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-plum-700 hover:bg-plum-50"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
