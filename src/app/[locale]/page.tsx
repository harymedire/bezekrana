import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Mission } from "@/components/landing/Mission";
import { NeuroBlock } from "@/components/landing/NeuroBlock";
// import { Problem } from "@/components/landing/Problem";  // privremeno uklonjena „Znaš ovaj scenarij?" sekcija
import { Solution } from "@/components/landing/Solution";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Moment } from "@/components/landing/Moment";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Mission />
        <NeuroBlock />
        <Solution />
        <HowItWorks />
        <Testimonials />
        <Moment />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
