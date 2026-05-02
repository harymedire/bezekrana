import Stripe from "stripe";
import type { Currency } from "@/types/db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
  typescript: true,
});

// Map currency → Stripe price ID for the recurring weekly subscription.
export function stripeSubscriptionPriceId(currency: Currency): string {
  const map: Record<Currency, string | undefined> = {
    BAM: process.env.STRIPE_PRICE_SUB_BAM,
    EUR: process.env.STRIPE_PRICE_SUB_EUR,
    USD: process.env.STRIPE_PRICE_SUB_USD,
  };
  const priceId = map[currency];
  if (!priceId) throw new Error(`Missing STRIPE_PRICE_SUB_${currency} env var`);
  return priceId;
}

// Map currency → Stripe price ID for the platform-default one-time purchase.
// Per-pack overrides go through createPaymentIntent with price_data.
export function stripeOneTimePriceId(currency: Currency): string {
  const map: Record<Currency, string | undefined> = {
    BAM: process.env.STRIPE_PRICE_ONETIME_BAM,
    EUR: process.env.STRIPE_PRICE_ONETIME_EUR,
    USD: process.env.STRIPE_PRICE_ONETIME_USD,
  };
  const priceId = map[currency];
  if (!priceId) throw new Error(`Missing STRIPE_PRICE_ONETIME_${currency} env var`);
  return priceId;
}
