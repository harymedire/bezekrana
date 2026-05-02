import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { PasswordForm } from "@/components/auth/PasswordForm";
import type { Profile } from "@/types/db";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const tProfile = await getTranslations("dashboard.profile");
  const tPassword = await getTranslations("dashboard.password");

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();
  const p = profile as Profile;

  return (
    <section className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl text-plum-900">{t("settings")}</h1>

      {/* Profile (full name + email) */}
      <div className="card space-y-4">
        <h2 className="font-display text-xl text-plum-900">{tProfile("title")}</h2>
        <ProfileForm initialFullName={p.full_name ?? ""} email={user!.email!} />
      </div>

      {/* Password change */}
      <div className="card space-y-4">
        <h2 className="font-display text-xl text-plum-900">{tPassword("title")}</h2>
        <PasswordForm />
      </div>

      {/* Subscription state */}
      <div className="card space-y-4">
        <h2 className="font-display text-xl text-plum-900">{t("subscriptionStatus")}</h2>
        <div>
          <p className="text-plum-900 capitalize">
            {t(p.subscription_status === "none" ? "noSubscription" :
                p.subscription_status === "active" ? "active" :
                p.subscription_status === "canceled" ? "canceled" :
                p.subscription_status === "paused" ? "paused" : "noSubscription")}
          </p>
          {p.subscription_status === "active" && p.subscription_ends_at && (
            <p className="text-sm text-plum-500 mt-1">
              {t("nextBilling", {
                date: new Date(p.subscription_ends_at).toLocaleDateString(locale),
              })}
            </p>
          )}
        </div>

        {p.subscription_status === "none" ? (
          <Link href="/pricing">
            <Button variant="primary">{t("subscribeCta")}</Button>
          </Link>
        ) : p.stripe_customer_id ? (
          <a href="/api/stripe/billing-portal" className="btn-secondary inline-flex">
            {t("manageSubscription")}
          </a>
        ) : null}
      </div>

      <div className="card">
        <LogoutButton />
      </div>
    </section>
  );
}
