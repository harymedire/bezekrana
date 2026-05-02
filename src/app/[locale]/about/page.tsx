import { setRequestLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Heart, Users, Sparkles, ArrowRight } from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const values = t.raw("values") as { title: string; body: string }[];
  const valueIcons = [Users, Heart, Sparkles];

  return (
    <>
      <Navbar />
      <main>
        {/* Letter section — opens with empathy */}
        <section className="relative overflow-hidden">
          <div className="blob bg-coral-200 -top-20 -right-20 h-72 w-72" />
          <div className="blob bg-sun-200 -bottom-20 left-1/4 h-64 w-64" />

          <div className="relative mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24 text-center">
            <span className="badge bg-plum-100 text-plum-700 mb-5">
              <Heart className="h-3.5 w-3.5" />
              {t("eyebrow")}
            </span>
            <h1 className="font-display text-4xl md:text-6xl text-plum-900 leading-tight mb-6">
              {t("title")}
            </h1>
            <p className="text-lg md:text-xl text-plum-700 leading-relaxed">
              {t("intro")}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-gradient-to-b from-cream to-coral-50 py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 md:px-6 text-center">
            <h2 className="font-display text-3xl md:text-4xl text-plum-900 mb-5">
              {t("missionTitle")}
            </h2>
            <p className="text-lg text-plum-700 leading-relaxed">{t("missionBody")}</p>
          </div>
        </section>

        {/* Science — same visual language as Hero/Mission: clean, centered, soft */}
        <section className="bg-gradient-to-b from-coral-50 to-cream py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 md:px-6 text-center">
            <h2 className="font-display text-3xl md:text-4xl text-plum-900 mb-5">
              {t("scienceTitle")}
            </h2>
            <p className="text-lg text-plum-700 leading-relaxed">{t("scienceBody")}</p>
          </div>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <h2 className="font-display text-3xl md:text-4xl text-center text-plum-900 mb-12">
            {t("valuesTitle")}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {values.map((v, i) => {
              const Icon = valueIcons[i];
              return (
                <div key={i} className="card hover:-translate-y-1 transition">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-coral-400 to-coral-500 text-white mb-4 shadow-playful">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg mb-2">{v.title}</h3>
                  <p className="text-plum-700 leading-relaxed">{v.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 md:px-6 pb-16 md:pb-24">
          <div className="relative mx-auto max-w-4xl rounded-bubble bg-gradient-to-br from-coral-500 via-coral-400 to-sun-400 px-6 py-12 md:px-12 md:py-16 text-center overflow-hidden shadow-soft">
            <div className="blob bg-white/30 -top-10 -right-10 h-48 w-48" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl text-white mb-3">
                {t("ctaTitle")}
              </h2>
              <p className="text-white/90 text-lg max-w-xl mx-auto mb-7">{t("ctaBody")}</p>
              <Link href="/register">
                <Button variant="yellow" size="lg" className="!shadow-[0_8px_0_0_rgba(0,0,0,0.2)]">
                  {t("ctaButton")} <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
