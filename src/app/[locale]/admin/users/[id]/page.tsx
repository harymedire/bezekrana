import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { UserDetailForm } from "@/components/admin/UserDetailForm";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import type { Profile } from "@/types/db";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const [{ data: profile }, { data: tracking }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("user_tracking").select("*").eq("user_id", id).maybeSingle(),
  ]);
  if (!profile) notFound();

  // Need service role to read auth.users (for banned_until + last_sign_in_at)
  const service = createSupabaseServiceClient();
  const { data: authData } = await service.auth.admin.getUserById(id);
  const banned_until = authData?.user?.banned_until ?? null;
  const last_sign_in_at = authData?.user?.last_sign_in_at ?? null;

  const isBlocked = !!(banned_until && new Date(banned_until) > new Date());

  return (
    <section className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-plum-600 hover:text-coral-600"
      >
        <ArrowLeft className="h-4 w-4" /> Svi korisnici
      </Link>

      <UserDetailForm
        profile={profile as Profile}
        isBlocked={isBlocked}
        bannedUntil={banned_until}
        lastSignInAt={last_sign_in_at}
        tracking={tracking as UserTracking | null}
      />
    </section>
  );
}

type UserTracking = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page_url: string | null;
  created_at: string;
};
