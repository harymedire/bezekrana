"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Lock, CheckCircle2 } from "lucide-react";

export function ResetPasswordForm() {
  const t = useTranslations("auth.reset");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Supabase puts the recovery token in the URL fragment; the client SDK reads
  // it on mount and creates a session automatically. We just verify a session
  // is present so we know the link wasn't tampered with.
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasRecoverySession(!!data.session);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("errorTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("errorMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1500);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  if (hasRecoverySession === false) {
    return (
      <div className="text-sm text-coral-700 bg-coral-100 rounded-xl px-3 py-3">
        {t("errorInvalidLink")}
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-teal-500 shadow-soft mb-4">
          <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2.5} />
        </div>
        <p className="text-plum-700">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">{t("newPassword")}</label>
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

      <div>
        <label className="label">{t("confirmPassword")}</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-plum-400" />
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input pl-10"
            autoComplete="new-password"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-coral-700 bg-coral-100 rounded-xl px-3 py-2">{error}</p>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
