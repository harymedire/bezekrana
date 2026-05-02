import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Rocket } from "lucide-react";

export function FinalCTA() {
  const t = useTranslations("landing.cta");
  return (
    <section className="px-4 md:px-6 pb-16 md:pb-24">
      <div className="relative mx-auto max-w-5xl rounded-bubble bg-gradient-to-br from-coral-500 via-coral-400 to-sun-400 px-6 py-14 md:px-12 md:py-20 text-center overflow-hidden shadow-soft">
        <div className="blob bg-white/30 -top-10 -right-10 h-48 w-48" />
        <div className="blob bg-white/30 -bottom-10 -left-10 h-48 w-48" />
        <div className="relative">
          <h2 className="font-display text-3xl md:text-5xl text-white mb-4 max-w-3xl mx-auto leading-tight">
            {t("title")}
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            {t("subtitle")}
          </p>
          <Link href="/register">
            <Button variant="yellow" size="lg" className="!shadow-[0_8px_0_0_rgba(0,0,0,0.2)]">
              <Rocket className="h-5 w-5" /> {t("button")}
            </Button>
          </Link>
          <p className="mt-6 text-white/85 italic text-base md:text-lg max-w-xl mx-auto">
            {t("footer")}
          </p>
        </div>
      </div>
    </section>
  );
}
