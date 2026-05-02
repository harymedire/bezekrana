import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

// Single chokepoint for serving paid content. Verifies access via the SQL
// helper, then mints a 60-second signed URL from the private bucket.
//
// Variants:
//   ?bw=1  → optional B&W / "ink-save" PDF (if the admin uploaded one).
//   default → full-colour PDF.
export async function GET(
  request: Request,
  ctx: { params: Promise<{ packId: string }> },
) {
  const { packId } = await ctx.params;
  const url = new URL(request.url);
  const wantBw = url.searchParams.get("bw") === "1";

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: canAccess, error } = await supabase.rpc("user_can_access_pack", {
    pack_uuid: packId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!canAccess) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const service = createSupabaseServiceClient();
  const { data: pack } = await service
    .from("content_packs")
    .select("pdf_storage_path, pdf_storage_path_no_bg, title")
    .eq("id", packId)
    .single();
  if (!pack) return NextResponse.json({ error: "not-found" }, { status: 404 });

  const path = wantBw && pack.pdf_storage_path_no_bg
    ? pack.pdf_storage_path_no_bg
    : pack.pdf_storage_path;
  const filename = wantBw && pack.pdf_storage_path_no_bg
    ? `${pack.title} (bez pozadine).pdf`
    : `${pack.title}.pdf`;

  if (wantBw && !pack.pdf_storage_path_no_bg) {
    return NextResponse.json({ error: "no-bg-variant-not-available" }, { status: 404 });
  }

  const { data: signed, error: signError } = await service.storage
    .from("content-packs")
    .createSignedUrl(path, 60, { download: filename });
  if (signError || !signed) {
    return NextResponse.json({ error: signError?.message || "sign-failed" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
