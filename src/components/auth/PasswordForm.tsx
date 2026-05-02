"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Lock, Check } from "lucide-react";

export function PasswordForm() {
  const t = useTranslations("dashboard.password");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

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
      setSavedAt(Date.now());
      setPassword("");
      setConfirm("");
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  const showSaved = savedAt !== null && Date.now() - savedAt < 4000;

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

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? t("submitting") : t("submit")}
        </Button>
        {showSaved && (
          <span className="inline-flex items-center gap-1 text-sm text-teal-700 font-bold">
            <Check className="h-4 w-4" /> {t("success")}
          </span>
        )}
      </div>
    </form>
  );
}
