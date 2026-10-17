/**
 * Apply gallery RLS migration via Supabase Management API.
 *
 * Usage:
 *   node scripts/apply-migration-api.mjs <SUPABASE_ACCESS_TOKEN>
 *
 * The access token is your Supabase personal access token from:
 * https://supabase.com/dashboard/account/tokens
 *
 * This uses the official Supabase Management API endpoint to run SQL.
 * The token is passed as a CLI argument and never stored anywhere.
 */
import fs from "fs";

const accessToken = process.argv[2];
const PROJECT_REF = "xajdjydcurfaznqpidla";

if (!accessToken) {
  console.error("Usage: node scripts/apply-migration-api.mjs <SUPABASE_ACCESS_TOKEN>");
  console.error("");
  console.error("Obtain your personal access token from:");
  console.error("  https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

const sql = fs.readFileSync(
  "supabase/migrations/20261007000000_add_customer_gallery_rls.sql",
  "utf-8"
);

console.log("Applying migration via Supabase Management API...");
console.log(`Project: ${PROJECT_REF}`);
console.log("");

// Supabase Management API - Run SQL
const response = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query: sql }),
  }
);

if (!response.ok) {
  const errText = await response.text();
  console.error(`Management API error: HTTP ${response.status}`);
  console.error(errText);
  process.exit(1);
}

const result = await response.json();
console.log("Migration result:", JSON.stringify(result, null, 2));
console.log("");
console.log("✅ Migration applied successfully.");

// Verify by checking policies
console.log("\n=== Verifying RLS policies were created ===");
const verifyResp = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: `SELECT policyname, tablename, cmd
              FROM pg_policies
              WHERE tablename IN ('gallery_items', 'gallery_item_images')
              ORDER BY tablename, policyname;`,
    }),
  }
);

if (verifyResp.ok) {
  const policies = await verifyResp.json();
  const rows = Array.isArray(policies) ? policies : (policies.rows || []);
  console.log("\nActive RLS policies:");
  for (const row of rows) {
    console.log(`  [${row.tablename}] ${row.policyname} (${row.cmd})`);
  }

  const expectedPolicies = [
    "Customers can view their own gallery items",
    "Customers can insert their own gallery items",
    "Customers can update their own gallery items",
    "Customers can delete their own gallery items",
    "Customers can view their own gallery item images",
    "Customers can insert their own gallery item images",
    "Customers can update their own gallery item images",
    "Customers can delete their own gallery item images",
  ];

  const allNames = rows.map(r => r.policyname);
  let allPresent = true;
  for (const ep of expectedPolicies) {
    if (allNames.includes(ep)) {
      console.log(`  ✅ ${ep}`);
    } else {
      console.error(`  ❌ MISSING: ${ep}`);
      allPresent = false;
    }
  }

  if (allPresent) {
    console.log("\n✅ All 8 customer gallery RLS policies are active.");
  } else {
    console.error("\n❌ Some policies are missing. Check the migration output.");
    process.exit(1);
  }
} else {
  console.error("Could not verify policies:", await verifyResp.text());
}
