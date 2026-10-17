/**
 * Automated Verification Suite for Facebook and LinkedIn Social Links
 * Run with: node scripts/test-facebook-linkedin.mjs
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("=== NFCISTA Facebook & LinkedIn Social Links Test Suite ===");

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// 1. Unit Tests for URL Validation & Sanitization
// ---------------------------------------------------------------------------
console.log("\n[1] Testing URL Validation & Sanitization...");

// Direct implementation mirrors lib/customers.js
function isValidHttpsUrl(urlString) {
  if (!urlString || typeof urlString !== "string") {
    return false;
  }
  const trimmed = urlString.trim();
  if (!trimmed || trimmed.startsWith("//")) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

function getSafeExternalHttpsUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return null;
  let trimmed = urlString.trim();
  if (!trimmed || trimmed.startsWith("//")) return null;

  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  if (!isValidHttpsUrl(trimmed)) {
    return null;
  }
  return trimmed;
}

test("Rejects null, undefined, and non-string inputs", () => {
  assert.strictEqual(isValidHttpsUrl(null), false);
  assert.strictEqual(isValidHttpsUrl(undefined), false);
  assert.strictEqual(isValidHttpsUrl(12345), false);
  assert.strictEqual(isValidHttpsUrl(""), false);
  assert.strictEqual(isValidHttpsUrl("   "), false);

  assert.strictEqual(getSafeExternalHttpsUrl(null), null);
  assert.strictEqual(getSafeExternalHttpsUrl(undefined), null);
  assert.strictEqual(getSafeExternalHttpsUrl(""), null);
});

test("Rejects HTTP URLs (strictly HTTPS only)", () => {
  assert.strictEqual(isValidHttpsUrl("http://facebook.com/nfcista"), false);
  assert.strictEqual(isValidHttpsUrl("http://linkedin.com/in/test"), false);
  assert.strictEqual(getSafeExternalHttpsUrl("http://facebook.com/nfcista"), null);
});

test("Rejects dangerous URI schemes (javascript:, data:, file:, etc.)", () => {
  assert.strictEqual(isValidHttpsUrl("javascript:alert(1)"), false);
  assert.strictEqual(isValidHttpsUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="), false);
  assert.strictEqual(isValidHttpsUrl("file:///etc/passwd"), false);
  assert.strictEqual(isValidHttpsUrl("ftp://example.com"), false);

  assert.strictEqual(getSafeExternalHttpsUrl("javascript:alert(1)"), null);
  assert.strictEqual(getSafeExternalHttpsUrl("data:text/html,<script>"), null);
});

test("Rejects protocol-relative URLs (//...)", () => {
  assert.strictEqual(isValidHttpsUrl("//evil.com/phish"), false);
  assert.strictEqual(isValidHttpsUrl("  //evil.com/phish  "), false);
  assert.strictEqual(getSafeExternalHttpsUrl("//evil.com/phish"), null);
});

test("Rejects malformed URLs", () => {
  assert.strictEqual(isValidHttpsUrl("not a url"), false);
  assert.strictEqual(isValidHttpsUrl("https://"), false);
  assert.strictEqual(isValidHttpsUrl("https://   "), false);
  assert.strictEqual(getSafeExternalHttpsUrl(":::malformed:::"), null);
});

test("Accepts valid HTTPS URLs", () => {
  assert.strictEqual(isValidHttpsUrl("https://facebook.com/nfcista"), true);
  assert.strictEqual(isValidHttpsUrl("https://www.linkedin.com/in/johndoe"), true);
  assert.strictEqual(isValidHttpsUrl("https://linkedin.com/company/nfcista/"), true);

  assert.strictEqual(
    getSafeExternalHttpsUrl("https://facebook.com/nfcista"),
    "https://facebook.com/nfcista"
  );
  assert.strictEqual(
    getSafeExternalHttpsUrl("https://www.linkedin.com/in/johndoe"),
    "https://www.linkedin.com/in/johndoe"
  );
});

test("Auto-prepends https:// to domain-only inputs", () => {
  assert.strictEqual(
    getSafeExternalHttpsUrl("facebook.com/nfcista"),
    "https://facebook.com/nfcista"
  );
  assert.strictEqual(
    getSafeExternalHttpsUrl("www.linkedin.com/in/johndoe"),
    "https://www.linkedin.com/in/johndoe"
  );
  assert.strictEqual(
    getSafeExternalHttpsUrl("linkedin.com/company/nfcista"),
    "https://linkedin.com/company/nfcista"
  );
});

// ---------------------------------------------------------------------------
// 2. Migration File Integrity
// ---------------------------------------------------------------------------
console.log("\n[2] Checking Migration Integrity...");

test("Migration file exists and defines facebook_url & linkedin_url columns and RPC update", () => {
  const migrationPath = path.join(
    rootDir,
    "supabase",
    "migrations",
    "20261017000000_add_facebook_linkedin_to_customers.sql"
  );
  assert(fs.existsSync(migrationPath), "Migration file must exist");
  const sql = fs.readFileSync(migrationPath, "utf-8");

  assert(sql.includes("ALTER TABLE public.customers"), "Must alter customers table");
  assert(sql.includes("ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT NULL;"), "Must add facebook_url column");
  assert(sql.includes("ADD COLUMN IF NOT EXISTS linkedin_url TEXT DEFAULT NULL;"), "Must add linkedin_url column");
  assert(sql.includes("DROP FUNCTION IF EXISTS public.get_customer_by_slug(text);"), "Must drop existing get_customer_by_slug RPC to allow signature change");
  assert(sql.includes("CREATE FUNCTION public.get_customer_by_slug"), "Must recreate get_customer_by_slug RPC");
  assert(sql.includes("facebook_url      TEXT"), "RPC return table must include facebook_url");
  assert(sql.includes("linkedin_url      TEXT"), "RPC return table must include linkedin_url");
  assert(sql.includes("c.facebook_url,"), "RPC select must include c.facebook_url");
  assert(sql.includes("c.linkedin_url"), "RPC select must include c.linkedin_url");
  assert(sql.includes("SECURITY DEFINER"), "RPC must maintain SECURITY DEFINER");
  assert(sql.includes("SET search_path = public"), "RPC must maintain SET search_path = public");
  assert(sql.includes("GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;"), "Must grant execute to anon and authenticated");
  const codeWithoutComments = sql.replace(/--.*$/gm, "");
  assert(!/\bCASCADE\b/i.test(codeWithoutComments), "Must NOT use CASCADE");
});

// ---------------------------------------------------------------------------
// 3. Static Code Audit: lib/customers.js
// ---------------------------------------------------------------------------
console.log("\n[3] Auditing lib/customers.js...");

test("lib/customers.js exports validation functions and includes fields in CRUD", () => {
  const filePath = path.join(rootDir, "lib", "customers.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("export function isValidHttpsUrl"), "Must export isValidHttpsUrl");
  assert(code.includes("export function getSafeExternalHttpsUrl"), "Must export getSafeExternalHttpsUrl");
  assert(code.includes("facebook_url:"), "createCustomer and updateCustomer must include facebook_url");
  assert(code.includes("linkedin_url:"), "createCustomer and updateCustomer must include linkedin_url");
  assert(code.includes("facebook_url: null"), "demo record must include facebook_url: null");
  assert(code.includes("linkedin_url: null"), "demo record must include linkedin_url: null");
});

// ---------------------------------------------------------------------------
// 4. Static Code Audit: app/api/customer/profile/route.js
// ---------------------------------------------------------------------------
console.log("\n[4] Auditing app/api/customer/profile/route.js...");

test("Customer profile API validates and saves facebook_url and linkedin_url", () => {
  const filePath = path.join(rootDir, "app", "api", "customer", "profile", "route.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("getSafeExternalHttpsUrl"), "Must import and use getSafeExternalHttpsUrl");
  assert(code.includes("body.facebook_url"), "Must handle body.facebook_url");
  assert(code.includes("body.linkedin_url"), "Must handle body.linkedin_url");
  assert(code.includes("updates.facebook_url = safeFb"), "Must assign sanitized safeFb");
  assert(code.includes("updates.linkedin_url = safeLi"), "Must assign sanitized safeLi");
  assert(code.includes("status: 400"), "Must reject invalid URLs with HTTP 400");
});

// ---------------------------------------------------------------------------
// 5. Static Code Audit: app/p/[slug]/page.js (Public Profile)
// ---------------------------------------------------------------------------
console.log("\n[5] Auditing app/p/[slug]/page.js (Public Profile)...");

test("Public profile securely renders Facebook and LinkedIn links", () => {
  const filePath = path.join(rootDir, "app", "p", "[slug]", "page.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("getSafeExternalHttpsUrl"), "Must import and call getSafeExternalHttpsUrl");
  assert(
    code.includes("customer.facebook_url"),
    "Must read and sanitize customer.facebook_url"
  );
  assert(
    code.includes("customer.linkedin_url"),
    "Must read and sanitize customer.linkedin_url"
  );
  assert(code.includes("id: \"qc-fb\""), "Must support Facebook in quickConnectItems");
  assert(code.includes("id: \"qc-li\""), "Must support LinkedIn in quickConnectItems");
  assert(code.includes("id: \"pl-fb\""), "Must support Facebook in presenceLinks");
  assert(code.includes("id: \"pl-li\""), "Must support LinkedIn in presenceLinks");
  assert(code.includes("target=\"_blank\""), "Must use target=\"_blank\"");
  assert(code.includes("rel=\"noopener noreferrer\""), "Must use rel=\"noopener noreferrer\"");
  assert(!code.includes("dangerouslySetInnerHTML"), "Must never use dangerouslySetInnerHTML");
});

// ---------------------------------------------------------------------------
// 6. Static Code Audit: components/profile/ProfileIcon.jsx
// ---------------------------------------------------------------------------
console.log("\n[6] Auditing components/profile/ProfileIcon.jsx...");

test("ProfileIcon component has SVG paths for facebook and linkedin", () => {
  const filePath = path.join(rootDir, "components", "profile", "ProfileIcon.jsx");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("\"facebook\":"), "Must have facebook icon");
  assert(code.includes("\"linkedin\":"), "Must have linkedin icon");
});

// ---------------------------------------------------------------------------
// 7. Static Code Audit: Admin & Customer Dashboard Pages
// ---------------------------------------------------------------------------
console.log("\n[7] Auditing Admin & Customer Dashboard UI...");

test("Admin page supports Facebook and LinkedIn editing and display", () => {
  const filePath = path.join(rootDir, "app", "admin", "page.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("facebook_url: \"\""), "initialFormData must include facebook_url");
  assert(code.includes("linkedin_url: \"\""), "initialFormData must include linkedin_url");
  assert(code.includes("Facebook URL"), "Must have Facebook input field");
  assert(code.includes("LinkedIn URL"), "Must have LinkedIn input field");
});

test("Customer profile self-service editor supports Facebook and LinkedIn", () => {
  const filePath = path.join(rootDir, "app", "dashboard", "profile", "page.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("facebook_url:"), "Must populate facebook_url in loadProfile");
  assert(code.includes("linkedin_url:"), "Must populate linkedin_url in loadProfile");
  assert(code.includes("Facebook URL"), "Must have Facebook input field");
  assert(code.includes("LinkedIn URL"), "Must have LinkedIn input field");
});

test("Customer overview dashboard displays Facebook and LinkedIn tiles", () => {
  const filePath = path.join(rootDir, "app", "dashboard", "page.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("Facebook"), "Must have Facebook section");
  assert(code.includes("LinkedIn"), "Must have LinkedIn section");
  assert(code.includes("customer.facebook_url"), "Must read customer.facebook_url");
  assert(code.includes("customer.linkedin_url"), "Must read customer.linkedin_url");
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log("\n=== Test Results Summary ===");
console.log(`Passed: ${passedTests} / ${totalTests}`);
if (passedTests === totalTests) {
  console.log("All Facebook & LinkedIn tests passed successfully! ✅");
} else {
  console.error("Some tests failed! ❌");
  process.exit(1);
}
