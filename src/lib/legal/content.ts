// Legal content for BezEkrana — bilingual (EN canonical, BS translation).
// Hardcoded here rather than in i18n message files because:
//   1. These are formal legal documents — they should be one obvious source
//      of truth, version-controlled in the repo, not buried in translation
//      JSON.
//   2. The tabbed UI (EN default + BS tab) is intentional regardless of the
//      visitor's locale — Stripe and US/EU regulators expect English text.
//
// Update LAST_UPDATED whenever you materially change any document; the date
// is shown at the top of every page.

export const COMPANY = {
  legalName: "Prime Vector Solutions LLC",
  addressLine1: "30 N Gould St Ste R",
  city: "Sheridan",
  region: "Wyoming",
  postalCode: "82801",
  country: "USA",
  county: "Sheridan County, Wyoming",
  supportEmail: "kontakt@bezekrana.com",
  privacyEmail: "kontakt@bezekrana.com",
  refundEmail: "kontakt@bezekrana.com",
  domain: "bezekrana.com",
} as const;

export const LAST_UPDATED = "2026-05-02";

export type LegalSection = { heading: string; body: string };
export type LegalDocument = {
  title: string;
  intro: string;
  sections: LegalSection[];
};
export type LegalContent = {
  en: LegalDocument;
  bs: LegalDocument;
};

