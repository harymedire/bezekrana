-- ============================================================================
-- BezEkrana — Initial schema
-- ============================================================================
-- Convention:
--   • Money stored in minor units (cents) as INTEGER + ISO currency code
--   • All timestamps in UTC (TIMESTAMPTZ)
--   • Soft-delete is NOT used — admin deletes content cleanly via cascades
-- ============================================================================

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles : application-level data attached to auth.users
-- ----------------------------------------------------------------------------
-- Drip-access logic lives here:
--   weeks_consumed counts how many weekly content packs the user has unlocked.
--   It increments by +1 every time we receive a successful weekly invoice
--   webhook, and never resets on cancel/pause — that's how we honor "pause &
--   resume from where you left off" without a clock-based recompute.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                    TEXT NOT NULL,
  full_name                TEXT,
  role                     TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  locale                   TEXT NOT NULL DEFAULT 'bs',
  currency                 TEXT NOT NULL DEFAULT 'BAM' CHECK (currency IN ('BAM', 'EUR', 'USD')),
  -- Subscription state (mirrored from payment provider via webhooks)
  subscription_provider    TEXT CHECK (subscription_provider IN ('stripe', 'dodo')),
  subscription_id          TEXT, -- provider-side subscription id
  subscription_status      TEXT NOT NULL DEFAULT 'none'
                              CHECK (subscription_status IN ('none', 'active', 'past_due', 'canceled', 'paused')),
  subscription_started_at  TIMESTAMPTZ,
  subscription_ends_at     TIMESTAMPTZ,
  weeks_consumed           INTEGER NOT NULL DEFAULT 0,
  last_consumption_at      TIMESTAMPTZ,
  -- Provider customer references
  stripe_customer_id       TEXT UNIQUE,
  dodo_customer_id         TEXT UNIQUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- ----------------------------------------------------------------------------
-- content_packs : weekly activity packs
-- ----------------------------------------------------------------------------
-- One pack per (sequence_number, locale). E.g. (1, 'bs') is week 1 in Bosnian.
-- The same week can have different PDFs per language; admin uploads each.
-- one_time_available + one_time_price_cents let admin enable/price individual
-- pack purchases per pack, overriding the platform-wide default price.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_packs (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_number          INTEGER NOT NULL CHECK (sequence_number > 0),
  locale                   TEXT NOT NULL,
  title                    TEXT NOT NULL,
  description              TEXT,
  pdf_storage_path         TEXT NOT NULL, -- path inside Supabase Storage 'content-packs' bucket
  thumbnail_url            TEXT,
  one_time_available       BOOLEAN NOT NULL DEFAULT FALSE,
  one_time_price_cents     INTEGER, -- NULL = use platform default for this currency
  one_time_currency        TEXT CHECK (one_time_currency IN ('BAM', 'EUR', 'USD')),
  published                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sequence_number, locale)
);

CREATE INDEX IF NOT EXISTS content_packs_locale_seq_idx
  ON public.content_packs(locale, sequence_number);

-- ----------------------------------------------------------------------------
-- one_time_purchases : record of single-pack purchases
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.one_time_purchases (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pack_id                  UUID NOT NULL REFERENCES public.content_packs(id) ON DELETE CASCADE,
  provider                 TEXT NOT NULL CHECK (provider IN ('stripe', 'dodo')),
  provider_payment_id      TEXT NOT NULL,
  amount_cents             INTEGER NOT NULL,
  currency                 TEXT NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, pack_id)
);

CREATE INDEX IF NOT EXISTS one_time_purchases_user_idx
  ON public.one_time_purchases(user_id);

-- ----------------------------------------------------------------------------
-- sos_tips : static-ish quick ideas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sos_tips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale        TEXT NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  icon          TEXT, -- lucide icon name (optional)
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sos_tips_locale_idx ON public.sos_tips(locale);

-- ----------------------------------------------------------------------------
-- user_tracking : UTM acquisition data, captured at registration
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_tracking (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  utm_source        TEXT,
  utm_medium        TEXT,
  utm_campaign      TEXT,
  utm_term          TEXT,
  utm_content       TEXT,
  referrer          TEXT,
  landing_page_url  TEXT,
  user_agent        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ----------------------------------------------------------------------------
-- webhook_events : idempotency log for incoming provider webhooks
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider      TEXT NOT NULL,
  event_id      TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  processed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, event_id)
);

-- ----------------------------------------------------------------------------
-- Trigger: keep updated_at fresh
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER content_packs_updated_at
  BEFORE UPDATE ON public.content_packs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Trigger: auto-create profile row on auth.users insert
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Helper: is the calling user an admin?
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Helper: does the calling user have access to a given pack?
-- ----------------------------------------------------------------------------
-- Access is granted if EITHER:
--   (a) the user has an active or canceled-but-not-yet-expired subscription
--       AND pack.sequence_number <= profile.weeks_consumed
--   (b) the user has a row in one_time_purchases for that pack
-- A 'canceled' subscription still gets to keep what was already unlocked.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_can_access_pack(pack_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  pack_seq INTEGER;
  user_weeks INTEGER;
  user_status TEXT;
  has_one_time BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN RETURN FALSE; END IF;

  SELECT sequence_number INTO pack_seq
  FROM public.content_packs WHERE id = pack_uuid;

  IF pack_seq IS NULL THEN RETURN FALSE; END IF;

  SELECT weeks_consumed, subscription_status
  INTO user_weeks, user_status
  FROM public.profiles WHERE id = auth.uid();

  IF user_status IN ('active', 'canceled', 'past_due') AND pack_seq <= COALESCE(user_weeks, 0) THEN
    RETURN TRUE;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.one_time_purchases
    WHERE user_id = auth.uid() AND pack_id = pack_uuid
  ) INTO has_one_time;

  RETURN has_one_time;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
