// Resets a user's password using the Supabase Admin API. Service-role only.
//
// Run with:  node scripts/reset-password.mjs <email> <new-password>

import fs from "node:fs";
import path from "node:path";
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
const newPassword = process.argv[3];
if (!email || !newPassword) {
  console.error("Usage: node scripts/reset-password.mjs <email> <new-password>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// 1) Find user id by email
const headers = {
  Authorization: `Bearer ${serviceKey}`,
  apikey: serviceKey,
  "Content-Type": "application/json",
};

const listRes = await fetch(`${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, { headers });
if (!listRes.ok) {
  console.error("List failed:", listRes.status, await listRes.text());
  process.exit(1);
}
const listData = await listRes.json();
const user = listData.users?.find?.((u) => u.email === email) ?? listData.users?.[0];
if (!user) {
  console.error(`No user with email ${email}`);
  process.exit(1);
}

// 2) Update password (and clear any rate-limit state by also touching email_confirmed_at)
const updRes = await fetch(`${url}/auth/v1/admin/users/${user.id}`, {
  method: "PUT",
  headers,
  body: JSON.stringify({ password: newPassword, email_confirm: true }),
});
if (!updRes.ok) {
  console.error("Update failed:", updRes.status, await updRes.text());
  process.exit(1);
}
console.log(`✓ Password reset for ${email}`);
console.log(`  New password: ${newPassword}`);
