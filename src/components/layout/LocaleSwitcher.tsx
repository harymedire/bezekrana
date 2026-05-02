"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { publicLocales, localeLabels, type Locale } from "@/lib/i18n/config";
import { useTransition } from "react";
import { Globe } from "lucide-react";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Hide the switcher entirely while there's only one public locale —
  // a "picker" with one option is just visual noise.
  if (publicLocales.length <= 1) return null;

  return (
    <label className="relative">
      <span className="sr-only">Locale</span>
      <Globe className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-plum-500" />
      <select
        disabled={isPending}
        value={locale}
        onChange={(e) => {
          const next = e.target.value as Locale;
          startTransition(() => router.replace(pathname, { locale: next }));
        }}
        className="appearance-none rounded-full border-2 border-plum-100 bg-white pl-8 pr-3 py-1.5 text-sm font-bold text-plum-800 hover:border-plum-200 focus:border-teal-500 focus:outline-none"
      >
        {publicLocales.map((l) => (
          <option key={l} value={l}>
            {localeLabels[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
