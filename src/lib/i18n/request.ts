import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, defaultLocale, fullyTranslatedLocales, type Locale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale | undefined;

  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  // Locales without translations yet fall back to English bundle
  // All BCS locales are fully translated; this guard is just defense-in-depth.
  const messageLocale: Locale = fullyTranslatedLocales.includes(locale) ? locale : "bs";

  let messages;
  try {
    messages = (await import(`../../messages/${messageLocale}.json`)).default;
  } catch {
    notFound();
  }

  return { locale, messages };
});
