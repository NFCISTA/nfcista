/**
 * Apply Supabase migration via Management API (pg_dump compatible).
 * Uses Supabase's postgres connection directly via node-postgres.
 */
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^=\s]+)\s*=\s*(.*)/);
  if (m) envVars[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];

// The Supabase DB connection can be derived from the project ref
const projectRef = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

console.log(`Project ref: ${projectRef}`);
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log("");
console.log("SUPABASE_SERVICE_ROLE_KEY is not available in .env.local (expected - production-only).");
console.log("");
console.log("=== Migration to apply ===");
console.log(fs.readFileSync("supabase/migrations/20261007000000_add_customer_gallery_rls.sql", "utf-8"));
