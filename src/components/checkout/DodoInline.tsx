"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { DodoPayments } from "dodopayments-checkout";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";

type Mode = "subscription" | "onetime";

type Props = {
  mode: Mode;
  packId: string | null;
  /** App locale — passed to Dodo as `force_language` so the iframe renders
   *  in BS/HR/EN/DE etc. when supported. */
  locale: string;
  /** "live" or "test" — fetched from /api/dodo/config */
  dodoMode?: "live" | "test";
};

// Best-effort extraction of the relevant id from Dodo's success event. The
// shape varies slightly across SDK versions, so we look in several places.
function extractIds(event: unknown): { subscriptionId?: string; paymentId?: string } {
  const ev = event as {
    data?: {
      subscription_id?: string;
      payment_id?: string;
      id?: string;
      message?: { subscription_id?: string; payment_id?: string };
    };
  };
  const data = ev?.data ?? {};
  return {
    subscriptionId: data.subscription_id ?? data.message?.subscription_id,
    paymentId: data.payment_id ?? data.message?.payment_id ?? data.id,
  };
}

// Inline Dodo Payments. Flow:
// 1. POST /api/dodo/create-(subscription|onetime) → server returns checkout_url
// 2. DodoPayments.Initialize({ displayType: "inline", onEvent }) — once per mount
// 3. DodoPayments.Checkout.open({ checkoutUrl, elementId, options.manualRedirect: true })
// 4. onEvent fires success → POST /api/dodo/sync to update DB (webhook fallback),
//    then render a TAČNO confirmation with a "Continue to dashboard" link. NO navigation.
export function DodoInline({ mode, packId, locale, dodoMode = "test" }: Props) {
  const t = useTranslations("checkout");
  const tErr = useTranslations("checkout.errors");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const initialized = useRef(false);
  const opened = useRef(false);
  const synced = useRef(false);

  // Tear down the iframe on unmount so it doesn't linger.
  useEffect(() => {
    return () => {
      try { DodoPayments.Checkout.close(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;

    const path =
      mode === "subscription"
        ? "/api/dodo/create-subscription"
        : "/api/dodo/create-onetime";

    fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId, locale }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "checkout-init-failed");
        if (data.alreadyActive) {
          setSuccess(true);
          return;
        }
        if (!data.checkoutUrl) throw new Error("no-checkout-url");

        if (!initialized.current) {
          DodoPayments.Initialize({
            mode: dodoMode,
            displayType: "inline",
            onEvent: (event) => {
              const eventType =
                (event as { event_type?: string; eventType?: string })?.event_type ||
                (event as { event_type?: string; eventType?: string })?.eventType ||
                "";
              const status =
                (event as { data?: { message?: { status?: string }; status?: string } })?.data?.message?.status ||
                (event as { data?: { status?: string } })?.data?.status;

              const isSuccess =
                eventType === "checkout.completed" ||
                eventType === "checkout.success" ||
                eventType === "payment.success" ||
                eventType === "checkout.payment_success" ||
                status === "succeeded" ||
                status === "success" ||
                status === "completed";

              if (isSuccess) {
                if (!synced.current) {
                  synced.current = true;
                  const { subscriptionId, paymentId } = extractIds(event);
                  // Webhook fallback: tell our server to verify with Dodo and
                  // update DB. Fire-and-forget — UI succeeds even if this
                  // races with the webhook (sync endpoint is idempotent).
                  fetch("/api/dodo/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      mode,
                      subscriptionId,
                      paymentId,
                      packId,
                    }),
                  }).catch(() => {});
                }
                setSuccess(true);
                try { DodoPayments.Checkout.close(); } catch {}
                return;
              }
              if (eventType === "checkout.error" || eventType === "checkout.failed") {
                setError(tErr("generic"));
              }
            },
          });
          initialized.current = true;
        }

        // Wait one tick for the mount node to exist before opening
        setTimeout(() => {
          DodoPayments.Checkout.open({
            checkoutUrl: data.checkoutUrl,
            elementId: "dodo-inline-checkout",
            options: {
              showTimer: false,
              showSecurityBadge: true,
              manualRedirect: true,
            } as Record<string, unknown>,
          });
        }, 100);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [mode, packId, locale, dodoMode, tErr]);

  if (success) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto h-20 w-20 grid place-items-center rounded-full bg-teal-500 shadow-soft animate-in fade-in zoom-in-95 duration-500">
          <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
        </div>
        <h3 className="font-display text-2xl text-plum-900 mt-5 mb-1">
          {t("success")}
        </h3>
        <p className="text-plum-600 mb-6">{t("successSubtitle")}</p>
        <Link href="/dashboard" className="btn-primary inline-flex">
          {t("goToDashboard")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading && <p className="text-sm text-plum-500">{t("submitting")}</p>}
      {error && (
        <div className="text-sm text-coral-700 bg-coral-100 rounded-xl px-3 py-2">
          {error}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="ml-2"
          >
            Pokušaj ponovo
          </Button>
        </div>
      )}
      <div
        id="dodo-inline-checkout"
        className="w-full min-h-[600px] rounded-2xl overflow-hidden bg-white"
      />
    </div>
  );
}
