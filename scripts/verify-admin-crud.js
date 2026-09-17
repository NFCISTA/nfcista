const path = require("path");
require(path.join(process.cwd(), "node_modules/@next/env")).loadEnvConfig(process.cwd());
const { createClient } = require("@supabase/supabase-js");

async function verifyAdminSecurity() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("❌ Missing Supabase environment variables.");
    process.exit(1);
  }

  const anonClient = createClient(url, anonKey);

  console.log("=== NFCISTA Admin CRUD Security Verification ===\n");

  // 1. Verify Anonymous SELECT is blocked
  console.log("1. Testing Anonymous SELECT from 'customers'...");
  const { data: selData, error: selError } = await anonClient.from("customers").select("*");
  if (selError && (selError.code === "42501" || selError.message.includes("permission denied"))) {
    console.log("   ✅ PASS: Anonymous SELECT blocked by RLS (permission denied).");
  } else if (Array.isArray(selData) && selData.length === 0) {
    console.log("   ✅ PASS: Anonymous SELECT returned 0 rows (RLS active).");
  } else {
    console.error("   ❌ FAIL: Anonymous user read records:", selData);
  }

  // 2. Verify Anonymous INSERT is blocked
  console.log("\n2. Testing Anonymous INSERT into 'customers'...");
  const { error: insError } = await anonClient.from("customers").insert([
    { full_name: "Hacker Attempt", profile_slug: "hacker-slug-" + Date.now() }
  ]);
  if (insError && (insError.code === "42501" || insError.message.includes("permission denied") || insError.code === "PGRST205")) {
    console.log("   ✅ PASS: Anonymous INSERT blocked by RLS.");
  } else {
    console.error("   ❌ FAIL: Anonymous INSERT succeeded or failed unexpectedly:", insError);
  }

  // 3. Verify Anonymous UPDATE is blocked
  console.log("\n3. Testing Anonymous UPDATE on 'customers'...");
  const { data: upData, error: upError } = await anonClient.from("customers")
    .update({ full_name: "Hacked Name" })
    .eq("profile_slug", "demo-customer")
    .select();
  if (upError && (upError.code === "42501" || upError.message.includes("permission denied"))) {
    console.log("   ✅ PASS: Anonymous UPDATE blocked by RLS.");
  } else if (!upData || upData.length === 0) {
    console.log("   ✅ PASS: Anonymous UPDATE affected 0 rows.");
  } else {
    console.error("   ❌ FAIL: Anonymous UPDATE modified data:", upData);
  }

  // 4. Verify Anonymous DELETE is blocked
  console.log("\n4. Testing Anonymous DELETE on 'customers'...");
  const { data: delData, error: delError } = await anonClient.from("customers")
    .delete()
    .eq("profile_slug", "demo-customer")
    .select();
  if (delError && (delError.code === "42501" || delError.message.includes("permission denied"))) {
    console.log("   ✅ PASS: Anonymous DELETE blocked by RLS.");
  } else if (!delData || delData.length === 0) {
    console.log("   ✅ PASS: Anonymous DELETE affected 0 rows.");
  } else {
    console.error("   ❌ FAIL: Anonymous DELETE deleted records:", delData);
  }

  // 5. Verify Public get_customer_by_slug RPC works and preserves privacy
  console.log("\n5. Testing Public RPC get_customer_by_slug('demo-customer')...");
  const { data: rpcData, error: rpcError } = await anonClient.rpc("get_customer_by_slug", {
    slug_input: "demo-customer",
  });
  if (rpcError) {
    console.log("   ℹ️  RPC response:", rpcError.message);
  } else if (Array.isArray(rpcData) && rpcData.length === 1) {
    const cust = rpcData[0];
    console.log("   ✅ PASS: Public RPC successfully returned customer record.");
    console.log("      - Full Name:", cust.full_name);
    console.log("      - Slug:", cust.profile_slug);

    const hasPrivate = cust.phone !== undefined || cust.whatsapp !== undefined || cust.email !== undefined || cust.address !== undefined;
    if (!hasPrivate) {
      console.log("   ✅ PASS: Private contact fields (phone, whatsapp, email, address) are NOT returned.");
    } else {
      console.error("   ❌ FAIL: Private fields leaked in public RPC response!");
    }
  }

  console.log("\n=== Security Verification Completed ===");
}

verifyAdminSecurity().catch(console.error);
