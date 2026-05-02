"use client";

import { useState } from "react";
import type { LegalContent } from "@/lib/legal/content";
import { LAST_UPDATED } from "@/lib/legal/content";

// Bilingual legal page with EN/BS tabs. English is the canonical, default
// version (Stripe and US/EU regulators expect English text). Bosnian tab
// available regardless of the visitor's site locale — these are formal
// documents that should be readable in either language.
export function LegalPageTabbed({ content }: { content: LegalContent }) {
  const [lang, setLang] = useState<"en" | "bs">("en");
  const doc = content[lang];

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-20 md:px-6">
      <p className="text-sm text-plum-500 mb-3">
        {lang === "en" ? "Last updated" : "Posljednja izmjena"}: {LAST_UPDATED}
      </p>

      {/* Language tabs */}
      <div className="inline-flex items-center gap-1 mb-6 rounded-full bg-white p-1 shadow-soft border border-plum-100">
        <button
          type="button"
          onClick={() => setLang("en")}
          className={
            "rounded-full px-4 py-1.5 text-sm font-bold transition " +
            (lang === "en"
              ? "bg-plum-700 text-white"
              : "text-plum-600 hover:bg-plum-50")
          }
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLang("bs")}
          className={
            "rounded-full px-4 py-1.5 text-sm font-bold transition " +
            (lang === "bs"
              ? "bg-plum-700 text-white"
              : "text-plum-600 hover:bg-plum-50")
          }
        >
          Bosanski
        </button>
      </div>

      <h1 className="font-display text-3xl md:text-5xl text-plum-900 mb-4">{doc.title}</h1>
      <p className="text-lg text-plum-700 mb-10 leading-relaxed">{doc.intro}</p>

      <div className="space-y-8">
        {doc.sections.map((s, i) => (
          <section key={`${lang}-${i}`}>
            <h2 className="font-display text-xl md:text-2xl text-plum-800 mb-2">
              {s.heading}
            </h2>
            <p className="text-plum-700 leading-relaxed whitespace-pre-line">
              {s.body}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
