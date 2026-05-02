// Set full_name on a profile (and on auth.users metadata for completeness).
// Run with:  node scripts/set-name.mjs <email> "<full name>"

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
const fullName = process.argv[3];
if (!email || !fullName) {
  console.error('Usage: node scripts/set-name.mjs <email> "<full name>"');
  process.exit(1);
}

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

const r = await client.query(
  `UPDATE public.profiles SET full_name = $1
    WHERE email = $2 RETURNING id, email, full_name`,
  [fullName, email],
);

await client.query(
  `UPDATE auth.users
     SET raw_user_meta_data =
       COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', $1::text)
   WHERE email = $2`,
  [fullName, email],
);

await client.end();

if (r.rowCount === 0) console.log(`No profile for ${email}`);
else console.log(`✓ ${r.rows[0].email} → name: ${r.rows[0].full_name}`);
