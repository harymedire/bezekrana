"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgot");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    // We don't surface "no such user" to avoid email enumeration — Supabase
    // also returns a generic ok in that case.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSent(true);
    setSubmitting(false);
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-teal-500 shadow-soft mb-4">
          <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="font-display text-xl text-plum-900 mb-2">{t("successTitle")}</h2>
        <p className="text-plum-700 leading-relaxed mb-6">{t("successBody")}</p>
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-coral-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? t("submitting") : t("submit")}
      </Button>

      <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-plum-600 hover:text-coral-600">
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>
    </form>
  );
}
