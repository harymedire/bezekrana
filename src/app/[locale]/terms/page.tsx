import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LegalPageTabbed } from "@/components/legal/LegalPageTabbed";
import { TERMS } from "@/lib/legal/content";

export default async function TermsPage({
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
        <LegalPageTabbed content={TERMS} />
      </main>
      <Footer />
    </>
  );
}
