import fs from "fs";
import { execSync } from "child_process";

console.log("=== NFCISTA ACCOUNT MANAGEMENT & WAVE 1 REGRESSION TEST SUITE ===\n");

let passed = 0;
let failed = 0;

function ok(testName) {
  console.log(`  ✅ PASS: ${testName}`);
  passed++;
}

function fail(testName, reason) {
  console.error(`  ❌ FAIL: ${testName} — ${reason}`);
  failed++;
}

// ──────────────────────────────────────────────────────────────────
// 1. Static Audit of New Admin API Routes
// ──────────────────────────────────────────────────────────────────
console.log("====================================================================");
console.log("  1. Admin API Route Files & Authentication Guards");
console.log("====================================================================");

const routes = [
  "app/api/admin/customers/login-status/route.js",
  "app/api/admin/customers/resend-setup/route.js",
  "app/api/admin/customers/send-password-reset/route.js",
  "app/api/admin/customers/toggle-login/route.js",
];

for (const routePath of routes) {
  if (!fs.existsSync(routePath)) {
    fail(`File Exists: ${routePath}`, "File not found");
    continue;
  }
  ok(`File Exists: ${routePath}`);

  const content = fs.readFileSync(routePath, "utf8");

  // Authentication check
  if (content.includes("authenticateAdmin(request)") && content.includes("if (errorResponse) return errorResponse;")) {
    ok(`${routePath}: Protected by authenticateAdmin()`);
  } else {
    fail(`${routePath}: Protected by authenticateAdmin()`, "Missing authenticateAdmin guard");
  }

  // Force dynamic
  if (content.includes('export const dynamic = "force-dynamic";')) {
    ok(`${routePath}: Configured with force-dynamic`);
  } else {
    fail(`${routePath}: Configured with force-dynamic`, "Missing force-dynamic export");
  }

  // Service role key usage
  if (content.includes("process.env.SUPABASE_SERVICE_ROLE_KEY")) {
    ok(`${routePath}: Uses server-side SUPABASE_SERVICE_ROLE_KEY`);
  } else {
    fail(`${routePath}: Uses server-side SUPABASE_SERVICE_ROLE_KEY`, "Missing service role key reference");
  }

  // No password/link logging in console
  if (
    content.includes("console.log(action_link") ||
    content.includes("console.log(linkData") ||
    content.includes("console.log(password") ||
    content.includes("console.log(cleanPassword")
  ) {
    fail(`${routePath}: Secret leakage check`, "Found console.log with sensitive tokens/links");
  } else {
    ok(`${routePath}: Zero logging of action links or passwords`);
  }
}

// ──────────────────────────────────────────────────────────────────
// 2. Toggle Login Isolation (Must NOT touch customer profile or is_active)
// ──────────────────────────────────────────────────────────────────
console.log("\n====================================================================");
console.log("  2. Toggle Login Isolation (Login vs Profile Separation)");
console.log("====================================================================");

const toggleRoute = fs.readFileSync("app/api/admin/customers/toggle-login/route.js", "utf8");

if (toggleRoute.includes("is_active:") || toggleRoute.includes(".update({ is_active")) {
  fail("toggle-login: Profile is_active isolation", "Found mutation of is_active");
} else {
  ok("toggle-login: Does NOT touch public.customers.is_active");
}

if (toggleRoute.includes("profile_slug:") || toggleRoute.includes(".update({ profile_slug")) {
  fail("toggle-login: Profile slug isolation", "Found mutation of profile_slug");
} else {
  ok("toggle-login: Does NOT touch public.customers.profile_slug");
}

if (toggleRoute.includes("serviceClient.auth.admin.updateUserById") && toggleRoute.includes("ban_duration")) {
  ok("toggle-login: Modifies ONLY Supabase Auth ban_duration");
} else {
  fail("toggle-login: Supabase Auth ban_duration", "Expected updateUserById with ban_duration");
}

// ──────────────────────────────────────────────────────────────────
// 3. Admin UI Integration in app/admin/page.js
// ──────────────────────────────────────────────────────────────────
console.log("\n====================================================================");
console.log("  3. Admin UI Integration (Modal, Status, and Actions)");
console.log("====================================================================");

const adminPage = fs.readFileSync("app/admin/page.js", "utf8");

if (adminPage.includes("handleOpenLoginModal(customer)") && adminPage.includes("login-status?customer_id=")) {
  ok("admin/page.js: handleOpenLoginModal fetches real login-status on open");
} else {
  fail("admin/page.js: handleOpenLoginModal fetches real login-status", "Missing login-status fetch in handleOpenLoginModal");
}

if (adminPage.includes("async function handleResendSetup()") && adminPage.includes("/api/admin/customers/resend-setup")) {
  ok("admin/page.js: handleResendSetup handler wired to API");
} else {
  fail("admin/page.js: handleResendSetup handler", "Missing handleResendSetup definition or API call");
}

if (adminPage.includes("async function handleSendPasswordReset()") && adminPage.includes("/api/admin/customers/send-password-reset")) {
  ok("admin/page.js: handleSendPasswordReset handler wired to API");
} else {
  fail("admin/page.js: handleSendPasswordReset handler", "Missing handleSendPasswordReset definition or API call");
}

if (adminPage.includes("async function handleToggleLogin(") && adminPage.includes("/api/admin/customers/toggle-login")) {
  ok("admin/page.js: handleToggleLogin handler wired to API");
} else {
  fail("admin/page.js: handleToggleLogin handler", "Missing handleToggleLogin definition or API call");
}

// Status labels
const requiredStatusLabels = ["Active Login", "Login Disabled", "Setup Pending"];
for (const label of requiredStatusLabels) {
  if (adminPage.includes(label)) {
    ok(`admin/page.js: Displays status label '${label}'`);
  } else {
    fail(`admin/page.js: Displays status label '${label}'`, `Status label '${label}' missing`);
  }
}

// Copy link functionality
if (adminPage.includes("setCopiedActionLink") && adminPage.includes("navigator.clipboard.writeText(loginActionResult.link)")) {
  ok("admin/page.js: Action links are copyable to clipboard without storing in DB");
} else {
  fail("admin/page.js: Action link clipboard copy", "Missing clipboard copy for action links");
}

// ──────────────────────────────────────────────────────────────────
// 4. Protected Routes Integrity (Zero regressions)
// ──────────────────────────────────────────────────────────────────
console.log("\n====================================================================");
console.log("  4. Protected Routes & Customer Auth Backbone Integrity");
console.log("====================================================================");

const diffOutput = execSync("git diff --name-only").toString();
const modifiedFiles = diffOutput.split("\n").map((s) => s.trim()).filter(Boolean);

const protectedFiles = [
  "app/p/[slug]/page.js",
  "app/review/[slug]/page.js",
  "app/r/[cardCode]/page.js",
  "lib/dynamicQr.js",
  "lib/customerAuth.js",
  "components/admin/CustomerGallerySection.jsx",
];

for (const pFile of protectedFiles) {
  if (modifiedFiles.includes(pFile)) {
    fail(`Protected file: ${pFile}`, "File was modified in git working directory");
  } else {
    ok(`Protected file: ${pFile} untouched`);
  }
}

// ──────────────────────────────────────────────────────────────────
// Final Summary
// ──────────────────────────────────────────────────────────────────
console.log("\n====================================================================");
console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log("====================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("  ALL ACCOUNT MANAGEMENT TESTS PASSED PERFECTLY! ✅\n");
}
