"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const t = useTranslations("nav");
  const router = useRouter();

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={logout}>
      <LogOut className="h-4 w-4" /> {t("logout")}
    </Button>
  );
}
