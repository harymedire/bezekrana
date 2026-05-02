import { useTranslations } from "next-intl";

export function Moment() {
  const t = useTranslations("landing.moment");
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream via-coral-50/40 to-cream py-20 md:py-28">
      {/* Decorative blobs that echo the hero's palette */}
      <div className="blob bg-sun-200 -top-20 left-1/4 h-56 w-56" />
      <div className="blob bg-coral-200 -bottom-10 right-1/4 h-48 w-48" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        {/* Subtle quotation mark — neutral grey-plum, low-key */}
        <span
          aria-hidden
          className="block font-display text-7xl md:text-8xl text-plum-200 leading-none mb-2 select-none"
        >
          “
        </span>

        <p className="font-display text-2xl md:text-3xl text-plum-800 leading-snug md:leading-tight italic">
          {t("body")}
        </p>

        <div className="mt-10 mx-auto h-0.5 w-16 rounded-full bg-coral-300/60" />
      </div>
    </section>
  );
}
