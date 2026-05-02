"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentPack } from "@/types/db";
import { PackCard } from "./PackCard";
import { cn } from "@/lib/utils/cn";

// Single-card carousel of unlocked packs. The newest unlocked pack is shown
// first; centered prev/next arrows below let the user step through older
// weeks one at a time. State is controlled by the parent so the archive
// scroller can promote a pack into this carousel on click.
export function UnlockedCarousel({
  packs,
  index,
  onIndexChange,
}: {
  packs: ContentPack[];
  index: number;
  onIndexChange: (i: number) => void;
}) {
  if (packs.length === 0) return null;

  const safe = Math.min(Math.max(0, index), packs.length - 1);
  const current = packs[safe];
  const prev = () => onIndexChange(Math.max(0, safe - 1));
  const advance = () => onIndexChange(Math.min(packs.length - 1, safe + 1));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-sm">
        <PackCard pack={current} unlocked />
      </div>

      {packs.length > 1 && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prev}
            disabled={safe === 0}
            className={cn(
              "h-10 w-10 grid place-items-center rounded-full border-2 border-plum-200 bg-white text-plum-700 transition",
              "hover:border-plum-300 hover:bg-plum-50",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-plum-200",
            )}
            aria-label="Prethodna sedmica"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-plum-500 min-w-[3rem] text-center">
            {safe + 1} / {packs.length}
          </span>
          <button
            type="button"
            onClick={advance}
            disabled={safe === packs.length - 1}
            className={cn(
              "h-10 w-10 grid place-items-center rounded-full border-2 border-plum-200 bg-white text-plum-700 transition",
              "hover:border-plum-300 hover:bg-plum-50",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-plum-200",
            )}
            aria-label="Starija sedmica"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
