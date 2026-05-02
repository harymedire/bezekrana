import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BannerForm } from "@/components/admin/BannerForm";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import type { Banner } from "@/types/db";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("banners").select("*").eq("id", id).single();
  if (!row) notFound();

  return (
    <section className="space-y-6">
      <Link
        href="/admin/banners"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-plum-600 hover:text-coral-600"
      >
        <ArrowLeft className="h-4 w-4" /> Sve reklame
      </Link>
      <h2 className="font-display text-2xl text-plum-900">Uredi banner</h2>
      <BannerForm initial={row as Banner} />
    </section>
  );
}
