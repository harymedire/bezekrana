import { setRequestLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.forgot");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-12 md:py-20">
        <div className="card">
          <h1 className="font-display text-3xl text-plum-900 mb-1">{t("title")}</h1>
          <p className="text-plum-600 mb-6">{t("subtitle")}</p>
          <ForgotPasswordForm />
        </div>
      </main>
    </>
  );
}
