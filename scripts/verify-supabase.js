const path = require("path");
require(path.join(process.cwd(), "node_modules/@next/env")).loadEnvConfig(process.cwd());
const { createClient } = require("@supabase/supabase-js");

async function verifyDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("❌ Supabase environment variables are missing.");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  console.log("=== NFCISTA Supabase Security & Schema Verification ===\n");

  // Test 1: Direct SELECT on customers table (Checking RLS blocks anonymous table scans)
  console.log("1. Testing direct anonymous table scan: SELECT * FROM customers...");
  const { data: tableData, error: tableError } = await supabase
    .from("customers")
    .select("*");

  if (tableError) {
    if (tableError.code === "PGRST205") {
      console.log("   ℹ️  Table 'customers' has not been created in Supabase yet.");
      console.log("   ➡️  Please run the migration script in your Supabase SQL Editor.\n");
      return;
    }
    console.log("   🔒 RLS / Access check result:", tableError.message, `(Code: ${tableError.code})`);
  } else {
    if (Array.isArray(tableData) && tableData.length === 0) {
      console.log("   ✅ PASS: Anonymous query to 'customers' returned 0 records (RLS active and blocking table scans).");
    } else {
      console.log("   ⚠️  WARNING: Anonymous query returned records! Check RLS policy.");
    }
  }

  // Test 2: Single lookup via RPC
  console.log("\n2. Testing secure single-slug RPC lookup for 'demo-customer'...");
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_customer_by_slug", {
    slug_input: "demo-customer",
  });

  if (rpcError) {
    console.log("   ℹ️  RPC function not yet installed in Supabase:", rpcError.message);
  } else {
    if (Array.isArray(rpcData) && rpcData.length === 1) {
      const customer = rpcData[0];
      console.log("   ✅ PASS: Single-slug RPC returned exactly 1 record for 'demo-customer'.");
      console.log("      - Full Name:", customer.full_name);
      console.log("      - Company:", customer.company_name);
      console.log("      - Slug:", customer.profile_slug);
    } else {
      console.log("   ℹ️  No record found for 'demo-customer'.");
    }
  }

  // Test 3: Test non-existent slug
  console.log("\n3. Testing RPC with nonexistent slug 'nonexistent-profile-xyz'...");
  const { data: nonExistentData } = await supabase.rpc("get_customer_by_slug", {
    slug_input: "nonexistent-profile-xyz",
  });
  if (Array.isArray(nonExistentData) && nonExistentData.length === 0) {
    console.log("   ✅ PASS: Returns empty array for non-existent slug.");
  }

  console.log("\n=== Verification Finished ===");
}

verifyDatabase().catch((err) => {
  console.error("Verification failed with unexpected error:", err);
});
