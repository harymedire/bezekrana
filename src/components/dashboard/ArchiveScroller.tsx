"use client";

import type { ContentPack } from "@/types/db";
import { PackCard } from "./PackCard";

// Static archive grid showing every pack at once. With ~12 packs the catalog
// fits cleanly in 4 rows × 3 columns on desktop (2 columns on mobile), so
// pagination/arrows aren't needed. Locked and unlocked packs both show —
// locked ones get a lock overlay so the user can preview what's coming.
export function ArchiveScroller({
  packs,
  unlockedIds,
  onSelect,
}: {
  packs: ContentPack[];
  unlockedIds: string[];
  onSelect?: (packId: string) => void;
}) {
  if (packs.length === 0) return null;
  const unlocked = new Set(unlockedIds);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
      {packs.map((p) => (
        <PackCard
          key={p.id}
          pack={p}
          unlocked={unlocked.has(p.id)}
          compact
          onClick={onSelect ? () => onSelect(p.id) : undefined}
        />
      ))}
    </div>
  );
}
