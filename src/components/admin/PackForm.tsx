"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Save, Trash2 } from "lucide-react";
import { locales } from "@/lib/i18n/config";
import type { ContentPack, Currency, Locale } from "@/types/db";

const CURRENCIES: Currency[] = ["BAM", "EUR", "USD"];

// Storage paths look like "bs/2-1714519200000.pdf" — show just the leaf so
// the admin can recognize the file at a glance.
function fileNameFromPath(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.split("/").pop() || path;
}

export function PackForm({
  initial,
  defaultSequence = 1,
}: {
  initial?: ContentPack;
  defaultSequence?: number;
}) {
  const t = useTranslations("admin.packs");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sequence, setSequence] = useState<number>(initial?.sequence_number ?? defaultSequence);
  const [locale, setLocale] = useState<Locale>((initial?.locale as Locale) ?? "bs");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfNoBgFile, setPdfNoBgFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [oneTimeAvailable, setOneTimeAvailable] = useState(initial?.one_time_available ?? false);
  const [oneTimePriceCents, setOneTimePriceCents] = useState<string>(
    initial?.one_time_price_cents != null ? String(initial.one_time_price_cents) : "",
  );
  const [oneTimeCurrency, setOneTimeCurrency] = useState<Currency>(
    (initial?.one_time_currency as Currency) ?? "BAM",
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const fd = new FormData();
    if (initial) fd.set("id", initial.id);
    fd.set("sequence_number", String(sequence));
    fd.set("locale", locale);
    fd.set("title", title);
    fd.set("description", description);
    fd.set("one_time_available", String(oneTimeAvailable));
    if (oneTimePriceCents) fd.set("one_time_price_cents", oneTimePriceCents);
    fd.set("one_time_currency", oneTimeCurrency);
    if (pdfFile) fd.set("pdf", pdfFile);
    if (pdfNoBgFile) fd.set("pdf_no_bg", pdfNoBgFile);
    if (thumbFile) fd.set("thumbnail", thumbFile);

    const res = await fetch("/api/admin/packs", { method: "POST", body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "save-failed");
      setSaving(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function onDelete() {
    if (!initial) return;
    if (!confirm("Obrisati paket?")) return;
    const res = await fetch(`/api/admin/packs?id=${initial.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">{t("sequence")}</label>
          <input
            type="number"
            min={1}
            required
            value={sequence}
            onChange={(e) => setSequence(Number(e.target.value))}
            className="input"
          />
        </div>
        <div>
          <label className="label">{t("locale")}</label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="input"
          >
            {locales.map((l) => (
              <option key={l} value={l}>{l.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">{t("packTitle")}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input" />
      </div>

      <div>
        <label className="label">{t("description")}</label>
        <textarea
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          className="input min-h-24"
        />
      </div>

      <div>
        <label className="label">
          PDF (verzija sa bojama) {initial && <span className="text-plum-400 font-normal">(ostavi prazno da ne mijenjaš)</span>}
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
          className="input"
          required={!initial}
        />
        <p className="mt-1 text-xs text-plum-500">Glavna verzija sa živim bojama, gradijentima i ilustracijama.</p>
        {initial?.pdf_storage_path && !pdfFile && (
          <p className="mt-1 text-xs text-teal-700 font-bold break-all">
            ✓ Trenutno: <span className="font-mono font-normal text-plum-700">{fileNameFromPath(initial.pdf_storage_path)}</span>
          </p>
        )}
      </div>

      <div>
        <label className="label">
          PDF (bez pozadinskih boja) <span className="text-plum-400 font-normal">— opcionalno</span>
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfNoBgFile(e.target.files?.[0] ?? null)}
          className="input"
        />
        <p className="mt-1 text-xs text-plum-500">B&amp;W / štedljiva za štampu — generiši iz iste šablone sa „Bez pozadinskih boja“ uključenim.</p>
        {initial?.pdf_storage_path_no_bg && !pdfNoBgFile && (
          <p className="mt-1 text-xs text-teal-700 font-bold break-all">
            ✓ Trenutno: <span className="font-mono font-normal text-plum-700">{fileNameFromPath(initial.pdf_storage_path_no_bg)}</span>
          </p>
        )}
      </div>

      <div>
        <label className="label">{t("thumbnail")}</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)}
          className="input"
        />
        {initial?.thumbnail_url && !thumbFile && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={initial.thumbnail_url}
              alt=""
              className="h-16 w-12 object-cover rounded-lg border border-plum-200"
            />
            <p className="text-xs text-teal-700 font-bold break-all">
              ✓ Trenutno: <span className="font-mono font-normal text-plum-700">{fileNameFromPath(initial.thumbnail_url)}</span>
            </p>
          </div>
        )}
      </div>

      {/* One-time block — admin can flip this on/off and override the price per pack. */}
      <div className="rounded-2xl border-2 border-plum-100 p-4 space-y-4 bg-plum-50/40">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={oneTimeAvailable}
            onChange={(e) => setOneTimeAvailable(e.target.checked)}
            className="h-5 w-5 accent-coral-500"
          />
          <span className="font-bold text-plum-800">{t("oneTimeAvailable")}</span>
        </label>
        {oneTimeAvailable && (
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label">{t("oneTimePriceOverride")} (cents)</label>
              <input
                type="number"
                min={0}
                value={oneTimePriceCents}
                onChange={(e) => setOneTimePriceCents(e.target.value)}
                placeholder="(default)"
                className="input"
              />
            </div>
            <div>
              <label className="label">Valuta</label>
              <select
                value={oneTimeCurrency}
                onChange={(e) => setOneTimeCurrency(e.target.value as Currency)}
                className="input"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-coral-700 bg-coral-100 rounded-xl px-3 py-2">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "…" : t("save")}
        </Button>
        {initial && (
          <Button type="button" variant="ghost" onClick={onDelete} className="!text-coral-700">
            <Trash2 className="h-4 w-4" /> {t("delete")}
          </Button>
        )}
      </div>
    </form>
  );
}
