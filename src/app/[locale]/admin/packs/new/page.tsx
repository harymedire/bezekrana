import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/lib/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PackForm } from "@/components/admin/PackForm";

export default async function NewPackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login", locale });

  // Pre-pick the next free sequence number for the default locale so the
  // admin doesn't accidentally collide with an existing pack on the unique
  // (sequence_number, locale) constraint.
  const { data: lastPack } = await supabase
    .from("content_packs")
    .select("sequence_number")
    .eq("locale", "bs")
    .order("sequence_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const defaultSequence = (lastPack?.sequence_number ?? 0) + 1;

  return <PackForm defaultSequence={defaultSequence} />;
}
