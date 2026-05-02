-- ============================================================================
-- Banners — admin-managed promo slots that render on the user dashboard
-- (336×288 Medium Rectangle). Up to 5 active banners per locale; the slot
-- picks one at random on each render so all active banners get exposure.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.banners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale          TEXT NOT NULL CHECK (locale IN ('bs', 'sr', 'hr')),
  title           TEXT,                      -- internal label, not shown to users
  image_path      TEXT NOT NULL,             -- storage path inside 'banners' bucket
  image_url       TEXT NOT NULL,             -- public URL for fast read
  link_url        TEXT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS banners_locale_active_idx
  ON public.banners(locale, is_active);

CREATE TRIGGER banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "banners: authenticated read active"
  ON public.banners FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = TRUE);

CREATE POLICY "banners: admin all"
  ON public.banners FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Public bucket for banner images (anyone with the URL can view).
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "banners-bucket: admin write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'banners' AND public.is_admin());

CREATE POLICY "banners-bucket: admin update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'banners' AND public.is_admin())
  WITH CHECK (bucket_id = 'banners' AND public.is_admin());

CREATE POLICY "banners-bucket: admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'banners' AND public.is_admin());

CREATE POLICY "banners-bucket: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');
