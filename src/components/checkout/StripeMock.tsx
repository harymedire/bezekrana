"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CreditCard } from "lucide-react";

type Mode = "subscription" | "onetime";

// US-issued cards (Stripe test BINs + common live prefixes). For these the
// Address Verification System (AVS) requires postal code; pravi Stripe
// Element ga sam pokaže kad detektuje takav BIN. Ovaj mock simulira to —
// polje za poštanski se pojavi tek nakon što korisnik unese karticu sa US
// prefiksom.
const US_BIN_PREFIXES = ["4242", "4000", "4111", "5555", "5105", "5200", "2223"];

function needsPostalCode(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 4) return false;
  return US_BIN_PREFIXES.some((p) => digits.startsWith(p));
}

// Visual-only mock of the Stripe Payment Element. Used during design review
// so the checkout layout can be inspected without configuring real Stripe
// API keys. Replace with <StripeInline /> once Stripe env vars are set.
export function StripeMock({ mode }: { mode: Mode }) {
  void mode;
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showPostal = needsPostalCode(number);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      alert("Mock checkout — Stripe API still needs to be configured.");
      setSubmitting(false);
    }, 600);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* Card number */}
      <label className="block">
        <span className="text-xs font-bold text-plum-700 mb-1.5 block">Broj kartice</span>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="1234 1234 1234 1234"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full rounded-xl border border-plum-200 bg-white pl-3 pr-12 py-3 text-base text-plum-900 placeholder:text-plum-300 focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100 transition"
          />
          <CreditCard className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-plum-300" />
        </div>
      </label>

      {/* Exp + CVC default; postal se pridruži samo kad ga BIN traži */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-bold text-plum-700 mb-1.5 block">Mjesec / Godina</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="MM / GG"
            value={exp}
            onChange={(e) => setExp(e.target.value)}
            className="w-full rounded-xl border border-plum-200 bg-white px-3 py-3 text-base text-plum-900 placeholder:text-plum-300 focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100 transition"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-plum-700 mb-1.5 block">CVC</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="123"
            maxLength={4}
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
            className="w-full rounded-xl border border-plum-200 bg-white px-3 py-3 text-base text-plum-900 placeholder:text-plum-300 focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100 transition"
          />
        </label>
      </div>

      {showPostal && (
        <label className="block">
          <span className="text-xs font-bold text-plum-700 mb-1.5 block">
            Poštanski broj <span className="text-plum-400 font-normal">— traži banka kartice</span>
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="10001"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="w-full rounded-xl border border-plum-200 bg-white px-3 py-3 text-base text-plum-900 placeholder:text-plum-300 focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-100 transition"
          />
        </label>
      )}

      <Button type="submit" disabled={submitting} className="w-full !mt-5">
        {submitting ? "Procesiram…" : "Pokreni"}
      </Button>
    </form>
  );
}
