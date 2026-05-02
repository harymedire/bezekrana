import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Banner } from "@/types/db";

// 336×288 Medium Rectangle banner slot rendered above the dashboard nav.
// Server-side picks ONE random active banner from the visitor's locale on
// each render — so multiple active banners get fair rotation across views.
// Renders nothing if no active banner exists for the locale.
export async function BannerSlot({ locale }: { locale: string }) {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("id, image_url, link_url")
    .eq("locale", locale)
    .eq("is_active", true)
    .limit(20);

  if (!banners || banners.length === 0) return null;

  const banner = banners[Math.floor(Math.random() * banners.length)] as Pick<
    Banner,
    "id" | "image_url" | "link_url"
  >;

  return (
    <div className="my-6 flex flex-col items-center">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-plum-400 mb-2">
        Izdvojeno
      </span>
      <a
        href={banner.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block overflow-hidden shadow-soft hover:shadow-[0_8px_28px_rgba(63,44,90,.18)] transition-shadow"
        style={{ width: 336, height: 288 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.image_url}
          alt=""
          width={336}
          height={288}
          className="w-full h-full object-cover"
        />
      </a>
    </div>
  );
}
