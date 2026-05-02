// Hand-maintained DB types. After your first deploy, regenerate with:
//   npx supabase gen types typescript --project-id <ID> > src/types/supabase.ts
// and switch this file to re-export from there.

export type Locale = "bs" | "sr" | "hr" | "en" | "de" | "sl" | "pl";
export type Currency = "BAM" | "EUR" | "USD";
export type SubscriptionStatus = "none" | "active" | "past_due" | "canceled" | "paused";
export type PaymentProvider = "stripe" | "dodo";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "user" | "admin";
  locale: Locale;
  currency: Currency;
  subscription_provider: PaymentProvider | null;
  subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
  weeks_consumed: number;
  last_consumption_at: string | null;
  stripe_customer_id: string | null;
  dodo_customer_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentPack = {
  id: string;
  sequence_number: number;
  locale: Locale;
  title: string;
  description: string | null;
  pdf_storage_path: string;
  /** Optional B&W / "ink-save" variant generated from the same template
   *  with the "Bez pozadinskih boja" toggle on — useful for plain printers. */
  pdf_storage_path_no_bg: string | null;
  thumbnail_url: string | null;
  one_time_available: boolean;
  one_time_price_cents: number | null;
  one_time_currency: Currency | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type OneTimePurchase = {
  id: string;
  user_id: string;
  pack_id: string;
  provider: PaymentProvider;
  provider_payment_id: string;
  amount_cents: number;
  currency: Currency;
  created_at: string;
};

export type Banner = {
  id: string;
  locale: Locale;
  title: string | null;
  image_path: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SosTip = {
  id: string;
  locale: Locale;
  title: string;
  body: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
};
