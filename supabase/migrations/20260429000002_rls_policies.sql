-- ============================================================================
-- BezEkrana — Row Level Security policies
-- ============================================================================
-- Notes:
--   • Server routes that need to mutate everything (e.g. webhook handlers)
--     use the service_role key, which bypasses RLS — that's intentional.
--   • Client-side code goes through the anon key and is bound by these rules.
-- ============================================================================

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_packs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_time_purchases  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_tips            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tracking       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events      ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
CREATE POLICY "profiles: own row read"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles: own row update"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND subscription_status = (SELECT subscription_status FROM public.profiles WHERE id = auth.uid())
    AND weeks_consumed = (SELECT weeks_consumed FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles: admin all"
  ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- content_packs
-- ----------------------------------------------------------------------------
-- Authenticated users can SEE pack listings (title, description, sequence_number,
-- thumbnail) so the UI can show locked-state previews. Actual PDF download goes
-- through a signed-URL endpoint that calls user_can_access_pack().
-- ----------------------------------------------------------------------------
CREATE POLICY "content_packs: authenticated can read published"
  ON public.content_packs FOR SELECT
  USING (auth.role() = 'authenticated' AND published = TRUE);

CREATE POLICY "content_packs: admin all"
  ON public.content_packs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- one_time_purchases
-- ----------------------------------------------------------------------------
CREATE POLICY "one_time_purchases: own rows"
  ON public.one_time_purchases FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "one_time_purchases: admin all"
  ON public.one_time_purchases FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- sos_tips : public to all authenticated users
-- ----------------------------------------------------------------------------
CREATE POLICY "sos_tips: read all"
  ON public.sos_tips FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "sos_tips: admin write"
  ON public.sos_tips FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- user_tracking : write-once, own row only
-- ----------------------------------------------------------------------------
CREATE POLICY "user_tracking: own row read"
  ON public.user_tracking FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_tracking: own row insert"
  ON public.user_tracking FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- webhook_events : service role only (no client policy = no client access)
-- ----------------------------------------------------------------------------
CREATE POLICY "webhook_events: admin read"
  ON public.webhook_events FOR SELECT
  USING (public.is_admin());
