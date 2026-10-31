import assert from "node:assert";
import fs from "node:fs";

console.log("==================================================================");
console.log("   NFCISTA: COMPANY INQUIRIES & GET QUOTE STORAGE VERIFICATION");
console.log("==================================================================");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
  }
}

// 1. Inspect API route implementation
const apiContent = fs.readFileSync("app/api/inquiries/route.js", "utf8");

runTest("API Route exists and enforces dynamic execution", () => {
  assert.ok(apiContent.includes('export const dynamic = "force-dynamic";'));
});

runTest("API Route includes honeypot bot trap (company_hp)", () => {
  assert.ok(apiContent.includes("company_hp"));
  assert.ok(apiContent.includes("[inquiry-honeypot] Bot submission trapped"));
});

runTest("API Route validates name (2 to 100 characters)", () => {
  assert.ok(apiContent.includes("rawName.length < 2 || rawName.length > 100"));
});

runTest("API Route validates phone number digits (7 to 20 digits)", () => {
  assert.ok(apiContent.includes("normalizeAndValidatePhone"));
  assert.ok(apiContent.includes("digits.length < 7 || digits.length > 20"));
});

runTest("API Route supports service-role client when key is configured", () => {
  assert.ok(apiContent.includes("SUPABASE_SERVICE_ROLE_KEY"));
  assert.ok(apiContent.includes("getServiceRoleClient"));
});

runTest("API Route supports atomic SECURITY DEFINER RPC submit_company_inquiry", () => {
  assert.ok(apiContent.includes("submit_company_inquiry"));
});

runTest("API Route avoids failing on RLS RETURNING/SELECT block when using anon client", () => {
  // Strategy 3 direct insert does not use .select("id").single()
  assert.ok(apiContent.includes('.from("company_inquiries")\n        .insert([insertPayload]);') ||
            apiContent.includes('.from("company_inquiries")\r\n        .insert([insertPayload]);'));
});

runTest("API Route preserves the exact email fallback on uninitialized storage", () => {
  assert.ok(
    apiContent.includes(
      "Inquiry storage is currently being initialized. Please email your inquiry to hellonfcista@gmail.com."
    )
  );
});

// 2. Inspect Migration file
const migrationContent = fs.readFileSync(
  "supabase/migrations/20261028000001_fix_company_inquiries_permissions_and_rpc.sql",
  "utf8"
);

runTest("Migration creates company_inquiries table if not exists with all columns", () => {
  assert.ok(migrationContent.includes("CREATE TABLE IF NOT EXISTS public.company_inquiries"));
  assert.ok(migrationContent.includes("product_interest TEXT"));
  assert.ok(migrationContent.includes("ip_hash TEXT"));
});

runTest("Migration explicitly grants INSERT to anon and authenticated roles", () => {
  assert.ok(migrationContent.includes("GRANT INSERT ON TABLE public.company_inquiries TO anon, authenticated;"));
});

runTest("Migration enables RLS and configures INSERT policy for public visitors", () => {
  assert.ok(migrationContent.includes("ALTER TABLE public.company_inquiries ENABLE ROW LEVEL SECURITY;"));
  assert.ok(migrationContent.includes('CREATE POLICY "Allow anonymous insert of company inquiries"'));
});

runTest("Migration creates submit_company_inquiry SECURITY DEFINER RPC", () => {
  assert.ok(migrationContent.includes("CREATE OR REPLACE FUNCTION public.submit_company_inquiry"));
  assert.ok(migrationContent.includes("SECURITY DEFINER"));
  assert.ok(migrationContent.includes("GRANT EXECUTE ON FUNCTION public.submit_company_inquiry"));
});

// 3. Inspect Form Component
const formContent = fs.readFileSync("components/home/InquiryForm.jsx", "utf8");

runTest("InquiryForm submits to /api/inquiries with JSON payload", () => {
  assert.ok(formContent.includes('fetch("/api/inquiries"'));
  assert.ok(formContent.includes('"Content-Type": "application/json"'));
});

runTest("InquiryForm displays success state only after verified submission", () => {
  assert.ok(formContent.includes('if (!res.ok || !data.success)'));
  assert.ok(formContent.includes('setStatus("success")'));
});

console.log("\n==================================================================");
console.log(`TEST RESULTS: ${passed} of ${total} tests PASSED.`);
if (passed === total) {
  console.log("STATUS: ALL TESTS PASSED PERFECTLY! ✅");
} else {
  console.error("STATUS: SOME TESTS FAILED! ❌");
  process.exit(1);
}
console.log("==================================================================");
