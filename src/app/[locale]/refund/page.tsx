import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LegalPageTabbed } from "@/components/legal/LegalPageTabbed";
import { REFUND } from "@/lib/legal/content";

export default async function RefundPage({
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
        <LegalPageTabbed content={REFUND} />
      </main>
      <Footer />
    </>
  );
}
