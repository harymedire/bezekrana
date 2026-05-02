// BezEkrana is a BCS-region brand (Bosnia, Croatia, Serbia).
// Other markets (EN, DE, etc.) will live on separate sites with their own
// brands — those sites will REUSE the PDF templates that live here in
// /public/templates, but won't share this app's auth/dashboard/admin.
export const locales = ["bs", "sr", "hr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bs";

export const fullyTranslatedLocales: Locale[] = ["bs", "sr", "hr"];

// Locales surfaced to end users in the UI locale switcher. `sr` and `hr` are
// temporarily hidden from the public picker while we polish their content —
// the routes still work for direct URL access (admin testing).
export const publicLocales: Locale[] = ["bs"];

// All BCS markets price in EUR. BAM/USD literals are kept in the type union
// because the DB CHECK constraint allows them, but no current locale maps
// to them — useful only if/when a "ba" locale gets enabled later.
export const currencyByLocale: Record<Locale, "BAM" | "EUR" | "USD"> = {
  bs: "EUR",
  sr: "EUR",
  hr: "EUR",
};

export const localeLabels: Record<Locale, string> = {
  bs: "Bosanski",
  sr: "Srpski",
  hr: "Hrvatski",
};
