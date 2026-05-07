"use client";

import type { Currency } from "@/types/db";
import { ShieldCheck, Lock } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";
import { StripeInline } from "./StripeInline";
// import { StripeMock } from "./StripeMock";  // Mock sa lažnom karticom; aktivirao sam StripeInline kad je Stripe podešen.
// import { DodoInline } from "./DodoInline";  // Dodo Payments — privremeno isključen.

type Mode = "subscription" | "onetime";

type Props = {
  mode: Mode;
  packId: string | null;
  locale: string;
  // Order summary card (price + product) — držimo ga jer Stripe Payment
  // Element ne pokazuje šta se plaća, pa je transparentnost na našoj strani.
  summary?: { title: string; amountCents: number; currency: Currency };
};


// Inline Stripe checkout — minimalan dizajn, samo kartica. Ime i email se
// prikupljaju u registraciji; Stripe sam pokrije ono što mu mora po pravilima
// (postal code za US/UK kartice, 3D Secure, itd.).
export function CheckoutClient({ mode, packId, locale, summary }: Props) {
  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Order summary — naslov + cijena, kratko. Subscription: brand naziv;
          one-time: naziv konkretnog paketa. Detalji o ciklusu/obnovi su već
          iznad CTA dugmeta i u tržišnoj komunikaciji. */}
      {summary && (
        <div className="card bg-gradient-to-br from-plum-50 to-coral-50 border-plum-100">
          <div className="flex items-baseline justify-between gap-3">
            <div className="font-bold text-plum-900 truncate">
              {mode === "subscription" ? "Sedmični sistem" : summary.title}
            </div>
            <div className="font-display text-xl text-plum-900 shrink-0">
              {formatMoney(summary.amountCents, summary.currency)}
            </div>
          </div>
        </div>
      )}

      {/* Stripe inline kartica */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4 text-sm text-plum-700 font-bold">
          <Lock className="h-4 w-4" />
          Sigurno plaćanje preko Stripe-a
        </div>

        <StripeInline mode={mode} packId={packId} locale={locale} />
        {/* <StripeMock mode={mode} /> */}

        <div className="mt-4 pt-4 border-t border-plum-100 flex items-center gap-2 text-xs text-plum-500">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          <span>
            Kartični podaci nikad ne dolaze do našeg servera. Procesira Stripe (PCI-DSS Level 1).
            {mode === "subscription" && " Otkazivanje u svakom trenutku iz panela."}
          </span>
        </div>
      </div>
    </div>
  );
}
