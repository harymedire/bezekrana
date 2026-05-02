-- ============================================================================
-- Add an optional second PDF variant per pack — the "ink-save" / B&W version
-- generated from the same template with the "Bez pozadinskih boja" toggle on.
-- Admin uploads either or both; user can pick which to download.
-- ============================================================================

ALTER TABLE public.content_packs
  ADD COLUMN IF NOT EXISTS pdf_storage_path_no_bg TEXT;
