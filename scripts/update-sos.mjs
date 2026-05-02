// One-shot patch for the "sorting" SOS tip — buttons are choke hazard for
// 2–4 year olds, so we replace the button reference with larger/safer items.

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

await client.query(
  `UPDATE public.sos_tips
      SET title = 'Sortiranje boja',
          body  = 'Krupne LEGO kocke ili veliki šareni čepovi od plastičnih boca po bojama u činijice. Bezbjedno za uzrast 2–4 god.'
   WHERE locale = 'bs' AND title = 'Sortiranje šarafa'`,
);
await client.query(
  `UPDATE public.sos_tips
      SET title = 'Sort the colors',
          body  = 'Large LEGO bricks or big plastic bottle caps sorted by color into bowls. Safe for ages 2–4.'
   WHERE locale = 'en' AND title = 'Sort the buttons'`,
);
await client.end();
console.log("✓ SOS sorting tip updated (BS + EN)");
