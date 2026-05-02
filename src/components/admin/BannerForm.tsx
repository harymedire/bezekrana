"use client";

import { useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Save, Trash2, Image as ImageIcon } from "lucide-react";
import type { Banner } from "@/types/db";

const LOCALES = [
  { code: "bs", label: "Bosanski" },
  { code: "sr", label: "Srpski" },
  { code: "hr", label: "Hrvatski" },
] as const;

export function BannerForm({ initial }: { initial?: Banner }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [locale, setLocale] = useState(initial?.locale ?? "bs");
  const [linkUrl, setLinkUrl] = useState(initial?.link_url ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image_url ?? null);

  function onPickImage(file: File | null) {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else if (initial) {
      setImagePreview(initial.image_url);
    } else {
      setImagePreview(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!initial && !imageFile) {
      setError("Odaberi sliku bannera.");
      return;
    }
    if (!linkUrl.startsWith("http")) {
      setError("Link mora počinjati sa http:// ili https://");
      return;
    }
    setSaving(true);

    const fd = new FormData();
    if (initial) fd.set("id", initial.id);
    fd.set("title", title);
    fd.set("locale", locale);
    fd.set("link_url", linkUrl);
    fd.set("is_active", String(isActive));
    if (imageFile) fd.set("image", imageFile);

    const res = await fetch("/api/admin/banners", { method: "POST", body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "save-failed");
      setSaving(false);
      return;
    }
    router.push("/admin/banners");
    router.refresh();
  }

  async function onDelete() {
    if (!initial) return;
    if (!confirm("Obrisati banner?")) return;
    const res = await fetch(`/api/admin/banners?id=${initial.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/banners");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-5">
      <div>
        <label className="label">Slika bannera (336 × 288 px)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
          className="input"
          required={!initial}
        />
        {imagePreview && (
          <div className="mt-3 flex flex-col items-start gap-2">
            <span className="text-xs text-plum-500">Pregled:</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt=""
              className="rounded-xl border border-plum-100"
              style={{ width: 336, height: 288, objectFit: "cover" }}
            />
          </div>
        )}
        {!imagePreview && (
          <div className="mt-3 grid place-items-center w-[336px] h-[288px] rounded-xl border-2 border-dashed border-plum-200 bg-plum-50/50 text-plum-400">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Naslov (interna oznaka)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="npr. Mama market — letnja kampanja"
            className="input"
          />
        </div>
        <div>
          <label className="label">Jezik</label>
          <select value={locale} onChange={(e) => setLocale(e.target.value as typeof locale)} className="input">
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Link (kuda vodi klik)</label>
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://primjer.com/proizvod"
          className="input"
          required
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-5 w-5 accent-coral-500"
        />
        <span className="font-bold text-plum-800">Aktivno (prikazuje se korisnicima)</span>
      </label>

      {error && <p className="text-sm text-coral-700 bg-coral-100 rounded-xl px-3 py-2">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "…" : "Spasi"}
        </Button>
        {initial && (
          <Button type="button" variant="ghost" onClick={onDelete} className="!text-coral-700">
            <Trash2 className="h-4 w-4" /> Obriši
          </Button>
        )}
      </div>
    </form>
  );
}
