import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LegalPageTabbed } from "@/components/legal/LegalPageTabbed";
import { PRIVACY } from "@/lib/legal/content";

export default async function PrivacyPage({
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
        <LegalPageTabbed content={PRIVACY} />
      </main>
      <Footer />
    </>
  );
}
