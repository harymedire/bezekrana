import { setRequestLocale } from "next-intl/server";
import { BannerForm } from "@/components/admin/BannerForm";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default async function NewBannerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="space-y-6">
      <Link
        href="/admin/banners"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-plum-600 hover:text-coral-600"
      >
        <ArrowLeft className="h-4 w-4" /> Sve reklame
      </Link>
      <h2 className="font-display text-2xl text-plum-900">Novi banner</h2>
      <BannerForm />
    </section>
  );
}
