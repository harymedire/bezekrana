import { Download, Lock } from "lucide-react";
import type { ContentPack } from "@/types/db";
import { cn } from "@/lib/utils/cn";

// Reusable pack card. Used inside both the Hero carousel and (in compact
// form) inside the Archive scroller. Renders locked/unlocked state via the
// `unlocked` prop. In compact mode unlocked cards are clickable — clicking
// promotes the pack into the hero carousel rather than triggering a download.
export function PackCard({
  pack,
  unlocked,
  compact = false,
  onClick,
}: {
  pack: ContentPack;
  unlocked: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  const clickable = compact && unlocked && !!onClick;

  const inner = (
    <>
      <div className={cn(
        "badge bg-plum-100 text-plum-700 absolute z-10",
        compact ? "top-2 right-2 text-[9px] px-2" : "top-3 right-3",
      )}>
        Sedmica {pack.sequence_number}
      </div>

      <div className={cn(
        "aspect-[210/297] rounded-2xl bg-gradient-to-br from-coral-100 via-sun-100 to-teal-100 mb-3 flex items-center justify-center overflow-hidden relative",
      )}>
        {pack.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pack.thumbnail_url} alt="" className="h-full w-full rounded-2xl object-cover" />
        ) : (
          <span className={cn("font-display text-plum-300", compact ? "text-2xl" : "text-4xl")}>
            #{pack.sequence_number}
          </span>
        )}
        {!unlocked && (
          <div className="absolute inset-0 bg-plum-900/55 backdrop-blur-[2px] grid place-items-center rounded-2xl">
            <Lock className={cn("text-white/85", compact ? "h-5 w-5" : "h-9 w-9")} />
          </div>
        )}
      </div>

      <h3 className={cn(
        "font-display text-plum-900 line-clamp-2",
        compact ? "text-xs leading-tight" : "text-lg",
      )}>
        {pack.title}
      </h3>
      {!compact && pack.description && (
        <p className="text-sm text-plum-600 line-clamp-2 mt-1">{pack.description}</p>
      )}

      {compact ? (
        <div className="mt-2">
          {unlocked ? (
            <div className="flex items-center justify-center rounded-full bg-coral-500 text-white px-2 py-1.5 text-[11px] font-bold">
              Izaberi
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 rounded-full border-2 border-plum-100 px-2 py-1.5 text-[11px] font-bold text-plum-400">
              <Lock className="h-3.5 w-3.5" />
              Otključavanje prema planu
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {unlocked ? (
            <>
              <a
                href={`/api/content/download/${pack.id}`}
                className="btn-primary w-full inline-flex"
              >
                <Download className="h-4 w-4" /> Preuzmi PDF
              </a>
              {pack.pdf_storage_path_no_bg && (
                <a
                  href={`/api/content/download/${pack.id}?bw=1`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-plum-200 px-7 py-3.5 text-base font-bold text-plum-700 hover:border-plum-300 hover:bg-plum-50 transition"
                  title="Verzija bez pozadinskih boja — pogodno za štampu"
                >
                  <Download className="h-4 w-4" /> Bez pozadina (za štampu)
                </a>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-full border-2 border-plum-100 px-4 py-2.5 text-sm font-bold text-plum-400">
              <Lock className="h-4 w-4" /> Otključavanje prema planu
            </div>
          )}
        </div>
      )}
    </>
  );

  if (clickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="card relative overflow-hidden h-full p-3 w-full text-left cursor-pointer hover:-translate-y-0.5 hover:shadow-soft transition"
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={cn("card relative overflow-hidden h-full", compact && "p-3")}>
      {inner}
    </div>
  );
}
