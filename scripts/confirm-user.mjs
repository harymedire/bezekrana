// One-shot helper: confirms a Supabase auth user (sets email_confirmed_at).
// Use during dev when "Confirm email" is on but you don't want to click links.
//
// Run with:  node scripts/confirm-user.mjs <email>

import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

// Load .env.local
const envPath = path.join(projectRoot, ".env.local");
if (fs.existsSync(envPath)) {
  for (const raw of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/confirm-user.mjs <email>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const password = process.env.SUPABASE_DB_PASSWORD;
if (!url || !password) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD in .env.local");
  process.exit(1);
}
const ref = new URL(url).hostname.split(".")[0];

const REGIONS = [
  "eu-west-1", "eu-central-1", "eu-central-2", "eu-west-2", "eu-west-3", "eu-north-1",
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-south-1",
  "sa-east-1", "ca-central-1",
];

async function findClient() {
  for (const region of REGIONS) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    try {
      await dns.lookup(host);
      const c = new pg.Client({
        host, port: 5432, user: `postgres.${ref}`,
        password, database: "postgres",
        ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000,
      });
      await c.connect();
      return c;
    } catch {}
  }
  throw new Error("Could not connect to Supabase Postgres pooler");
}

const client = await findClient();
const result = await client.query(
  `UPDATE auth.users
     SET email_confirmed_at = NOW()
   WHERE email = $1 AND email_confirmed_at IS NULL
   RETURNING id, email`,
  [email],
);
await client.end();

if (result.rowCount === 0) {
  console.log(`No unconfirmed user with email ${email} (already confirmed or doesn't exist).`);
} else {
  console.log(`✓ Confirmed: ${result.rows[0].email}`);
}
