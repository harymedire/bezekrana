// Dev helper: puts a user in the "only one-time purchase, no subscription"
// state, so we can sanity-check the dashboard for that segment.
//
//   • subscription_status → 'none'
//   • weeks_consumed → 0
//   • a row in one_time_purchases pointing to a real content_packs row
//     (creates a placeholder pack if none exists yet)
//
// Run with:  node scripts/fake-onetime.mjs <email>

import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const envPath = path.join(projectRoot, ".env.local");
if (fs.existsSync(envPath)) {
  for (const raw of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("="); if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const email = process.argv[2];
if (!email) { console.error("Usage: node scripts/fake-onetime.mjs <email>"); process.exit(1); }

const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const password = process.env.SUPABASE_DB_PASSWORD;

const REGIONS = ["eu-west-1", "eu-central-1", "us-east-1", "us-west-1"];
let client;
for (const region of REGIONS) {
  try {
    await dns.lookup(`aws-0-${region}.pooler.supabase.com`);
    client = new pg.Client({
      host: `aws-0-${region}.pooler.supabase.com`, port: 5432,
      user: `postgres.${ref}`, password, database: "postgres",
      ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000,
    });
    await client.connect();
    break;
  } catch { client = null; }
}
if (!client) { console.error("No region matched"); process.exit(1); }

// 1) Resolve user
const userRes = await client.query(
  `SELECT id FROM public.profiles WHERE email = $1`,
  [email],
);
if (userRes.rowCount === 0) {
  console.error(`No profile for ${email}`);
  await client.end();
  process.exit(1);
}
const userId = userRes.rows[0].id;

// 2) Reset subscription state
await client.query(
  `UPDATE public.profiles
      SET subscription_status     = 'none',
          subscription_provider   = NULL,
          subscription_id         = NULL,
          subscription_started_at = NULL,
          subscription_ends_at    = NULL,
          weeks_consumed          = 0,
          last_consumption_at     = NULL
    WHERE id = $1`,
  [userId],
);

// 3) Find or create a pack for the BS locale
let packRes = await client.query(
  `SELECT id, title, sequence_number FROM public.content_packs
    WHERE locale = 'bs'
    ORDER BY sequence_number ASC
    LIMIT 1`,
);
let packId, packTitle, packSeq;
if (packRes.rowCount === 0) {
  const created = await client.query(
    `INSERT INTO public.content_packs
       (sequence_number, locale, title, description, pdf_storage_path,
        one_time_available, one_time_price_cents, one_time_currency)
     VALUES (1, 'bs', 'Naša sedmica #1 — Moć običnih stvari',
             'Sedam aktivnosti sa kuhinjskim kašikama, teglama i dekama.',
             'bs/placeholder.pdf', TRUE, 599, 'EUR')
     RETURNING id, title, sequence_number`,
  );
  packId = created.rows[0].id;
  packTitle = created.rows[0].title;
  packSeq = created.rows[0].sequence_number;
  console.log(`  ↳ created placeholder pack #${packSeq} "${packTitle}"`);
} else {
  packId = packRes.rows[0].id;
  packTitle = packRes.rows[0].title;
  packSeq = packRes.rows[0].sequence_number;
}

// 4) Add the one-time purchase
await client.query(
  `INSERT INTO public.one_time_purchases
     (user_id, pack_id, provider, provider_payment_id, amount_cents, currency)
   VALUES ($1, $2, 'dodo', $3, 599, 'EUR')
   ON CONFLICT (user_id, pack_id) DO UPDATE
     SET provider_payment_id = EXCLUDED.provider_payment_id`,
  [userId, packId, `pay_test_${Date.now()}`],
);

await client.end();
console.log(`✓ ${email} → no subscription, owns pack #${packSeq} "${packTitle}"`);
