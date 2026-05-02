import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/lib/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.register");

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect({ href: "/dashboard", locale });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-12 md:py-20">
        <div className="card">
          <h1 className="font-display text-3xl text-plum-900 mb-1">{t("title")}</h1>
          <p className="text-plum-600 mb-6">{t("subtitle")}</p>
          <RegisterForm />
        </div>
      </main>
    </>
  );
}
