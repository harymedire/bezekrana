// One-shot migration runner. Reads SUPABASE_DB_PASSWORD from env and applies
// every .sql file under supabase/migrations/ in lexicographic order.
//
// Run with:  npm run db:migrate

import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

// Lazy-load .env.local without a dependency on dotenv
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const password = process.env.SUPABASE_DB_PASSWORD;
if (!url || !password) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD in .env.local");
  process.exit(1);
}

const ref = new URL(url).hostname.split(".")[0];

// Try direct DB first; if that fails, sweep common AWS regions on the pooler.
const REGIONS = [
  "eu-central-1", "eu-central-2", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1",
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-south-1",
  "sa-east-1", "ca-central-1",
];

async function tryConnect(host, port, user) {
  const c = new pg.Client({
    host, port, user,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  await c.connect();
  return c;
}

async function findClient() {
  // 1) Direct DB (legacy/paid)
  try {
    await dns.lookup(`db.${ref}.supabase.co`);
    const c = await tryConnect(`db.${ref}.supabase.co`, 5432, "postgres");
    console.log(`✓ Direct connection`);
    return c;
  } catch {}

  // 2) Sweep regional poolers — pooler username is `postgres.<ref>`. The
  //    "Tenant or user not found" error means we hit a region that doesn't
  //    host this project; we just keep going until one accepts us.
  for (const region of REGIONS) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    try {
      await dns.lookup(host);
      process.stdout.write(`Trying ${region}… `);
      const c = await tryConnect(host, 5432, `postgres.${ref}`);
      console.log(`✓ matched`);
      return c;
    } catch (err) {
      console.log(err.message.includes("Tenant or user") ? "no" : `× (${err.code || err.message})`);
    }
  }
  throw new Error("No reachable Supabase pooler region matched this project.");
}

let client;
try {
  client = await findClient();
} catch (err) {
  console.error("\n" + err.message);
  console.error(
    "\n→ Open Supabase → Project Settings → Database and copy the exact" +
    "\n  'Session pooler' connection string, then paste it here.",
  );
  process.exit(1);
}
console.log("");

const migrationsDir = path.join(projectRoot, "supabase", "migrations");
const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  process.stdout.write(`  → ${file} `);
  const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
  try {
    await client.query(sql);
    console.log("✓");
  } catch (err) {
    console.log("✗");
    console.error(`\nFailed in ${file}:\n${err.message}\n`);
    await client.end();
    process.exit(1);
  }
}

await client.end();
console.log("\n✓ All migrations applied.");
