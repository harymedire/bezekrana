"use client";

import { useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { User, Mail, ShieldOff, ShieldCheck, Pause, Play, PlusCircle, MinusCircle, Save, BadgeCheck, BadgeX, Trash2 } from "lucide-react";
import type { Profile } from "@/types/db";

type Tracking = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page_url: string | null;
  created_at: string;
};

type Props = {
  profile: Profile;
  isBlocked: boolean;
  bannedUntil: string | null;
  lastSignInAt: string | null;
  tracking: Tracking | null;
};

// Admin user-management form. Calls /api/admin/users/[id] PATCH for every
// action; shows inline status messages. Designed to be incrementally
// expanded — refund history, payment events, etc. later.
export function UserDetailForm({ profile, isBlocked, lastSignInAt, tracking }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [email, setEmail] = useState(profile.email);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function call(action: string, payload: Record<string, unknown> = {}) {
    setBusy(action);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "request-failed");
      setMsg({ kind: "ok", text: "Spremljeno" });
      router.refresh();
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function deleteUser() {
    setBusy("delete");
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${profile.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "request-failed");
      router.replace("/admin/users");
      router.refresh();
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
      setBusy(null);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Main column */}
      <div className="space-y-5">
        {/* Profile info */}
        <div className="card space-y-4">
          <h2 className="font-display text-xl text-plum-900">Profil</h2>

          <div>
            <label className="label">Ime i prezime</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-plum-400" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input pl-10"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              disabled={busy === "set_name"}
              onClick={() => call("set_name", { full_name: fullName.trim() })}
            >
              <Save className="h-4 w-4" /> Spasi ime
            </Button>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-plum-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              disabled={busy === "set_email"}
              onClick={() => call("set_email", { email: email.trim() })}
            >
              <Save className="h-4 w-4" /> Promijeni email
            </Button>
          </div>
        </div>

        {/* Subscription actions */}
        <div className="card space-y-4">
          <h2 className="font-display text-xl text-plum-900">Pretplata</h2>
          <div className="text-sm text-plum-700">
            Status: <strong className="capitalize">{profile.subscription_status}</strong>
            {" · "}Sedmica iskorišteno: <strong>{profile.weeks_consumed}</strong>
            {profile.subscription_id?.startsWith("manual:") && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-teal-700">
                <BadgeCheck className="h-3.5 w-3.5" /> Označen kao pretplatnik (manualno)
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy === "grant_week"}
              onClick={() => call("grant_week")}
            >
              <PlusCircle className="h-4 w-4" /> Dodaj sedmicu
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy === "revoke_week" || profile.weeks_consumed <= 0}
              onClick={() => call("revoke_week")}
            >
              <MinusCircle className="h-4 w-4" /> Smanji sedmicu
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy === "mark_subscribed"}
              onClick={() => call("mark_subscribed")}
            >
              <Play className="h-4 w-4" /> Aktiviraj
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy === "set_status_paused"}
              onClick={() => call("set_status", { status: "paused" })}
            >
              <Pause className="h-4 w-4" /> Pauziraj
            </Button>
            {profile.subscription_id?.startsWith("manual:") && (
              <Button
                variant="ghost"
                size="sm"
                disabled={busy === "unmark_subscribed"}
                onClick={() => {
                  if (confirm("Ukloniti manualnu pretplatu? Korisnik će ponovo vidjeti upgrade poziv u dashboardu.")) {
                    call("unmark_subscribed");
                  }
                }}
                className="!text-coral-700"
              >
                <BadgeX className="h-4 w-4" /> Ukloni pretplatu
              </Button>
            )}
          </div>
        </div>

        {/* Block / unblock + delete */}
        <div className="card space-y-3">
          <h2 className="font-display text-xl text-plum-900">Pristup nalogu</h2>
          {isBlocked ? (
            <>
              <p className="text-sm text-coral-700 font-bold">⚠ Nalog je blokiran.</p>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy === "unblock"}
                onClick={() => call("unblock")}
              >
                <ShieldCheck className="h-4 w-4" /> Odblokiraj
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="!text-coral-700"
              disabled={busy === "block"}
              onClick={() => {
                if (confirm("Sigurno blokirati ovaj nalog? Korisnik se neće moći prijaviti niti registrovati ovim email-om.")) {
                  call("block");
                }
              }}
            >
              <ShieldOff className="h-4 w-4" /> Blokiraj nalog
            </Button>
          )}

          <div className="pt-3 mt-3 border-t border-plum-100">
            <p className="text-xs text-plum-500 mb-2">
              Brisanje uklanja korisnika trajno (auth, profil, Brevo liste) i automatski otkazuje
              aktivnu Stripe pretplatu.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="!text-coral-700"
              disabled={busy === "delete"}
              onClick={() => {
                if (
                  confirm(
                    `Trajno obrisati ${profile.email}? Ova radnja se ne može poništiti.`,
                  )
                ) {
                  deleteUser();
                }
              }}
            >
              <Trash2 className="h-4 w-4" /> {busy === "delete" ? "Brišem…" : "Obriši nalog"}
            </Button>
          </div>
        </div>

        {msg && (
          <p className={
            msg.kind === "ok"
              ? "text-sm text-teal-700 font-bold"
              : "text-sm text-coral-700 bg-coral-100 rounded-xl px-3 py-2"
          }>
            {msg.text}
          </p>
        )}
      </div>

      {/* Side info */}
      <aside className="space-y-4">
        <div className="card space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-plum-500 font-bold">User ID</p>
            <p className="font-mono text-xs text-plum-800 break-all">{profile.id}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-plum-500 font-bold">Uloga</p>
            <p className="font-bold text-plum-900 capitalize">{profile.role}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-plum-500 font-bold">Pretplaćen od</p>
            <p className="text-plum-800">
              {profile.subscription_started_at
                ? new Date(profile.subscription_started_at).toLocaleString("bs-BA")
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-plum-500 font-bold">Posljednja prijava</p>
            <p className="text-plum-800">
              {lastSignInAt ? new Date(lastSignInAt).toLocaleString("bs-BA") : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-plum-500 font-bold">Način plaćanja</p>
            <p className="text-plum-800 capitalize">{profile.subscription_provider ?? "—"}</p>
          </div>
        </div>

        <div className="card space-y-3 text-sm">
          <h3 className="font-display text-base text-plum-900">Izvor (UTM)</h3>
          {tracking ? (
            <>
              <TrackRow label="Source" value={tracking.utm_source} />
              <TrackRow label="Medium" value={tracking.utm_medium} />
              <TrackRow label="Campaign" value={tracking.utm_campaign} />
              <TrackRow label="Term" value={tracking.utm_term} />
              <TrackRow label="Content" value={tracking.utm_content} />
              <TrackRow label="Referrer" value={tracking.referrer} mono />
              <TrackRow label="Landing" value={tracking.landing_page_url} mono />
              <div>
                <p className="text-xs uppercase tracking-wide text-plum-500 font-bold">Zabilježeno</p>
                <p className="text-plum-800 text-xs">
                  {new Date(tracking.created_at).toLocaleString("bs-BA")}
                </p>
              </div>
            </>
          ) : (
            <p className="text-xs text-plum-500 italic">
              Nema attribution podataka — korisnik je vjerovatno došao direktno (bez UTM-a).
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function TrackRow({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-plum-500 font-bold">{label}</p>
      <p className={mono ? "font-mono text-xs text-plum-800 break-all" : "text-plum-800"}>
        {value || "—"}
      </p>
    </div>
  );
}
