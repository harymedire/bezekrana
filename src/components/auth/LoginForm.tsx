"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { Link } from "@/lib/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Mail, Lock } from "lucide-react";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tErr = useTranslations("auth.errors");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message.includes("Invalid") ? tErr("invalidCredentials") : tErr("generic"));
      setLoading(false);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">{t("email")}</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-plum-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input pl-10"
            autoComplete="email"
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label !mb-0">{t("password")}</label>
          <Link
            href="/forgot-password"
            className="text-xs font-bold text-coral-600 hover:underline"
          >
            {t("forgot")}
          </Link>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-plum-400" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input pl-10"
            autoComplete="current-password"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-coral-700 bg-coral-100 rounded-xl px-3 py-2">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "…" : t("submit")}
      </Button>

      <p className="text-center text-sm text-plum-600 pt-2">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-bold text-coral-600 hover:underline">
          {t("signUp")}
        </Link>
      </p>
    </form>
  );
}
