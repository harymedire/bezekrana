import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

const MAX_PER_LOCALE = 5;
const ALLOWED_LOCALES = ["bs", "sr", "hr"] as const;

async function ensureAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, msg: "unauthenticated" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { ok: false as const, status: 403, msg: "forbidden" };
  return { ok: true as const };
}

export async function POST(request: Request) {
  const auth = await ensureAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.msg }, { status: auth.status });

  const fd = await request.formData();
  const service = createSupabaseServiceClient();

  const id = fd.get("id") as string | null;
  const title = ((fd.get("title") as string) || "").trim() || null;
  const locale = ((fd.get("locale") as string) || "bs") as (typeof ALLOWED_LOCALES)[number];
  const link_url = ((fd.get("link_url") as string) || "").trim();
  const is_active = (fd.get("is_active") as string) === "true";
  const image = fd.get("image") as File | null;

  if (!ALLOWED_LOCALES.includes(locale)) {
    return NextResponse.json({ error: "invalid-locale" }, { status: 400 });
  }
  if (!link_url.startsWith("http")) {
    return NextResponse.json({ error: "invalid-link" }, { status: 400 });
  }

  // Enforce max-active per locale (when activating a banner)
  if (is_active) {
    const { count } = await service
      .from("banners")
      .select("id", { count: "exact", head: true })
      .eq("locale", locale)
      .eq("is_active", true);
    const currentlyActive = count ?? 0;
    // If editing the same row that's already active, it doesn't add to count.
    let willAddOne = !id;
    if (id) {
      const { data: existing } = await service
        .from("banners")
        .select("is_active, locale")
        .eq("id", id)
        .single();
      // Adds one if it wasn't active before, OR moved to a different locale
      if (existing && (!existing.is_active || existing.locale !== locale)) willAddOne = true;
    }
    if (willAddOne && currentlyActive >= MAX_PER_LOCALE) {
      return NextResponse.json(
        { error: `Već imaš ${MAX_PER_LOCALE} aktivnih za ${locale}. Pauziraj jedan prije aktiviranja novog.` },
        { status: 400 },
      );
    }
  }

  // Image upload (optional on edit)
  let image_path: string | null = null;
  let image_url: string | null = null;
  if (image && image.size > 0) {
    const ext = image.name.includes(".") ? image.name.split(".").pop() : "png";
    const path = `${locale}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await service.storage
      .from("banners")
      .upload(path, image, { contentType: image.type || "image/png", upsert: false });
    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    image_path = path;
    const { data: pub } = service.storage.from("banners").getPublicUrl(path);
    image_url = pub.publicUrl;
  }

  if (id) {
    const update: Record<string, unknown> = { title, locale, link_url, is_active };
    if (image_path && image_url) {
      update.image_path = image_path;
      update.image_url = image_url;
    }
    const { error } = await service.from("banners").update(update).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id });
  }

  if (!image_path || !image_url) {
    return NextResponse.json({ error: "image-required" }, { status: 400 });
  }
  const { data, error } = await service
    .from("banners")
    .insert({ title, locale, link_url, is_active, image_path, image_url })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

export async function DELETE(request: Request) {
  const auth = await ensureAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.msg }, { status: auth.status });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing-id" }, { status: 400 });

  const service = createSupabaseServiceClient();
  // Look up image_path to clean up storage too
  const { data: row } = await service
    .from("banners")
    .select("image_path")
    .eq("id", id)
    .single();
  if (row?.image_path) {
    await service.storage.from("banners").remove([row.image_path]);
  }
  const { error } = await service.from("banners").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
