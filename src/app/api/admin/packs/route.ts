import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import type { Currency, Locale } from "@/types/db";

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
  return { ok: true as const, userId: user.id };
}

export async function POST(request: Request) {
  const auth = await ensureAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.msg }, { status: auth.status });

  const fd = await request.formData();
  const service = createSupabaseServiceClient();

  const id = fd.get("id") as string | null;
  const sequence_number = Number(fd.get("sequence_number"));
  const locale = (fd.get("locale") as Locale) || "bs";
  const title = (fd.get("title") as string) || "";
  const description = (fd.get("description") as string) || null;
  const one_time_available = (fd.get("one_time_available") as string) === "true";
  const priceRaw = fd.get("one_time_price_cents") as string | null;
  const one_time_price_cents = priceRaw && priceRaw.length > 0 ? Number(priceRaw) : null;
  const one_time_currency = (fd.get("one_time_currency") as Currency) || "BAM";

  const pdf = fd.get("pdf") as File | null;
  const pdfNoBg = fd.get("pdf_no_bg") as File | null;
  const thumb = fd.get("thumbnail") as File | null;

  // Resolve PDF storage path: upload only if a new file was provided.
  let pdf_storage_path: string | null = null;
  if (pdf && pdf.size > 0) {
    const path = `${locale}/${sequence_number}-${Date.now()}.pdf`;
    const { error: uploadErr } = await service.storage
      .from("content-packs")
      .upload(path, pdf, { contentType: "application/pdf", upsert: false });
    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    pdf_storage_path = path;
  }

  // Optional B&W / ink-save variant
  let pdf_storage_path_no_bg: string | null = null;
  if (pdfNoBg && pdfNoBg.size > 0) {
    const path = `${locale}/${sequence_number}-${Date.now()}-nobg.pdf`;
    const { error: uploadErr } = await service.storage
      .from("content-packs")
      .upload(path, pdfNoBg, { contentType: "application/pdf", upsert: false });
    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    pdf_storage_path_no_bg = path;
  }

  let thumbnail_url: string | null = null;
  if (thumb && thumb.size > 0) {
    const path = `${locale}/${sequence_number}-${Date.now()}-${thumb.name}`;
    const { error: thumbErr } = await service.storage
      .from("thumbnails")
      .upload(path, thumb, { contentType: thumb.type || "image/png", upsert: false });
    if (thumbErr) return NextResponse.json({ error: thumbErr.message }, { status: 500 });
    const { data: pub } = service.storage.from("thumbnails").getPublicUrl(path);
    thumbnail_url = pub.publicUrl;
  }

  if (id) {
    // Update
    const update: Record<string, unknown> = {
      sequence_number,
      locale,
      title,
      description,
      one_time_available,
      one_time_price_cents,
      one_time_currency: one_time_available ? one_time_currency : null,
    };
    if (pdf_storage_path) update.pdf_storage_path = pdf_storage_path;
    if (pdf_storage_path_no_bg) update.pdf_storage_path_no_bg = pdf_storage_path_no_bg;
    if (thumbnail_url) update.thumbnail_url = thumbnail_url;
    const { error } = await service.from("content_packs").update(update).eq("id", id);
    if (error) {
      const friendly = error.message.includes("content_packs_sequence_number_locale_key")
        ? `Već postoji paket sa rednim brojem ${sequence_number} za jezik "${locale}". Promijeni redni broj ili uredi taj postojeći paket.`
        : error.message;
      return NextResponse.json({ error: friendly }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id });
  }

  // Create — pdf_storage_path is required
  if (!pdf_storage_path) {
    return NextResponse.json({ error: "pdf-required" }, { status: 400 });
  }
  const { data, error } = await service
    .from("content_packs")
    .insert({
      sequence_number,
      locale,
      title,
      description,
      pdf_storage_path,
      pdf_storage_path_no_bg,
      thumbnail_url,
      one_time_available,
      one_time_price_cents,
      one_time_currency: one_time_available ? one_time_currency : null,
    })
    .select("id")
    .single();
  if (error) {
    // Translate the (sequence_number, locale) unique-constraint violation into
    // a concrete admin-facing message instead of leaking the raw Postgres text.
    const friendly = error.message.includes("content_packs_sequence_number_locale_key")
      ? `Već postoji paket sa rednim brojem ${sequence_number} za jezik "${locale}". Promijeni redni broj ili uredi postojeći paket.`
      : error.message;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}

export async function DELETE(request: Request) {
  const auth = await ensureAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.msg }, { status: auth.status });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing-id" }, { status: 400 });

  const service = createSupabaseServiceClient();
  const { error } = await service.from("content_packs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
