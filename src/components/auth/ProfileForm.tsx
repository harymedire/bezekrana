"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Check, User, Mail } from "lucide-react";

type Props = {
  initialFullName: string;
  email: string;
};

export function ProfileForm({ initialFullName, email }: Props) {
  const t = useTranslations("dashboard.profile");
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError(t("errorTooShort"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim() }),
      });
      if (!res.ok) throw new Error("save-failed");
      setSavedAt(Date.now());
      router.refresh();
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSaving(false);
    }
  }

  const showSaved = savedAt !== null && Date.now() - savedAt < 4000;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">{t("fullName")}</label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-plum-400" />
          <input
            type="text"
            required
            minLength={2}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t("fullNamePlaceholder")}
            className="input pl-10"
            autoComplete="name"
          />
        </div>
      </div>

      <div>
        <label className="label">{t("email")}</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-plum-400" />
          <input type="email" disabled value={email} className="input pl-10 bg-plum-50/50 text-plum-500" />
        </div>
        <p className="mt-1 text-xs text-plum-500">{t("emailNote")}</p>
      </div>

      {error && (
        <p className="text-sm text-coral-700 bg-coral-100 rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? t("saving") : t("save")}
        </Button>
        {showSaved && (
          <span className="inline-flex items-center gap-1 text-sm text-teal-700 font-bold">
            <Check className="h-4 w-4" /> {t("saved")}
          </span>
        )}
      </div>
    </form>
  );
}
