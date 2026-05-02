// ============================================================================
// Dodo Payments — server SDK wrapper
// ============================================================================
// Uses the official `dodopayments` npm package. The integration model is:
//   1. Server creates a checkout session (`client.checkoutSessions.create`)
//      → returns a `checkout_url`
//   2. Client mounts that URL inside an inline iframe via `dodopayments-checkout`
//      with `manualRedirect: true` so Dodo never navigates the parent away.
//   3. Webhook events arrive at /api/dodo/webhook and are verified with
//      `client.webhooks.unwrap(rawBody, { headers })`.
// ============================================================================

import DodoPayments from "dodopayments";

export const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY || null,
  environment:
    (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode",
});

export function dodoSubscriptionProductId(): string {
  const id = process.env.DODO_PRODUCT_SUBSCRIPTION_ID;
  if (!id) throw new Error("Missing DODO_PRODUCT_SUBSCRIPTION_ID env var");
  return id;
}

export function dodoOneTimeProductId(): string {
  const id = process.env.DODO_PRODUCT_ONETIME_ID;
  if (!id) throw new Error("Missing DODO_PRODUCT_ONETIME_ID env var");
  return id;
}

export function isDodoConfigured(): boolean {
  return Boolean(process.env.DODO_PAYMENTS_API_KEY);
}

// Map our app locale → Dodo's `force_language` value. Dodo doesn't list its
// supported codes publicly, but standard ISO-639-1 (en, de, hr, sr, etc.) is
// what the field expects. BS isn't widely supported; we fall it back to HR
// since they're mutually intelligible and HR is more commonly accepted.
// All BCS locales map to "hr" — keeps the iframe form on a single language.
export function dodoForceLanguage(appLocale: string): string {
  const map: Record<string, string> = {
    bs: "hr",
    hr: "hr",
    sr: "hr",
  };
  return map[appLocale] ?? "en";
}
