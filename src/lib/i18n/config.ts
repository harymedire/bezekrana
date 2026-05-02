// BezEkrana is a BCS-region brand (Bosnia, Croatia, Serbia).
// Other markets (EN, DE, etc.) will live on separate sites with their own
// brands — those sites will REUSE the PDF templates that live here in
// /public/templates, but won't share this app's auth/dashboard/admin.
//
// `sr` and `hr` translation files exist but are not yet at parity with `bs`
// (some message keys are missing). Until we backfill, only `bs` is enabled
// in routing — the sr/hr files stay in src/messages/ as drafts.
export const locales = ["bs"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bs";

export const fullyTranslatedLocales: Locale[] = ["bs"];

// Locales surfaced to end users in the UI locale switcher.
export const publicLocales: Locale[] = ["bs"];

// All BCS markets price in EUR. BAM/USD literals are kept in the type union
// because the DB CHECK constraint allows them, but no current locale maps
// to them — useful only if/when a "ba" locale gets enabled later.
export const currencyByLocale: Record<Locale, "BAM" | "EUR" | "USD"> = {
  bs: "EUR",
};

export const localeLabels: Record<Locale, string> = {
  bs: "Bosanski",
};
