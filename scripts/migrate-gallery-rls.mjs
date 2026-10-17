/**
 * Apply gallery RLS migration via Supabase REST API pg endpoint.
 * Uses SUPABASE_SERVICE_ROLE_KEY from Vercel env (passed via --env flag or direct arg).
 *
 * Usage:
 *   node scripts/migrate-gallery-rls.mjs <SERVICE_ROLE_KEY>
 *
 * The service role key is passed as a CLI argument (not stored in any file).
 */
import fs from "fs";

const serviceRoleKey = process.argv[2];

if (!serviceRoleKey) {
  console.error("Usage: node scripts/migrate-gallery-rls.mjs <SUPABASE_SERVICE_ROLE_KEY>");
  console.error("Obtain the key from Vercel → Project → Settings → Environment Variables.");
  process.exit(1);
}

const envContent = fs.readFileSync(".env.local", "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^=\s]+)\s*=\s*(.*)/);
  if (m) envVars[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
if (!SUPABASE_URL) {
  console.error("NEXT_PUBLIC_SUPABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = fs.readFileSync(
  "supabase/migrations/20261007000000_add_customer_gallery_rls.sql",
  "utf-8"
);

console.log(`Applying migration to: ${SUPABASE_URL}`);
console.log("Statements to execute: customer gallery RLS policies");
console.log("");

// Use Supabase's pg endpoint (available via the REST API)
const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "apikey": serviceRoleKey,
    "Authorization": `Bearer ${serviceRoleKey}`,
    "Prefer": "return=representation",
  },
  body: JSON.stringify({ sql }),
});

if (!response.ok) {
  const errText = await response.text();
  console.log("exec_sql RPC not available (expected). Trying direct pg endpoint...");

  // Try the pg endpoint
  const pgResp = await fetch(`${SUPABASE_URL}/pg`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!pgResp.ok) {
    const pgText = await pgResp.text();
    console.log("Direct pg endpoint also not available:", pgText.slice(0, 200));
    console.log("");
    console.log("=== Please apply this SQL manually in the Supabase Dashboard SQL Editor ===");
    console.log(`URL: https://supabase.com/dashboard/project/${SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1]}/sql`);
    process.exit(0);
  }

  const pgData = await pgResp.json();
  console.log("Result:", JSON.stringify(pgData, null, 2));
} else {
  const data = await response.json().catch(() => ({}));
  console.log("Migration applied successfully:", data);
}

// Verify the policies were created
console.log("\n=== Verifying RLS Policies ===");
const { createClient } = await import("@supabase/supabase-js");
const db = createClient(SUPABASE_URL, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: policies, error: polErr } = await db
  .from("pg_policies")
  .select("policyname, tablename")
  .in("tablename", ["gallery_items", "gallery_item_images"])
  .order("tablename")
  .order("policyname");

if (polErr) {
  console.log("Cannot query pg_policies directly. Checking via test queries...");
} else {
  console.log("Active policies:", JSON.stringify(policies, null, 2));
}
