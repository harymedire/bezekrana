"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function FAQ() {
  const t = useTranslations("landing.faq");
  const items = t.raw("items") as { q: string; a: string }[];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <h2 className="font-display text-3xl md:text-5xl text-center text-plum-900 mb-10">
        {t("title")}
      </h2>
      <div className="space-y-3">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full text-left card hover:border-teal-300 border-2 border-transparent transition"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-display text-lg text-plum-900">{it.q}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-coral-100 text-coral-700 shrink-0">
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </div>
              {isOpen && <p className="mt-3 text-plum-700 leading-relaxed">{it.a}</p>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
