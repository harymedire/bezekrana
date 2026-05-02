import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PackForm } from "@/components/admin/PackForm";
import type { ContentPack } from "@/types/db";

export default async function EditPackPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const { data: pack } = await supabase
    .from("content_packs")
    .select("*")
    .eq("id", id)
    .single();
  if (!pack) notFound();

  return <PackForm initial={pack as ContentPack} />;
}
