import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "@/components/ui/Logo";
import { Link } from "@/lib/i18n/navigation";
import { COMPANY } from "@/lib/legal/content";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-plum-100 bg-white/60">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Top row — brand left, legal links right */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 py-10">
          <div className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <div>
              <div className="font-display text-lg text-plum-800 leading-none">BezEkrana</div>
              <div className="text-sm text-plum-500 mt-1">{t("tagline")}</div>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link href="/terms" className="font-bold text-plum-700 hover:text-coral-600">
              {t("links.terms")}
            </Link>
            <Link href="/privacy" className="font-bold text-plum-700 hover:text-coral-600">
              {t("links.privacy")}
            </Link>
            <Link href="/refund" className="font-bold text-plum-700 hover:text-coral-600">
              {t("links.refund")}
            </Link>
          </nav>
        </div>

        {/* Bottom row — company info + copyright + locale switcher */}
        <div className="border-t border-plum-100/70 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-plum-500 leading-relaxed">
          <p>
            © {year} <span className="font-bold text-plum-700">{COMPANY.legalName}</span>
            {" · "}{COMPANY.addressLine1}, {COMPANY.city}, {COMPANY.region} {COMPANY.postalCode}, {COMPANY.country}
            {" · "}
            <a href={`mailto:${COMPANY.supportEmail}`} className="hover:text-coral-600">
              {COMPANY.supportEmail}
            </a>
          </p>
          <LocaleSwitcher />
        </div>
      </div>
    </footer>
  );
}
