"use client";

import { useEffect, useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/client";
import { useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

type Mode = "subscription" | "onetime";
type Props = { mode: Mode; packId: string | null; locale: string };

// Minimal Stripe checkout — card only, no billing address fields. We collect
// the user's name/email at registration; Stripe stores billing data on the
// customer object internally. Address suppression is allowed for card
// payments since Stripe asks for postal code automatically inside the card
// element where the issuing country requires it (e.g. US cards).
export function StripeInline({ mode, packId, locale }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadyActive, setAlreadyActive] = useState(false);

  useEffect(() => {
    const endpoint =
      mode === "subscription"
        ? "/api/stripe/create-subscription"
        : "/api/stripe/create-onetime";
    const body = mode === "subscription" ? { locale } : { locale, packId };

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.alreadyActive) {
          setAlreadyActive(true);
          return;
        }
        if (!d.clientSecret) {
          setError(d.error ?? "init-failed");
          return;
        }
        setClientSecret(d.clientSecret);
      })
      .catch(() => setError("network-error"));
  }, [mode, packId, locale]);

  if (alreadyActive) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-10 w-10 mx-auto text-teal-500 mb-3" />
        <p className="text-plum-700 font-bold">Već imaš aktivnu pretplatu.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-coral-700 bg-coral-100 rounded-xl px-3 py-2">
        Greška pri inicijalizaciji plaćanja. Osvježi stranicu ili pokušaj kasnije.
      </div>
    );
  }

  if (!clientSecret) {
    return <div className="py-8 text-center text-plum-500 text-sm">Učitavanje…</div>;
  }

  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#FF6B6B",
            colorText: "#291D3B",
            colorTextSecondary: "#7c6e92",
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            borderRadius: "12px",
            spacingUnit: "4px",
          },
        },
      }}
    >
      <CheckoutForm mode={mode} />
    </Elements>
  );
}

function CheckoutForm({ mode }: { mode: Mode }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setErrMsg(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?mode=${mode}`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setErrMsg(result.error.message ?? "Plaćanje nije uspjelo.");
      setSubmitting(false);
      return;
    }

    // No redirect needed (3DS not required) — payment succeeded inline.
    router.replace(`/checkout/success?mode=${mode}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "tabs",
          fields: {
            billingDetails: {
              name: "never",
              email: "never",
              phone: "never",
              address: "never",
            },
          },
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
        }}
      />

      {errMsg && (
        <p className="text-sm text-coral-700 bg-coral-100 rounded-xl px-3 py-2">
          {errMsg}
        </p>
      )}

      <Button type="submit" disabled={!stripe || submitting} className="w-full">
        {submitting ? "Procesiram…" : "Pokreni"}
      </Button>
    </form>
  );
}
