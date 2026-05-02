import type { Currency } from "@/types/db";

// ----------------------------------------------------------------------------
// Default platform-wide prices, in MINOR units (cents).
// Subscription is the cheaper unit; one-time is intentionally pricier so that
// the subscribe path remains the more attractive default. Values are
// sensible round numbers — adjust before launch.
// ----------------------------------------------------------------------------
export const DEFAULT_SUBSCRIPTION_PRICE_CENTS: Record<Currency, number> = {
  BAM: 499, //  4.99 KM/sedmica
  EUR: 249, //  2.49 €/week
  USD: 279, //  $2.79/week
};

export const DEFAULT_ONETIME_PRICE_CENTS: Record<Currency, number> = {
  BAM: 1199, // 11.99 KM/plan
  EUR: 599,  //  5.99 €/plan
  USD: 649,  //  $6.49/plan
};

const localeForCurrency: Record<Currency, string> = {
  BAM: "bs-BA",
  EUR: "de-DE",
  USD: "en-US",
};

export function formatMoney(cents: number, currency: Currency): string {
  // BiH standard is "KM" not the ISO "BAM" symbol. Intl gives inconsistent
  // output across runtimes for BAM, so we hand-format it.
  if (currency === "BAM") {
    return `${(cents / 100).toFixed(2).replace(".", ",")} KM`;
  }
  return new Intl.NumberFormat(localeForCurrency[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
