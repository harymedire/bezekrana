import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/lib/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login", locale });

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user!.id)
    .single();

  if (profile?.subscription_status === "active") {
    redirect({ href: "/dashboard", locale });
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Sparkles className="h-12 w-12 mx-auto text-coral-500 mb-4 animate-wiggle" />
        <h1 className="font-display text-4xl text-plum-900 mb-3">Skoro si tu!</h1>
        <p className="text-lg text-plum-700 mb-8">
          Odaberi pretplatu i otključaj svoj prvi paket aktivnosti odmah.
        </p>
        <Link href="/pricing">
          <Button variant="primary" size="lg">Idi na cijene</Button>
        </Link>
      </main>
    </>
  );
}
