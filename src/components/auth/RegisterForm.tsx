"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useRouter, Link } from "@/lib/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { User, Mail, Lock } from "lucide-react";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const tErr = useTranslations("auth.errors");
  const router = useRouter();
  const locale = useLocale();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError(t("agreementRequired"));
      return;
    }
    if (password.length < 8) {
      setError(tErr("weakPassword"));
      return;
    }
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
        // full_name is picked up by the handle_new_user() trigger and copied
        // into public.profiles. Consent timestamp is kept here for legal trace.
        data: {
          full_name: fullName.trim(),
          terms_accepted_at: new Date().toISOString(),
          terms_version: "2026-04-30",
        },
      },
    });
    if (error) {
      setError(error.message.toLowerCase().includes("registered") ? tErr("emailInUse") : tErr("generic"));
      setLoading(false);
      return;
    }
    // Hit the tracking endpoint to persist UTM data captured by middleware.
    fetch("/api/tracking/persist", { method: "POST" }).catch(() => {});
    // Add to Brevo "bezekrana" free list (#29). Fire-and-forget: a Brevo
    // failure must not block signup completion.
    fetch("/api/brevo/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        locale,
      }),
    }).catch(() => {});
    router.replace("/onboarding");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">{t("name")}</label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-plum-400" />
          <input
            type="text"
            required
            minLength={2}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="input pl-10"
            autoComplete="name"
          />
        </div>
      </div>
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
        <label className="label">{t("password")}</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-plum-400" />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input pl-10"
            autoComplete="new-password"
          />
        </div>
      </div>

      {/* Legal agreement — required for sign-up. The label uses next-intl rich-text
          syntax so the three policy links render inline within the consent string. */}
      <label className="flex items-start gap-3 cursor-pointer rounded-2xl border-2 border-plum-100 bg-plum-50/40 p-3.5 hover:border-plum-200 transition">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="h-5 w-5 mt-0.5 shrink-0 accent-coral-500"
        />
        <span className="text-xs leading-relaxed text-plum-700">
          {t.rich("agreement", {
            terms: (chunks) => (
              <Link href="/terms" target="_blank" className="font-bold text-coral-600 hover:underline">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" target="_blank" className="font-bold text-coral-600 hover:underline">
                {chunks}
              </Link>
            ),
            refund: (chunks) => (
              <Link href="/refund" target="_blank" className="font-bold text-coral-600 hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </span>
      </label>

      {error && (
        <p className="text-sm text-coral-700 bg-coral-100 rounded-xl px-3 py-2">{error}</p>
      )}

      <Button type="submit" disabled={loading || !agreed} className="w-full">
        {loading ? "…" : t("submit")}
      </Button>

      <p className="text-center text-sm text-plum-600">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-bold text-coral-600 hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
}
