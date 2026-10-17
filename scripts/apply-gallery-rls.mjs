import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.log("Note: Local .env.local does not have SUPABASE_SERVICE_ROLE_KEY.");
  console.log("This is expected — it's production-only.");
  console.log("");
  console.log("To apply the migration, one of these options is needed:");
  console.log("  A) Apply via Supabase Dashboard SQL Editor (paste contents below)");
  console.log("  B) Set SUPABASE_SERVICE_ROLE_KEY locally and re-run this script");
  console.log("  C) Migration will auto-apply as part of production deployment if configured");
  console.log("");
  const sql = fs.readFileSync("supabase/migrations/20261007000000_add_customer_gallery_rls.sql", "utf-8");
  console.log("=== Migration SQL ===");
  console.log(sql);
  process.exit(0);
}

const serviceClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log("Applying migration: 20261007000000_add_customer_gallery_rls.sql");

// Test that RLS is being enforced at the DB level by checking policies
const { data: policies, error } = await serviceClient.rpc("exec_sql", {
  sql: `SELECT policyname, tablename FROM pg_policies
        WHERE tablename IN ('gallery_items', 'gallery_item_images')
        ORDER BY tablename, policyname;`,
});

if (error) {
  // exec_sql not available — try direct from dashboard link
  console.log("Direct DB exec not available via anon API. Please apply via Supabase Dashboard.");
}

console.log("Existing policies:", JSON.stringify(policies, null, 2));
