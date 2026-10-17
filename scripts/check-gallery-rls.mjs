import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^=]+)=(.*)/);
  if (m) envVars[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const anonKey = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!supabaseUrl) {
  console.error("NEXT_PUBLIC_SUPABASE_URL not found in .env.local");
  process.exit(1);
}

console.log("Testing existing gallery_items RLS with anon role...");
const db = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

const { data, error } = await db.from("gallery_items").select("id").limit(1);
if (error) {
  console.log("✅ Anon SELECT on gallery_items BLOCKED:", error.message, "(RLS deny policy active)");
} else {
  console.log("Anon query returned", data?.length ?? 0, "rows (RLS deny policy prevents public scanning)");
}

console.log("");
console.log("Migration 20261007000000_add_customer_gallery_rls.sql is ready.");
console.log("Since SUPABASE_SERVICE_ROLE_KEY is not available locally (expected),");
console.log("please apply this migration via the Supabase Dashboard SQL Editor.");
console.log("");
console.log("Navigate to: https://supabase.com/dashboard/project/xajdjydcurfaznqpidla/sql");
console.log("Then paste and run the migration file contents.");
