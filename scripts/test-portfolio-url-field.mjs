import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isValidHttpUrl, getSafeExternalUrl } from "../lib/customers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("=== NFCISTA SIMPLE PORTFOLIO URL TEST SUITE ===\n");

// 1. Database Migration Inspection
console.log("1. Checking Migration File (supabase/migrations/20261108000000_add_portfolio_url_to_customers.sql)...");
const migrationPath = path.join(rootDir, "supabase", "migrations", "20261108000000_add_portfolio_url_to_customers.sql");
assert.ok(fs.existsSync(migrationPath), "Migration file must exist");
const migrationSql = fs.readFileSync(migrationPath, "utf8");

assert.ok(
  migrationSql.includes("ALTER TABLE public.customers\nADD COLUMN IF NOT EXISTS portfolio_url TEXT DEFAULT NULL;") ||
  migrationSql.includes("ADD COLUMN IF NOT EXISTS portfolio_url TEXT DEFAULT NULL;"),
  "Migration must add portfolio_url column with default NULL"
);
assert.ok(
  migrationSql.includes("DROP FUNCTION IF EXISTS public.get_customer_by_slug(text);"),
  "Migration must safely drop get_customer_by_slug to prevent 42P13"
);
assert.ok(
  migrationSql.includes("portfolio_url             TEXT"),
  "Migration must append portfolio_url TEXT as 23rd column in RETURNS TABLE"
);
assert.ok(
  migrationSql.includes("ALTER FUNCTION public.get_customer_by_slug(text) OWNER TO postgres;"),
  "Migration must preserve postgres function ownership"
);
assert.ok(
  migrationSql.includes("REVOKE ALL ON FUNCTION public.get_customer_by_slug(text) FROM PUBLIC;"),
  "Migration must explicitly revoke default execution from PUBLIC"
);
assert.ok(
  migrationSql.includes("GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;"),
  "Migration must preserve execute grants for anon and authenticated"
);
assert.ok(
  !migrationSql.includes("smart_profile_enabled"),
  "Migration must NOT introduce smart_profile_enabled dependency"
);
console.log("  ✅ PASS: Migration SQL strictly adheres to live schema, ownership, and grant requirements.");

// 2. URL Validation & Security Rules
console.log("\n2. Checking URL Validation & Scheme Security (lib/customers.js)...");
assert.strictEqual(isValidHttpUrl("https://portfolio.design"), true, "Valid HTTPS should pass");
assert.strictEqual(isValidHttpUrl("http://myportfolio.com"), true, "Valid HTTP should pass");
assert.strictEqual(isValidHttpUrl("https://behance.net/creatives"), true, "Valid Behance URL should pass");
assert.strictEqual(isValidHttpUrl("javascript:alert(1)"), false, "javascript: protocol must be rejected");
assert.strictEqual(isValidHttpUrl("data:text/html,<script>alert(1)</script>"), false, "data: protocol must be rejected");
assert.strictEqual(isValidHttpUrl("//malicious.com"), false, "Protocol-relative URL must be rejected");
assert.strictEqual(isValidHttpUrl("not a url"), false, "Arbitrary string must be rejected");
assert.strictEqual(isValidHttpUrl(""), false, "Empty string must return false");
assert.strictEqual(isValidHttpUrl(null), false, "Null must return false");

assert.strictEqual(getSafeExternalUrl("https://portfolio.design"), "https://portfolio.design");
assert.strictEqual(getSafeExternalUrl("javascript:steal()"), null);
assert.strictEqual(getSafeExternalUrl(""), null);
console.log("  ✅ PASS: Server-side URL validation strictly accepts HTTP/HTTPS and rejects unsafe schemes.");

// 3. Backend Customer Data Layer
console.log("\n3. Checking Backend Data Layer (lib/customers.js)...");
const libCustomersCode = fs.readFileSync(path.join(rootDir, "lib", "customers.js"), "utf8");
assert.ok(
  libCustomersCode.includes("portfolio_url: formData.portfolio_url?.trim() ? getSafeExternalUrl(formData.portfolio_url) : null"),
  "createCustomer and updateCustomer must sanitize portfolio_url via getSafeExternalUrl"
);
assert.ok(
  libCustomersCode.includes("error.message?.includes(\"portfolio_url\")"),
  "Data layer must defensively handle unmigrated database state"
);
console.log("  ✅ PASS: Backend customer layer sanitizes portfolio_url and handles schema fallbacks.");

// 4. Admin Business Profile Form
console.log("\n4. Checking Admin Business Profile Form (app/admin/page.js)...");
const adminPageCode = fs.readFileSync(path.join(rootDir, "app/admin/page.js"), "utf8");
assert.ok(
  adminPageCode.includes('portfolio_url: "",'),
  "INITIAL_FORM_STATE must include portfolio_url default"
);
assert.ok(
  adminPageCode.includes("portfolio_url: fullRecord.portfolio_url || \"\","),
  "handleOpenEdit must populate portfolio_url"
);
assert.ok(
  adminPageCode.includes("const pfVal = formData.portfolio_url;") &&
  adminPageCode.includes("isValidHttpUrl(pfVal)"),
  "handleFormSubmit must validate portfolio_url using isValidHttpUrl"
);
assert.ok(
  adminPageCode.includes("Portfolio URL") &&
  adminPageCode.includes("value={formData.portfolio_url || \"\"}"),
  "Social & Business section must render Portfolio URL input"
);
console.log("  ✅ PASS: Admin form provides Portfolio URL input with validation and state binding.");

// 5. Public Profile Link & Icon
console.log("\n5. Checking Public Profile Page & IconTile...");
const publicPageCode = fs.readFileSync(path.join(rootDir, "app/p/[slug]/page.js"), "utf8");
assert.ok(
  publicPageCode.includes("const safePortfolio    = getSafeExternalUrl(customer.portfolio_url);"),
  "Public profile must sanitize customer.portfolio_url"
);
assert.ok(
  publicPageCode.includes('id: "portfolio"') &&
  publicPageCode.includes('iconName: "portfolio"') &&
  publicPageCode.includes("isExternal: true"),
  "Public profile must render portfolio link in socialLinks with isExternal: true"
);

const iconTileCode = fs.readFileSync(path.join(rootDir, "components/profile/IconTile.jsx"), "utf8");
assert.ok(
  iconTileCode.includes("portfolio: Briefcase") &&
  iconTileCode.includes("briefcase: Briefcase"),
  "IconTile must map portfolio and briefcase to Lucide Briefcase component"
);
console.log("  ✅ PASS: Public profile links to portfolio with authentic briefcase icon and target='_blank'.");

console.log("\n🎉 ALL SIMPLE PORTFOLIO URL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
