"use client";

import { useEffect } from "react";
import { useRouter, Link } from "@/lib/i18n/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = { mode: "subscription" | "onetime"; locale: string };

// Pricing context for the GA4 / Ads conversion event. Subscription is the
// recurring weekly fee; one-time uses the platform default. Server-side will
// pass actual values once we wire up the real Stripe success path — this
// constant is fine for the conversion-tracking starting point.
const SUBSCRIPTION_VALUE_EUR = 2.49;
const ONETIME_VALUE_EUR = 2.99;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function CheckoutSuccessClient({ mode, locale }: Props) {
  const router = useRouter();
  void locale;

  useEffect(() => {
    const value = mode === "subscription" ? SUBSCRIPTION_VALUE_EUR : ONETIME_VALUE_EUR;
    const transactionId = `bz_${Date.now()}`;

    // Google Analytics 4 / Google Ads — `purchase` event is the standard
    // recommended e-commerce conversion in GA4. In Google Ads dashboard set
    // this URL (/checkout/success) as the conversion goal, OR import the
    // GA4 event directly as a conversion.
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        transaction_id: transactionId,
        value,
        currency: "EUR",
        items: [
          {
            item_id: mode === "subscription" ? "weekly-sub" : "onetime-pack",
            item_name: mode === "subscription" ? "Sedmični sistem" : "Jednokratni paket",
            price: value,
            quantity: 1,
          },
        ],
      });
    }

    // Meta Pixel (if installed later) — same event, different vendor.
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Purchase", { value, currency: "EUR" });
    }

    // Auto-forward to dashboard after 6 seconds so the user doesn't camp
    // on this page. Conversion has already fired by then.
    const t = setTimeout(() => {
      router.replace("/dashboard");
    }, 6000);
    return () => clearTimeout(t);
  }, [mode, router]);

  return (
    <div className="text-center">
      <div className="mx-auto h-20 w-20 rounded-full bg-teal-100 grid place-items-center mb-6">
        <CheckCircle2 className="h-12 w-12 text-teal-600" />
      </div>

      <h1 className="font-display text-3xl md:text-4xl text-plum-900 mb-3">
        Hvala — uplata je uspješna!
      </h1>

      <p className="text-plum-700 text-lg mb-2">
        {mode === "subscription"
          ? "Tvoja pretplata je aktivna. Prvi paket je već u tvom panelu."
          : "Tvoj paket je već otključan u panelu."}
      </p>
      <p className="text-plum-500 text-sm mb-10">
        Račun ti stiže na email u par minuta.
      </p>

      <Link href="/dashboard">
        <Button>
          Idi na panel <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>

      <p className="text-xs text-plum-400 mt-6">
        Automatski preusmjeravanje za par sekundi…
      </p>
    </div>
  );
}
