-- ============================================================================
-- BezEkrana — Storage buckets + storage RLS
-- ============================================================================
-- Bucket: 'content-packs' (private). PDFs are NEVER served directly to clients;
-- the API route /api/content/download/[packId] verifies access via
-- user_can_access_pack() and returns a short-lived signed URL.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('content-packs', 'content-packs', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Bucket: 'thumbnails' (public, read-only)
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Only admins can upload/modify content. Reads on 'content-packs' happen
-- only via service-role signed-URL generation, so no client read policy.
-- ----------------------------------------------------------------------------
CREATE POLICY "content-packs: admin write"
  ON storage.objects FOR ALL
  USING (bucket_id = 'content-packs' AND public.is_admin())
  WITH CHECK (bucket_id = 'content-packs' AND public.is_admin());

CREATE POLICY "thumbnails: admin write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'thumbnails' AND public.is_admin());

CREATE POLICY "thumbnails: admin update/delete"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'thumbnails' AND public.is_admin())
  WITH CHECK (bucket_id = 'thumbnails' AND public.is_admin());

CREATE POLICY "thumbnails: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');
