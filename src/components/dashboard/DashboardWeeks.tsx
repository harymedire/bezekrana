"use client";

import { useRef, useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import type { ContentPack } from "@/types/db";
import { UnlockedCarousel } from "./UnlockedCarousel";
import { ArchiveScroller } from "./ArchiveScroller";

// Wraps the "Tvoja sedmica" carousel and the "Arhiva" scroller together so
// they can share carousel-index state. Clicking an unlocked pack in the
// archive promotes it into the carousel up top (and scrolls there).
export function DashboardWeeks({
  unlockedNewestFirst,
  allPacks,
  unlockedIds,
  hasActiveSub,
  currentWeekLabel,
  archiveLabel,
  totalLabel,
  noPackYetLabel,
  upgradeCta,
}: {
  unlockedNewestFirst: ContentPack[];
  allPacks: ContentPack[];
  unlockedIds: string[];
  hasActiveSub: boolean;
  currentWeekLabel: string;
  archiveLabel: string;
  totalLabel: string;
  noPackYetLabel: string;
  upgradeCta?: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const carouselRef = useRef<HTMLElement>(null);

  const handleSelect = (packId: string) => {
    const i = unlockedNewestFirst.findIndex((p) => p.id === packId);
    if (i < 0) return;
    setIndex(i);
    carouselRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section ref={carouselRef}>
        <h2 className="font-display text-2xl text-plum-900 mb-4">{currentWeekLabel}</h2>
        {unlockedNewestFirst.length > 0 ? (
          <UnlockedCarousel
            packs={unlockedNewestFirst}
            index={index}
            onIndexChange={setIndex}
          />
        ) : hasActiveSub ? (
          <div className="card max-w-sm mx-auto text-center py-10">
            <Sparkles className="h-10 w-10 mx-auto text-coral-400 mb-3" />
            <p className="text-plum-700">{noPackYetLabel}</p>
          </div>
        ) : null}
      </section>

      {upgradeCta}

      {allPacks.length > 0 && (
        <section>
          <div className="flex items-baseline gap-3 flex-wrap mb-4">
            <h2 className="font-display text-2xl text-plum-900">{archiveLabel}</h2>
            <span className="text-sm text-plum-500">{totalLabel}</span>
          </div>
          <ArchiveScroller
            packs={allPacks}
            unlockedIds={unlockedIds}
            onSelect={handleSelect}
          />
        </section>
      )}
    </>
  );
}
