/**
 * Automated Verification Suite for X / Twitter & Google Drive Profile Links
 * Run with: node scripts/test-twitter-drive.mjs
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("=== NFCISTA X / Twitter & Google Drive Test Suite ===");

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
// Direct mirror of validation logic from lib/customers.js
// ---------------------------------------------------------------------------
function isValidTwitterUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return false;
  const trimmed = urlString.trim();
  if (!trimmed || trimmed.startsWith("//")) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    const isX = host === "x.com" || host.endsWith(".x.com");
    const isTwitter = host === "twitter.com" || host.endsWith(".twitter.com");
    return (isX || isTwitter) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

function getSafeTwitterUrl(input) {
  if (!input || typeof input !== "string") return null;
  let trimmed = input.trim();
  if (!trimmed || trimmed.startsWith("//")) return null;

  if (/^@?[a-zA-Z0-9_]{1,50}$/.test(trimmed)) {
    const cleanHandle = trimmed.replace(/^@/, "");
    return `https://x.com/${cleanHandle}`;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  if (!isValidTwitterUrl(trimmed)) {
    return null;
  }
  return trimmed;
}

function isValidGoogleDriveUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return false;
  const trimmed = urlString.trim();
  if (!trimmed || trimmed.startsWith("//")) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    const isDrive = host === "drive.google.com" || host.endsWith(".drive.google.com");
    const isDocs = host === "docs.google.com" || host.endsWith(".docs.google.com");
    return (isDrive || isDocs) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

function getSafeGoogleDriveUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return null;
  let trimmed = urlString.trim();
  if (!trimmed || trimmed.startsWith("//")) return null;

  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  if (!isValidGoogleDriveUrl(trimmed)) {
    return null;
  }
  return trimmed;
}

// ---------------------------------------------------------------------------
// 1. URL Validation Unit Tests: X / Twitter
// ---------------------------------------------------------------------------
console.log("\n[1] Testing X / Twitter URL Validation...");

test("Rejects null, undefined, non-string, empty, and whitespace inputs", () => {
  assert.strictEqual(isValidTwitterUrl(null), false);
  assert.strictEqual(isValidTwitterUrl(undefined), false);
  assert.strictEqual(isValidTwitterUrl(12345), false);
  assert.strictEqual(isValidTwitterUrl(""), false);
  assert.strictEqual(isValidTwitterUrl("   "), false);

  assert.strictEqual(getSafeTwitterUrl(null), null);
  assert.strictEqual(getSafeTwitterUrl(undefined), null);
  assert.strictEqual(getSafeTwitterUrl(""), null);
  assert.strictEqual(getSafeTwitterUrl("   "), null);
});

test("Rejects HTTP X/Twitter URLs (strictly HTTPS only)", () => {
  assert.strictEqual(isValidTwitterUrl("http://x.com/nfcista"), false);
  assert.strictEqual(isValidTwitterUrl("http://twitter.com/nfcista"), false);
  assert.strictEqual(getSafeTwitterUrl("http://x.com/nfcista"), null);
  assert.strictEqual(getSafeTwitterUrl("http://twitter.com/nfcista"), null);
});

test("Rejects dangerous URI schemes (javascript:, data:, file:, etc.)", () => {
  assert.strictEqual(isValidTwitterUrl("javascript:alert(1)"), false);
  assert.strictEqual(isValidTwitterUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="), false);
  assert.strictEqual(isValidTwitterUrl("file:///etc/passwd"), false);
  assert.strictEqual(isValidTwitterUrl("ftp://x.com/user"), false);

  assert.strictEqual(getSafeTwitterUrl("javascript:alert(1)"), null);
  assert.strictEqual(getSafeTwitterUrl("data:text/html,<script>"), null);
});

test("Rejects protocol-relative URLs (//...)", () => {
  assert.strictEqual(isValidTwitterUrl("//x.com/nfcista"), false);
  assert.strictEqual(isValidTwitterUrl("//twitter.com/nfcista"), false);
  assert.strictEqual(getSafeTwitterUrl("//x.com/nfcista"), null);
  assert.strictEqual(getSafeTwitterUrl("//twitter.com/nfcista"), null);
});

test("Rejects arbitrary non-X/Twitter domains", () => {
  assert.strictEqual(isValidTwitterUrl("https://evil.com/x.com"), false);
  assert.strictEqual(isValidTwitterUrl("https://instagram.com/nfcista"), false);
  assert.strictEqual(isValidTwitterUrl("https://facebook.com/nfcista"), false);
  assert.strictEqual(getSafeTwitterUrl("https://evil.com/x.com"), null);
  assert.strictEqual(getSafeTwitterUrl("https://fake-x.com/user"), null);
});

test("Accepts valid HTTPS x.com and twitter.com URLs", () => {
  assert.strictEqual(isValidTwitterUrl("https://x.com/nfcista"), true);
  assert.strictEqual(isValidTwitterUrl("https://www.x.com/nfcista"), true);
  assert.strictEqual(isValidTwitterUrl("https://twitter.com/nfcista"), true);
  assert.strictEqual(isValidTwitterUrl("https://www.twitter.com/nfcista"), true);
  assert.strictEqual(isValidTwitterUrl("https://mobile.twitter.com/nfcista"), true);

  assert.strictEqual(getSafeTwitterUrl("https://x.com/nfcista"), "https://x.com/nfcista");
  assert.strictEqual(getSafeTwitterUrl("https://twitter.com/nfcista"), "https://twitter.com/nfcista");
});

test("Supports handle-only inputs (@username or username) converting to https://x.com/username", () => {
  assert.strictEqual(getSafeTwitterUrl("@nfcista"), "https://x.com/nfcista");
  assert.strictEqual(getSafeTwitterUrl("nfcista"), "https://x.com/nfcista");
  assert.strictEqual(getSafeTwitterUrl("@john_doe_99"), "https://x.com/john_doe_99");
  assert.strictEqual(getSafeTwitterUrl("john_doe_99"), "https://x.com/john_doe_99");
});

test("Auto-prepends https:// if domain-only input entered", () => {
  assert.strictEqual(getSafeTwitterUrl("x.com/nfcista"), "https://x.com/nfcista");
  assert.strictEqual(getSafeTwitterUrl("twitter.com/nfcista"), "https://twitter.com/nfcista");
  assert.strictEqual(getSafeTwitterUrl("www.x.com/nfcista"), "https://www.x.com/nfcista");
});

// ---------------------------------------------------------------------------
// 2. URL Validation Unit Tests: Google Drive
// ---------------------------------------------------------------------------
console.log("\n[2] Testing Google Drive URL Validation...");

test("Rejects null, undefined, non-string, empty, and whitespace inputs", () => {
  assert.strictEqual(isValidGoogleDriveUrl(null), false);
  assert.strictEqual(isValidGoogleDriveUrl(undefined), false);
  assert.strictEqual(isValidGoogleDriveUrl(""), false);
  assert.strictEqual(isValidGoogleDriveUrl("   "), false);

  assert.strictEqual(getSafeGoogleDriveUrl(null), null);
  assert.strictEqual(getSafeGoogleDriveUrl(undefined), null);
  assert.strictEqual(getSafeGoogleDriveUrl(""), null);
});

test("Rejects HTTP Google Drive URLs (strictly HTTPS only)", () => {
  assert.strictEqual(isValidGoogleDriveUrl("http://drive.google.com/file/d/123/view"), false);
  assert.strictEqual(isValidGoogleDriveUrl("http://docs.google.com/document/d/123/edit"), false);
  assert.strictEqual(getSafeGoogleDriveUrl("http://drive.google.com/file/d/123/view"), null);
});

test("Rejects dangerous URI schemes (javascript:, data:, file:)", () => {
  assert.strictEqual(isValidGoogleDriveUrl("javascript:alert(1)"), false);
  assert.strictEqual(isValidGoogleDriveUrl("data:text/html,<script>"), false);
  assert.strictEqual(isValidGoogleDriveUrl("file:///etc/passwd"), false);
  assert.strictEqual(getSafeGoogleDriveUrl("javascript:alert(1)"), null);
});

test("Rejects protocol-relative URLs (//...)", () => {
  assert.strictEqual(isValidGoogleDriveUrl("//drive.google.com/file/d/123"), false);
  assert.strictEqual(getSafeGoogleDriveUrl("//drive.google.com/file/d/123"), null);
});

test("STRICTLY REJECTS goo.gl, Dropbox, OneDrive, and non-Google domains", () => {
  assert.strictEqual(isValidGoogleDriveUrl("https://goo.gl/abcd123"), false);
  assert.strictEqual(isValidGoogleDriveUrl("https://dropbox.com/s/abcd123/catalog.pdf"), false);
  assert.strictEqual(isValidGoogleDriveUrl("https://www.dropbox.com/s/abcd123"), false);
  assert.strictEqual(isValidGoogleDriveUrl("https://onedrive.live.com/view.aspx?cid=123"), false);
  assert.strictEqual(isValidGoogleDriveUrl("https://evil-phish.com/drive.google.com"), false);
  assert.strictEqual(isValidGoogleDriveUrl("https://google.com/search"), false);

  assert.strictEqual(getSafeGoogleDriveUrl("https://goo.gl/abcd123"), null);
  assert.strictEqual(getSafeGoogleDriveUrl("https://dropbox.com/s/abcd"), null);
  assert.strictEqual(getSafeGoogleDriveUrl("https://evil.com/drive.google.com"), null);
});

test("Accepts valid HTTPS drive.google.com and docs.google.com URLs", () => {
  assert.strictEqual(isValidGoogleDriveUrl("https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view"), true);
  assert.strictEqual(isValidGoogleDriveUrl("https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j?usp=sharing"), true);
  assert.strictEqual(isValidGoogleDriveUrl("https://docs.google.com/document/d/12345/edit?usp=sharing"), true);
  assert.strictEqual(isValidGoogleDriveUrl("https://docs.google.com/spreadsheets/d/67890/edit"), true);
  assert.strictEqual(isValidGoogleDriveUrl("https://docs.google.com/presentation/d/abcde/edit"), true);

  assert.strictEqual(
    getSafeGoogleDriveUrl("https://drive.google.com/file/d/123/view"),
    "https://drive.google.com/file/d/123/view"
  );
  assert.strictEqual(
    getSafeGoogleDriveUrl("https://docs.google.com/document/d/456/edit"),
    "https://docs.google.com/document/d/456/edit"
  );
});

test("Auto-prepends https:// if drive.google.com or docs.google.com entered without scheme", () => {
  assert.strictEqual(
    getSafeGoogleDriveUrl("drive.google.com/file/d/123/view"),
    "https://drive.google.com/file/d/123/view"
  );
  assert.strictEqual(
    getSafeGoogleDriveUrl("docs.google.com/document/d/456/edit"),
    "https://docs.google.com/document/d/456/edit"
  );
});

// ---------------------------------------------------------------------------
// 3. Migration Integrity
// ---------------------------------------------------------------------------
console.log("\n[3] Checking Migration Integrity...");

test("Migration file exists and defines twitter_url and drive_url columns with 20-column RPC update", () => {
  const migrationPath = path.join(
    rootDir,
    "supabase",
    "migrations",
    "20261019000000_add_twitter_drive_to_customers.sql"
  );
  assert(fs.existsSync(migrationPath), "Migration file must exist");
  const sql = fs.readFileSync(migrationPath, "utf-8");

  assert(sql.includes("ALTER TABLE public.customers"), "Must alter customers table");
  assert(sql.includes("ADD COLUMN IF NOT EXISTS twitter_url TEXT DEFAULT NULL;"), "Must add twitter_url column");
  assert(sql.includes("ADD COLUMN IF NOT EXISTS drive_url TEXT DEFAULT NULL;"), "Must add drive_url column");
  assert(sql.includes("DROP FUNCTION IF EXISTS public.get_customer_by_slug(text);"), "Must safely drop existing RPC");
  assert(sql.includes("CREATE FUNCTION public.get_customer_by_slug"), "Must recreate get_customer_by_slug");
  assert(sql.includes("twitter_url       TEXT"), "RPC return table must include twitter_url");
  assert(sql.includes("drive_url         TEXT"), "RPC return table must include drive_url");
  assert(sql.includes("c.twitter_url,"), "RPC SELECT must include c.twitter_url");
  assert(sql.includes("c.drive_url"), "RPC SELECT must include c.drive_url");
  assert(sql.includes("SECURITY DEFINER"), "Must retain SECURITY DEFINER");
  assert(sql.includes("SET search_path = public"), "Must retain SET search_path = public");
  assert(sql.includes("GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;"), "Must grant execute");

  const codeWithoutComments = sql.replace(/--.*$/gm, "");
  assert(!/\bCASCADE\b/i.test(codeWithoutComments), "Must NOT use CASCADE");
});

// ---------------------------------------------------------------------------
// 4. Static Code Audit
// ---------------------------------------------------------------------------
console.log("\n[4] Auditing Code Files...");

test("lib/customers.js exports validation functions and includes fields in CRUD", () => {
  const filePath = path.join(rootDir, "lib", "customers.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("export function isValidTwitterUrl"), "Must export isValidTwitterUrl");
  assert(code.includes("export function getSafeTwitterUrl"), "Must export getSafeTwitterUrl");
  assert(code.includes("export function isValidGoogleDriveUrl"), "Must export isValidGoogleDriveUrl");
  assert(code.includes("export function getSafeGoogleDriveUrl"), "Must export getSafeGoogleDriveUrl");
  assert(code.includes("twitter_url:"), "Must map twitter_url");
  assert(code.includes("drive_url:"), "Must map drive_url");
  assert(code.includes("twitter_url: null"), "demo customer must include twitter_url: null");
  assert(code.includes("drive_url: null"), "demo customer must include drive_url: null");
});

test("app/api/customer/profile/route.js validates and saves twitter_url and drive_url", () => {
  const filePath = path.join(rootDir, "app", "api", "customer", "profile", "route.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("getSafeTwitterUrl"), "Must import getSafeTwitterUrl");
  assert(code.includes("getSafeGoogleDriveUrl"), "Must import getSafeGoogleDriveUrl");
  assert(code.includes("body.twitter_url"), "Must process twitter_url");
  assert(code.includes("body.drive_url"), "Must process drive_url");
  assert(code.includes("updates.twitter_url = safeTwitter"), "Must assign safeTwitter");
  assert(code.includes("updates.drive_url = safeDrive"), "Must assign safeDrive");
  assert(code.includes("status: 400"), "Must return 400 on invalid URL");
  assert(code.includes(".eq(\"id\", customer.id)"), "Must scope update to verified customer id");
  assert(code.includes(".eq(\"auth_user_id\", user.id)"), "Must scope update to session user id");
});

test("components/profile/ProfileIcon.jsx includes SVG paths for x, twitter, google_drive, and drive", () => {
  const filePath = path.join(rootDir, "components", "profile", "ProfileIcon.jsx");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("\"x\":"), "Must have x icon");
  assert(code.includes("\"twitter\":"), "Must have twitter icon");
  assert(code.includes("\"google_drive\":"), "Must have google_drive icon");
  assert(code.includes("\"drive\":"), "Must have drive icon");
});

test("app/p/[slug]/page.js safely renders X and Google Drive with direct external link behavior", () => {
  const filePath = path.join(rootDir, "app", "p", "[slug]", "page.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("getSafeTwitterUrl"), "Must import getSafeTwitterUrl");
  assert(code.includes("getSafeGoogleDriveUrl"), "Must import getSafeGoogleDriveUrl");
  assert(code.includes("customer.twitter_url"), "Must read customer.twitter_url");
  assert(code.includes("customer.drive_url"), "Must read customer.drive_url");
  assert(code.includes("id: \"qc-x\""), "Must support X in Quick Connect");
  assert(code.includes("id: \"qc-drive\""), "Must support Drive in Quick Connect");
  assert(code.includes("id: \"pl-x\""), "Must support X in Presence Links");
  assert(code.includes("id: \"pl-drive\""), "Must support Drive in Presence Links");
  assert(code.includes("target=\"_blank\""), "Must use target=\"_blank\"");
  assert(code.includes("rel=\"noopener noreferrer\""), "Must use rel=\"noopener noreferrer\"");
  assert(!code.includes("dangerouslySetInnerHTML"), "Must never use dangerouslySetInnerHTML");
});

test("app/dashboard/profile/page.js includes X/Twitter and Google Drive fields", () => {
  const filePath = path.join(rootDir, "app", "dashboard", "profile", "page.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("twitter_url:"), "formData must include twitter_url");
  assert(code.includes("drive_url:"), "formData must include drive_url");
  assert(code.includes("X / Twitter URL"), "Must have X / Twitter URL input label");
  assert(code.includes("Google Drive URL"), "Must have Google Drive URL input label");
});

test("app/dashboard/page.js displays overview tiles for X/Twitter and Google Drive", () => {
  const filePath = path.join(rootDir, "app", "dashboard", "page.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("X / Twitter"), "Must display X / Twitter tile");
  assert(code.includes("Google Drive"), "Must display Google Drive tile");
  assert(code.includes("customer.twitter_url"), "Must read customer.twitter_url");
  assert(code.includes("customer.drive_url"), "Must read customer.drive_url");
});

test("app/admin/page.js supports X/Twitter and Google Drive editing and validation", () => {
  const filePath = path.join(rootDir, "app", "admin", "page.js");
  const code = fs.readFileSync(filePath, "utf-8");

  assert(code.includes("getSafeTwitterUrl"), "Must import getSafeTwitterUrl");
  assert(code.includes("getSafeGoogleDriveUrl"), "Must import getSafeGoogleDriveUrl");
  assert(code.includes("twitter_url: \"\""), "initialFormData must include twitter_url");
  assert(code.includes("drive_url: \"\""), "initialFormData must include drive_url");
  assert(code.includes("X / Twitter URL"), "Must have X / Twitter label");
  assert(code.includes("Google Drive URL"), "Must have Google Drive label");
});

// ---------------------------------------------------------------------------
// 5. Multi-Tenant & Security Verification
// ---------------------------------------------------------------------------
console.log("\n[5] Auditing Multi-Tenant & Security Constraints...");

test("Customer API strictly binds to verified session (blocks cross-customer mutation)", () => {
  const filePath = path.join(rootDir, "app", "api", "customer", "profile", "route.js");
  const code = fs.readFileSync(filePath, "utf-8");

  // Verify that authenticateCustomer is called first
  assert(code.includes("const { errorResponse, user, customer, authClient } = await authenticateCustomer(request);"));
  // Verify that customer.id and user.id from session are enforced
  assert(code.includes(".eq(\"id\", customer.id)"));
  assert(code.includes(".eq(\"auth_user_id\", user.id)"));
  // Verify client-supplied IDs are never used in update
  assert(!code.includes(".eq(\"id\", body.id)"));
  assert(!code.includes(".eq(\"auth_user_id\", body.auth_user_id)"));
});

test("Preservation of Facebook & LinkedIn permissions and validation", () => {
  const filePath = path.join(rootDir, "app", "api", "customer", "profile", "route.js");
  const code = fs.readFileSync(filePath, "utf-8");
  assert(code.includes("updates.facebook_url = safeFb"));
  assert(code.includes("updates.linkedin_url = safeLi"));
});

test("Preservation of Custom Profile Banner permissions and endpoints", () => {
  const bannerRoutePath = path.join(rootDir, "app", "api", "customer", "banner", "route.js");
  assert(fs.existsSync(bannerRoutePath), "Banner route must remain intact");
  const code = fs.readFileSync(bannerRoutePath, "utf-8");
  assert(code.includes("authenticateCustomer(request)"), "Banner route must authenticate customer");
});

test("Preservation of Profile Photo permissions and endpoints", () => {
  const photoRoutePath = path.join(rootDir, "app", "api", "customer", "photo", "route.js");
  assert(fs.existsSync(photoRoutePath), "Photo route must remain intact");
  const code = fs.readFileSync(photoRoutePath, "utf-8");
  assert(code.includes("authenticateCustomer(request)"), "Photo route must authenticate customer");
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log("\n=== Test Results Summary ===");
console.log(`Passed: ${passedTests} / ${totalTests}`);
if (passedTests === totalTests) {
  console.log("All X / Twitter & Google Drive tests passed successfully! ✅");
} else {
  console.error("Some tests failed! ❌");
  process.exit(1);
}