// ---------------------------------------------------------------------------
// TERMS OF SERVICE
// ---------------------------------------------------------------------------
export const TERMS: LegalContent = {
  en: {
    title: "Terms of Service",
    intro: `These Terms of Service ("Terms") govern your use of BezEkrana, a digital subscription platform operated by ${COMPANY.legalName}, ${COMPANY.addressLine1}, ${COMPANY.city}, ${COMPANY.region} ${COMPANY.postalCode}, ${COMPANY.country} ("we", "us", "our"). By creating an account, subscribing, or making any purchase, you accept these Terms in full.`,
    sections: [
      {
        heading: "1. The Service",
        body: "BezEkrana provides downloadable PDF activity packs for parents of children aged 2–4. All content is delivered exclusively in digital form (PDF download) — no physical goods are shipped.",
      },
      {
        heading: "2. Subscription, Pricing, and Billing",
        body: "• Subscriptions renew automatically on a weekly cycle at the price displayed at checkout (currently BAM 4.99; we may adjust pricing with 30 days' notice).\n• Payments are processed by Stripe, Inc. We do not store card details on our servers.\n• Each successful weekly invoice unlocks one new pack, in sequence.\n• All amounts are inclusive of any applicable VAT/sales tax where required.\n• You may cancel at any time from your account dashboard. Cancellation stops future billing immediately; previously paid packs remain in your library.",
      },
      {
        heading: "3. Instant Access and Waiver of Withdrawal Right",
        body: "All content is digital and made available immediately upon payment. By completing a purchase, you expressly request immediate performance and acknowledge that you thereby waive any statutory right of withdrawal that may otherwise apply, including (without limitation) the 14-day cooling-off period under Article 16(m) of EU Directive 2011/83/EU (Consumer Rights Directive). This waiver applies once any pack has been made available for download.",
      },
      {
        heading: "4. License and Permitted Use",
        body: "We grant you a limited, non-transferable, non-exclusive, revocable license to use the PDF content for personal and household purposes only. You may NOT: redistribute, resell, sublicense, share via file-sharing platforms, post publicly, train AI models on, or otherwise use the content commercially without our prior written consent. Each PDF is watermarked and may be tracked.",
      },
      {
        heading: "5. Account Responsibility",
        body: "You must be at least 18 years old (or have legal guardian consent) to create an account. You are responsible for all activity under your account and for keeping your credentials confidential. Notify us immediately at " + COMPANY.supportEmail + " of any unauthorized access.",
      },
      {
        heading: "6. Acceptable Use, Suspension and Termination",
        body: "We may suspend or terminate accounts (without refund) in case of: content piracy, fraudulent chargebacks, attempts to compromise platform security, or other material breach of these Terms.",
      },
      {
        heading: "7. Disclaimer of Warranties",
        body: "Activities are educational suggestions only. THE PARENT OR LEGAL GUARDIAN IS SOLELY RESPONSIBLE FOR THE SAFETY OF THE CHILD DURING ANY ACTIVITY. To the maximum extent permitted by law, the service is provided \"AS IS\" without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, or non-infringement.",
      },
      {
        heading: "8. Limitation of Liability",
        body: "To the maximum extent permitted by law, our total aggregate liability arising out of or relating to the service shall not exceed the greater of (a) the amount you paid us in the 12 months preceding the claim, or (b) USD 50. We are not liable for indirect, incidental, consequential, or punitive damages.",
      },
      {
        heading: "9. Changes to These Terms",
        body: "We may update these Terms periodically. Material changes will be communicated to active users by email at least 14 days before they take effect. Continued use after the effective date constitutes acceptance.",
      },
      {
        heading: "10. Governing Law and Disputes",
        body: `These Terms are governed by the laws of the State of Wyoming, USA, without regard to conflict-of-law principles. Disputes shall be resolved exclusively in the state or federal courts located in ${COMPANY.county}. EU consumers retain the protection of mandatory provisions of their country of residence and may also bring claims in their local courts.`,
      },
      {
        heading: "11. Contact",
        body: `${COMPANY.supportEmail}\n${COMPANY.legalName}\n${COMPANY.addressLine1}\n${COMPANY.city}, ${COMPANY.region} ${COMPANY.postalCode}, ${COMPANY.country}`,
      },
    ],
  },
  bs: {
    title: "Uslovi korištenja",
    intro: `Ovi Uslovi korištenja („Uslovi") regulišu korištenje platforme BezEkrana, digitalne pretplatničke usluge koju vodi ${COMPANY.legalName}, ${COMPANY.addressLine1}, ${COMPANY.city}, ${COMPANY.region} ${COMPANY.postalCode}, ${COMPANY.country} („mi", „nas"). Kreiranjem naloga, pretplatom ili bilo kakvom kupovinom u potpunosti prihvataš ove Uslove.`,
    sections: [
      {
        heading: "1. O usluzi",
        body: "BezEkrana pruža PDF planove aktivnosti za roditelje djece uzrasta 2–4 godine, isporučene isključivo u digitalnoj formi. Ne šaljemo nikakve fizičke proizvode.",
      },
      {
        heading: "2. Pretplata, cijena i naplata",
        body: "• Pretplata se obnavlja automatski svake sedmice po cijeni navedenoj na stranici za naplatu (trenutno 4,99 KM; cijenu možemo promijeniti uz najavu 30 dana unaprijed).\n• Plaćanja procesira Stripe, Inc. Mi NE čuvamo podatke o kartici na našim serverima.\n• Svaka uspješna sedmična naplata otključava jedan novi paket, redoslijedom.\n• Svi iznosi uključuju primjenjive poreze tamo gdje su obavezni.\n• Otkazivanje je moguće u svakom trenutku iz korisničkog panela. Otkazivanjem prestaju buduće naplate odmah; već uplaćeni paketi ostaju trajno u tvojoj biblioteci.",
      },
      {
        heading: "3. Trenutni pristup i odricanje od prava odustanka",
        body: "Sav sadržaj je digitalni i postaje dostupan ODMAH po izvršenoj uplati. Završetkom kupovine izričito tražiš trenutno izvršenje usluge i potvrđuješ da se time odričeš zakonskog prava na odustanak — uključujući (bez ograničenja) 14-dnevni rok za odustanak iz člana 16(m) Direktive EU 2011/83/EU (Direktiva o pravima potrošača). Odricanje vrijedi od trenutka kada je bilo koji paket postao dostupan za preuzimanje.",
      },
      {
        heading: "4. Licenca i dozvoljena upotreba",
        body: "Dodjeljujemo ti ograničenu, neprenosivu, neisključivu i opozivu licencu za korištenje PDF sadržaja isključivo za ličnu i porodičnu upotrebu. NE smiješ: preprodavati, dijeliti putem platformi za razmjenu fajlova, objavljivati javno, koristiti za trening AI modela, niti koristiti komercijalno bez naše prethodne pisane saglasnosti. Svaki PDF nosi vodeni žig i može se pratiti.",
      },
      {
        heading: "5. Odgovornost korisnika",
        body: `Moraš imati najmanje 18 godina (ili saglasnost zakonskog staratelja) da bi kreirao nalog. Odgovoran si za sve aktivnosti pod tvojim nalogom i za čuvanje pristupnih podataka. Ako primijetiš neovlašteni pristup, javi nam odmah na ${COMPANY.supportEmail}.`,
      },
      {
        heading: "6. Prihvatljivo korištenje, suspenzija i raskid",
        body: "Možemo suspendovati ili trajno blokirati nalog (bez povrata) u slučaju: piraterije sadržaja, lažnih povratnih uplata (chargebacks), pokušaja kompromitovanja sigurnosti platforme ili drugih materijalnih kršenja ovih Uslova.",
      },
      {
        heading: "7. Ograničenje garancija",
        body: 'Aktivnosti su isključivo edukativne sugestije. RODITELJ ILI ZAKONSKI STARATELJ JE ISKLJUČIVO ODGOVORAN ZA SIGURNOST DJETETA TOKOM SVAKE AKTIVNOSTI. U najvećoj mjeri dozvoljenoj zakonom, usluga se pruža „KAKVA JESTE" bez garancija bilo koje vrste, izričitih ili podrazumijevanih.',
      },
      {
        heading: "8. Ograničenje odgovornosti",
        body: "U najvećoj mjeri dozvoljenoj zakonom, naša ukupna odgovornost neće premašiti veću od (a) iznosa koji si nam platio u 12 mjeseci prije nastanka štete ili (b) 50 USD. Ne snosimo odgovornost za indirektne, slučajne, posljedične ili kaznene štete.",
      },
      {
        heading: "9. Izmjene Uslova",
        body: "Možemo periodično ažurirati ove Uslove. Materijalne izmjene saopštavamo aktivnim korisnicima e-mailom najmanje 14 dana prije stupanja na snagu. Nastavak korištenja nakon datuma stupanja predstavlja prihvatanje.",
      },
      {
        heading: "10. Mjerodavno pravo i sporovi",
        body: `Ovi Uslovi se rukovode zakonima države Wyoming, SAD, bez obzira na pravila o sukobu zakona. Sporovi se rješavaju isključivo pred državnim ili saveznim sudovima u ${COMPANY.county}. Potrošači u EU zadržavaju zaštitu obaveznih odredbi svoje države prebivališta i mogu pokrenuti postupak pred lokalnim sudovima.`,
      },
      {
        heading: "11. Kontakt",
        body: `${COMPANY.supportEmail}\n${COMPANY.legalName}\n${COMPANY.addressLine1}\n${COMPANY.city}, ${COMPANY.region} ${COMPANY.postalCode}, ${COMPANY.country}`,
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// PRIVACY POLICY
// ---------------------------------------------------------------------------
export const PRIVACY: LegalContent = {
  en: {
    title: "Privacy Policy",
    intro: `This Privacy Policy explains what data BezEkrana collects, why, and how we protect it. The service is operated by ${COMPANY.legalName} ("we", "us"). For privacy questions, contact ${COMPANY.privacyEmail}.`,
    sections: [
      {
        heading: "1. Data We Collect",
        body: "• Account: email, password (hashed via bcrypt), full name (optional).\n• Payment: handled directly by Stripe — we receive only customer ID, subscription status, and amount paid. NO card data is stored on our servers.\n• Usage: pages visited, content unlocked, basic device info, IP address (for fraud prevention).\n• Marketing attribution: UTM parameters and referrer (httpOnly cookie, 30 days).\n• Anonymized analytics: session recordings via Microsoft Clarity (IP and personal text fields are masked by default).",
      },
      {
        heading: "2. Legal Basis for Processing (GDPR)",
        body: "• Performance of contract — providing the subscription service.\n• Legitimate interest — fraud prevention, security, product improvement.\n• Legal obligation — tax records, accounting (7-year retention).\n• Consent — marketing emails (you may withdraw consent anytime).",
      },
      {
        heading: "3. How We Use Data",
        body: "• To provide, maintain, and improve the service.\n• To process payments and prevent fraud (Stripe is our processor).\n• To communicate about your account (billing notices, security alerts).\n• To send marketing emails to subscribed users (you can unsubscribe anytime).\n• To comply with legal obligations.",
      },
      {
        heading: "4. Third-Party Processors",
        body: "We share data only with processors essential to the service:\n• Stripe, Inc. — payment processing (PCI-DSS Level 1)\n• Supabase — database hosting (EU region)\n• Railway — application hosting\n• Brevo (Sendinblue) — transactional + marketing email\n• Microsoft Clarity — anonymized session analytics\nAll processors are bound by Data Processing Agreements (DPAs).",
      },
      {
        heading: "5. International Data Transfers",
        body: "Some processors are based in the United States. EU-to-US transfers rely on Standard Contractual Clauses (SCCs) approved by the European Commission, plus supplementary safeguards.",
      },
      {
        heading: "6. Your Rights",
        body: `Subject to applicable law (GDPR, CCPA, and equivalents) you may: access your data, correct it, request deletion, restrict or object to processing, request portability, or withdraw consent. Email ${COMPANY.privacyEmail} — we respond within 30 days. EU users may also lodge complaints with their national data protection authority.`,
      },
      {
        heading: "7. Data Retention",
        body: "• Account data: kept while the account is active; deleted within 30 days of account closure (except records we must keep by law).\n• Billing records: 7 years (US tax law).\n• Marketing consent records: 3 years after unsubscribe.\n• Anonymized analytics: indefinite.",
      },
      {
        heading: "8. Security",
        body: "TLS-encrypted in transit, encrypted at rest, role-restricted database access, periodic security audits, two-factor authentication for admin accounts. We will notify affected users within 72 hours of any data breach as required by GDPR.",
      },
      {
        heading: "9. Children",
        body: "This service is intended for parents and legal guardians, not children. We do not knowingly collect personal data from children under 16. If you believe a child has provided data, contact us and we will delete it.",
      },
      {
        heading: "10. Cookies",
        body: "Essential cookies (session, locale, UTM tracking) are set automatically — these are necessary for the service. Analytics cookies (Microsoft Clarity) are anonymized. We do NOT use third-party advertising cookies without explicit consent.",
      },
      {
        heading: "11. Contact",
        body: `${COMPANY.privacyEmail}\n${COMPANY.legalName}\n${COMPANY.addressLine1}\n${COMPANY.city}, ${COMPANY.region} ${COMPANY.postalCode}, ${COMPANY.country}`,
      },
    ],
  },
  bs: {
    title: "Politika privatnosti",
    intro: `Ova Politika privatnosti objašnjava koje podatke BezEkrana prikuplja, zašto i kako ih štitimo. Uslugu vodi ${COMPANY.legalName} („mi", „nas"). Za pitanja o privatnosti, piši na ${COMPANY.privacyEmail}.`,
    sections: [
      {
        heading: "1. Podaci koje prikupljamo",
        body: "• Nalog: email, lozinka (hashirana bcrypt-om), ime (opciono).\n• Plaćanje: obrađuje direktno Stripe — mi dobijamo samo customer ID, status pretplate i iznos. NIKAKVI podaci o kartici se ne čuvaju na našim serverima.\n• Korištenje: posjećene stranice, otključani sadržaj, osnovne informacije o uređaju, IP adresa (za prevenciju prevara).\n• Marketinška atribucija: UTM parametri i referrer (httpOnly kolačić, 30 dana).\n• Anonimna analitika: snimci sesije preko Microsoft Clarity (IP i lična tekstualna polja su maskirana).",
      },
      {
        heading: "2. Pravna osnova obrade (GDPR)",
        body: "• Izvršenje ugovora — pružanje pretplatničke usluge.\n• Legitimni interes — prevencija prevara, sigurnost, unapređenje proizvoda.\n• Pravna obaveza — porezne i računovodstvene evidencije (7 godina).\n• Saglasnost — marketinške poruke (saglasnost možeš povući u svakom trenutku).",
      },
      {
        heading: "3. Kako koristimo podatke",
        body: "• Za pružanje, održavanje i unapređenje usluge.\n• Za procesiranje plaćanja i prevenciju prevara (Stripe je naš procesor).\n• Za komunikaciju o tvom nalogu (obavještenja o naplati, sigurnosna upozorenja).\n• Za slanje marketinških poruka pretplatnicima (možeš se odjaviti u svakom trenutku).\n• Za ispunjavanje zakonskih obaveza.",
      },
      {
        heading: "4. Treća lica — procesori",
        body: "Podatke dijelimo samo sa procesorima koji su neophodni za rad usluge:\n• Stripe, Inc. — procesiranje plaćanja (PCI-DSS Level 1)\n• Supabase — hosting baze (EU regija)\n• Railway — hosting aplikacije\n• Brevo (Sendinblue) — transakcijski i marketinški email\n• Microsoft Clarity — anonimna analitika sesija\nSvi procesori su pod ugovorom o zaštiti podataka (DPA).",
      },
      {
        heading: "5. Međunarodni transferi podataka",
        body: "Neki procesori se nalaze u Sjedinjenim Američkim Državama. Transferi iz EU u SAD se oslanjaju na Standardne ugovorne klauzule (SCC) odobrene od strane Evropske komisije, uz dodatne mjere zaštite.",
      },
      {
        heading: "6. Tvoja prava",
        body: `U skladu sa primjenjivim pravom (GDPR, CCPA i ekvivalentima) možeš: pristupiti svojim podacima, ispraviti ih, zatražiti brisanje, ograničiti ili se usprotiviti obradi, zatražiti prenosivost ili povući saglasnost. Pošalji email na ${COMPANY.privacyEmail} — odgovaramo u roku od 30 dana. Korisnici u EU mogu podnijeti pritužbu i nacionalnoj agenciji za zaštitu podataka.`,
      },
      {
        heading: "7. Čuvanje podataka",
        body: "• Podaci naloga: čuvaju se dok je nalog aktivan; brišu se u roku od 30 dana od zatvaranja naloga (osim onih koje moramo čuvati po zakonu).\n• Računovodstvene evidencije: 7 godina (porezno pravo SAD).\n• Evidencije o marketinškoj saglasnosti: 3 godine nakon odjave.\n• Anonimna analitika: neograničeno.",
      },
      {
        heading: "8. Sigurnost",
        body: "TLS enkripcija u prenosu, enkripcija u mirovanju, ograničen pristup bazi po ulozi, periodične sigurnosne provjere, dvofaktorska autentikacija za admin naloge. Pogođene korisnike obavještavamo u roku od 72 sata od bilo kakve povrede podataka, kako je to obaveza prema GDPR-u.",
      },
      {
        heading: "9. Djeca",
        body: "Usluga je namijenjena roditeljima i zakonskim starateljima, ne djeci. Ne prikupljamo svjesno lične podatke djece mlađe od 16 godina. Ako vjeruješ da je dijete dostavilo svoje podatke, kontaktiraj nas i obrisaćemo ih.",
      },
      {
        heading: "10. Kolačići",
        body: "Esencijalni kolačići (sesija, jezik, UTM praćenje) se postavljaju automatski — neophodni su za funkcionisanje usluge. Analitički kolačići (Microsoft Clarity) su anonimizovani. NE koristimo treće-strane reklamne kolačiće bez izričite saglasnosti.",
      },
      {
        heading: "11. Kontakt",
        body: `${COMPANY.privacyEmail}\n${COMPANY.legalName}\n${COMPANY.addressLine1}\n${COMPANY.city}, ${COMPANY.region} ${COMPANY.postalCode}, ${COMPANY.country}`,
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// REFUND POLICY
// ---------------------------------------------------------------------------
export const REFUND: LegalContent = {
  en: {
    title: "Refund Policy",
    intro:
      "BezEkrana sells digital products that are delivered immediately upon payment. As a result, ALL SALES ARE FINAL. This policy explains the strict no-refund rule and the limited circumstances under which a refund may exceptionally be issued.",
    sections: [
      {
        heading: "1. No-Refund Policy for Digital Goods",
        body: "By completing a purchase you acknowledge and agree that:\n• The content is digital and made available to you immediately;\n• You have expressly requested immediate performance;\n• You waive any statutory right of withdrawal that may otherwise apply, including the 14-day cooling-off period under EU Consumer Rights Directive (Directive 2011/83/EU) Article 16(m).\n\nOnce a pack has been unlocked or made available for download, the corresponding payment is non-refundable.",
      },
      {
        heading: "2. Cancellation ≠ Refund",
        body: "Cancelling your subscription stops FUTURE billing immediately but does not refund prior payments. You can cancel anytime from your account dashboard — no email, justification, or follow-up call required. Already-unlocked packs remain in your library forever.",
      },
      {
        heading: "3. Limited Exceptions Where We Will Refund",
        body: "We will issue a refund only in the following narrowly defined cases:\n(a) Duplicate charge — the same pack billed twice in error.\n(b) Unauthorized transaction — confirmed by your bank or Stripe as fraudulent.\n(c) Technical failure on our side that prevents pack delivery, when our support team has been unable to resolve it within 7 calendar days of report.\n(d) Demonstrable error on our side (wrong price charged, wrong content delivered).\n\nRequests outside these exceptions will be declined.",
      },
      {
        heading: "4. How to Request a Refund",
        body: `Email ${COMPANY.refundEmail} with:\n• Your account email\n• Date and amount of the charge\n• The exception above that applies\n• Supporting documentation (bank statement, screenshot, etc.)\n\nWe respond within 3 business days. Approved refunds are processed back to the original payment method within 5–10 business days.`,
      },
      {
        heading: "5. Chargebacks",
        body: "We strongly prefer to resolve concerns directly. Initiating a chargeback (dispute) with your bank without first contacting us may result in immediate account suspension and forfeit of any access. We are happy to provide your bank with all transaction details, IP logs, and content-delivery proofs upon request.",
      },
      {
        heading: "6. Contact",
        body: `${COMPANY.refundEmail}\n${COMPANY.legalName}\n${COMPANY.addressLine1}\n${COMPANY.city}, ${COMPANY.region} ${COMPANY.postalCode}, ${COMPANY.country}`,
      },
    ],
  },
  bs: {
    title: "Politika povrata",
    intro:
      "BezEkrana prodaje digitalne proizvode koji se isporučuju ODMAH po uplati. Iz tog razloga SVE PRODAJE SU KONAČNE. Ova politika objašnjava strogo pravilo bez povrata i ograničene slučajeve u kojima izuzetno možemo izdati povrat.",
    sections: [
      {
        heading: "1. Politika bez povrata za digitalne proizvode",
        body: "Završetkom kupovine potvrđuješ i prihvataš da:\n• Sadržaj je digitalni i postaje dostupan ODMAH;\n• Izričito tražiš trenutno izvršenje usluge;\n• Odričeš se zakonskog prava na odustanak — uključujući 14-dnevni rok za odustanak po članu 16(m) Direktive EU 2011/83/EU o pravima potrošača.\n\nKad je paket otključan ili dostupan za preuzimanje, odgovarajuća uplata se NE vraća.",
      },
      {
        heading: "2. Otkazivanje ≠ povrat",
        body: "Otkazivanjem pretplate odmah prestaju BUDUĆE naplate, ali se već uplaćeni iznosi NE vraćaju. Otkazivanje je moguće u svakom trenutku iz korisničkog panela — bez emaila, bez objašnjavanja, bez follow-up poziva. Već otključani paketi ostaju trajno u tvojoj biblioteci.",
      },
      {
        heading: "3. Ograničeni izuzeci u kojima vraćamo novac",
        body: "Povrat ćemo izvršiti samo u sljedećim usko definisanim slučajevima:\n(a) Dvostruka naplata — isti paket greškom naplaćen dva puta.\n(b) Neovlaštena transakcija — potvrđena kao prevara od strane banke ili Stripe-a.\n(c) Tehnički kvar na našoj strani koji onemogućava isporuku paketa, kad naš support tim nije uspio riješiti problem u roku od 7 kalendarskih dana od prijave.\n(d) Dokaziva greška na našoj strani (pogrešna cijena, isporučen pogrešan sadržaj).\n\nZahtjevi van ovih izuzetaka biće odbijeni.",
      },
      {
        heading: "4. Kako tražiti povrat",
        body: `Pošalji email na ${COMPANY.refundEmail} sa:\n• Email tvog naloga\n• Datum i iznos naplate\n• Izuzetak iz prethodne tačke koji se primjenjuje\n• Prateću dokumentaciju (izvod banke, screenshot)\n\nOdgovaramo u roku od 3 radna dana. Odobreni povrati se procesiraju nazad na originalnu kartu u roku od 5–10 radnih dana.`,
      },
      {
        heading: "5. Chargebacks (povratne uplate)",
        body: "Snažno preferiramo direktno rješavanje problema. Pokretanje chargeback-a (osporavanje uplate) kod tvoje banke bez prethodnog kontakta s nama može rezultirati trenutnom suspenzijom naloga i gubitkom pristupa. Rado ćemo banci dostaviti sve detalje transakcije, IP logove i dokaz o isporuci sadržaja na zahtjev.",
      },
      {
        heading: "6. Kontakt",
        body: `${COMPANY.refundEmail}\n${COMPANY.legalName}\n${COMPANY.addressLine1}\n${COMPANY.city}, ${COMPANY.region} ${COMPANY.postalCode}, ${COMPANY.country}`,
      },
    ],
  },
};
