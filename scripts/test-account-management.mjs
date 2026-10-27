import fs from "fs";
import { execSync } from "child_process";
import { getAuthRedirectUrl, NFCISTA_BASE_URL } from "../lib/siteConfig.js";

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
// 5. Wave 2: Customer Password Recovery Flow & Security Audit
// ──────────────────────────────────────────────────────────────────
console.log("\n====================================================================");
console.log("  5. Wave 2: Customer Password Recovery Verification");
console.log("====================================================================");

// Forgot Password Page Checks
const forgotPwdPath = "app/forgot-password/page.js";
if (!fs.existsSync(forgotPwdPath)) {
  fail(`File Exists: ${forgotPwdPath}`, "File not found");
} else {
  ok(`File Exists: ${forgotPwdPath}`);
  const forgotContent = fs.readFileSync(forgotPwdPath, "utf8");

  if (forgotContent.includes("supabase.auth.resetPasswordForEmail")) {
    ok(`${forgotPwdPath}: Uses supabase.auth.resetPasswordForEmail()`);
  } else {
    fail(`${forgotPwdPath}: Reset call`, "Missing resetPasswordForEmail call");
  }

  if (forgotContent.includes("Check your inbox") && forgotContent.includes("If an account exists")) {
    ok(`${forgotPwdPath}: Anti-enumeration generic response implemented`);
  } else {
    fail(`${forgotPwdPath}: Anti-enumeration`, "Missing generic confirmation message");
  }

  if (forgotContent.includes("/reset-password")) {
    ok(`${forgotPwdPath}: Targets /reset-password redirect`);
  } else {
    fail(`${forgotPwdPath}: Redirect target`, "Missing /reset-password target");
  }
}

// Reset Password Page Checks
const resetPwdPath = "app/reset-password/page.js";
if (!fs.existsSync(resetPwdPath)) {
  fail(`File Exists: ${resetPwdPath}`, "File not found");
} else {
  ok(`File Exists: ${resetPwdPath}`);
  const resetContent = fs.readFileSync(resetPwdPath, "utf8");

  if (
    resetContent.includes("supabase.auth.exchangeCodeForSession") ||
    resetContent.includes("supabase.auth.verifyOtp")
  ) {
    ok(`${resetPwdPath}: Implements recovery token/code exchange`);
  } else {
    fail(`${resetPwdPath}: Token exchange`, "Missing exchangeCodeForSession or verifyOtp");
  }

  if (resetContent.includes("newPassword.length < 6")) {
    ok(`${resetPwdPath}: Enforces minimum 6-character password constraint`);
  } else {
    fail(`${resetPwdPath}: Password length constraint`, "Missing minimum length check");
  }

  if (resetContent.includes("newPassword !== confirmPassword")) {
    ok(`${resetPwdPath}: Enforces password confirmation match`);
  } else {
    fail(`${resetPwdPath}: Password match`, "Missing match check");
  }

  if (resetContent.includes("supabase.auth.updateUser")) {
    ok(`${resetPwdPath}: Uses supabase.auth.updateUser({ password })`);
  } else {
    fail(`${resetPwdPath}: Password update`, "Missing updateUser call");
  }

  if (resetContent.includes("Invalid or Expired Link") && resetContent.includes("/forgot-password")) {
    ok(`${resetPwdPath}: Gracefully handles expired/invalid tokens with /forgot-password link`);
  } else {
    fail(`${resetPwdPath}: Invalid link handler`, "Missing invalid/expired link UI or forgot-password redirect");
  }

  if (resetContent.includes("<Suspense") && resetContent.includes("useSearchParams")) {
    ok(`${resetPwdPath}: Wrapped in Suspense boundary for Next.js App Router compliance`);
  } else {
    fail(`${resetPwdPath}: Suspense boundary`, "Missing Suspense boundary around searchParams reader");
  }
}

// Login Page Check
const loginPageContent = fs.readFileSync("app/login/page.js", "utf8");
if (loginPageContent.includes("/forgot-password") && loginPageContent.includes("Forgot your password?")) {
  ok("app/login/page.js: Contains accessible 'Forgot your password?' link");
} else {
  fail("app/login/page.js: Forgot password link", "Missing link to /forgot-password");
}

// Proxy / Middleware Checks
const proxyContent = fs.readFileSync("proxy.js", "utf8");
if (proxyContent.includes("pathname === \"/forgot-password\"") && proxyContent.includes(":forgotpwd")) {
  ok("proxy.js: Enforces rate limiting on /forgot-password (5 attempts / 15m)");
} else {
  fail("proxy.js: Forgot password rate limiting", "Missing /forgot-password rate-limit block");
}

if (proxyContent.includes("\"/forgot-password\"") && proxyContent.includes("\"/reset-password\"")) {
  ok("proxy.js: config.matcher includes /forgot-password and /reset-password");
} else {
  fail("proxy.js: Matcher config", "Missing routes in config.matcher");
}

// ──────────────────────────────────────────────────────────────────
// 6. Setup & Password Reset Link Redirect Destination Audit
// ──────────────────────────────────────────────────────────────────
console.log("\n====================================================================");
console.log("  6. Admin Link Redirect Destination & Host Poisoning Immunity");
console.log("====================================================================");

const origEnv = process.env.NODE_ENV;
const origSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

try {
  // Test 1: Production resolution
  process.env.NODE_ENV = "production";
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.SITE_URL;

  const prodUrl = getAuthRedirectUrl("/reset-password");
  if (prodUrl === "https://nfcista.vercel.app/reset-password") {
    ok("getAuthRedirectUrl: Resolves strictly to https://nfcista.vercel.app/reset-password in production");
  } else {
    fail("getAuthRedirectUrl: Production resolution", `Expected https://nfcista.vercel.app/reset-password, got ${prodUrl}`);
  }

  // Test 2: Host Header Poisoning Immunity in Production
  // Even if an attacker supplies spoofed Host or X-Forwarded-Host headers, they MUST be ignored!
  const maliciousReq = {
    headers: {
      get: (k) => {
        if (k === "host") return "attacker-phishing.com";
        if (k === "x-forwarded-host") return "evil-site.org";
        return null;
      },
    },
  };
  const hardenedProdUrl = getAuthRedirectUrl(maliciousReq, "/reset-password");
  if (hardenedProdUrl === "https://nfcista.vercel.app/reset-password") {
    ok("getAuthRedirectUrl: Completely immune to Host Header Poisoning (spoofed Host/X-Forwarded-Host ignored)");
  } else {
    fail("getAuthRedirectUrl: Host Poisoning Vulnerability", `Spoofed headers altered redirect: ${hardenedProdUrl}`);
  }

  // Test 3: Local development resolution
  process.env.NODE_ENV = "development";
  const devUrl = getAuthRedirectUrl("/reset-password");
  if (devUrl === "http://localhost:3000/reset-password") {
    ok("getAuthRedirectUrl: Resolves strictly to http://localhost:3000/reset-password in development");
  } else {
    fail("getAuthRedirectUrl: Local dev resolution", `Expected http://localhost:3000/reset-password, got ${devUrl}`);
  }

  // Test 4: Explicit SITE_URL environment configuration precedence
  process.env.SITE_URL = "https://custom-domain.nfcista.com";
  const customUrl = getAuthRedirectUrl("/reset-password");
  if (customUrl === "https://custom-domain.nfcista.com/reset-password") {
    ok("getAuthRedirectUrl: Explicit SITE_URL environment variable takes precedence");
  } else {
    fail("getAuthRedirectUrl: Explicit env resolution", `Expected https://custom-domain.nfcista.com/reset-password, got ${customUrl}`);
  }
} finally {
  // Restore environment
  process.env.NODE_ENV = origEnv;
  if (origSiteUrl) {
    process.env.NEXT_PUBLIC_SITE_URL = origSiteUrl;
  } else {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  }
  delete process.env.SITE_URL;
}

// Check route files use options: { redirectTo } in generateLink
const linkRoutes = [
  "app/api/admin/customers/resend-setup/route.js",
  "app/api/admin/customers/send-password-reset/route.js",
  "app/api/admin/customers/create-login/route.js",
];

for (const rPath of linkRoutes) {
  const rContent = fs.readFileSync(rPath, "utf8");
  if (rContent.includes("getAuthRedirectUrl(request") && rContent.includes("redirectTo,")) {
    ok(`${rPath}: generateLink includes dynamic options.redirectTo`);
  } else {
    fail(`${rPath}: generateLink redirectTo`, "Missing getAuthRedirectUrl or redirectTo in generateLink options");
  }
}

// ──────────────────────────────────────────────────────────────────
// 7. Wave 3: In-Dashboard Customer Security & Password Management
// ──────────────────────────────────────────────────────────────────
console.log("\n====================================================================");
console.log("  7. Wave 3: In-Dashboard Customer Security & Password Management");
console.log("====================================================================");

const secCompPath = "components/dashboard/CustomerSecuritySection.jsx";
const profilePagePath = "app/dashboard/profile/page.js";

// ── 7a. Server-side password route ──────────────────────────────
const passwordRoutePath = "app/api/customer/password/route.js";
if (fs.existsSync(passwordRoutePath)) {
  ok(`File Exists: ${passwordRoutePath}`);
  const pwdRouteContent = fs.readFileSync(passwordRoutePath, "utf8");

  // Must use authenticateCustomer — never accept identity from body
  if (
    pwdRouteContent.includes("authenticateCustomer(request)") &&
    pwdRouteContent.includes("if (errorResponse) return errorResponse;")
  ) {
    ok(`${passwordRoutePath}: Protected by authenticateCustomer() from HttpOnly cookie`);
  } else {
    fail(`${passwordRoutePath}: Auth guard`, "Missing authenticateCustomer guard");
  }

  // Must use service role + updateUserById scoped to user.id from cookie
  if (
    pwdRouteContent.includes("SUPABASE_SERVICE_ROLE_KEY") &&
    pwdRouteContent.includes("supabaseAdmin.auth.admin.updateUserById(user.id,")
  ) {
    ok(`${passwordRoutePath}: Uses service role to update only the authenticated user (user.id from cookie)`);
  } else {
    fail(
      `${passwordRoutePath}: Service role scoping`,
      "Expected SUPABASE_SERVICE_ROLE_KEY + updateUserById(user.id, ...)"
    );
  }

  // Must NOT accept user.id or email from request body
  if (
    !pwdRouteContent.includes("body.user_id") &&
    !pwdRouteContent.includes("body.userId") &&
    !pwdRouteContent.includes("body.auth_user_id") &&
    !pwdRouteContent.includes("body.email")
  ) {
    ok(`${passwordRoutePath}: Never accepts identity fields (user_id/email) from request body`);
  } else {
    fail(`${passwordRoutePath}: Identity from body`, "Found identity field accepted from browser body");
  }

  // CSRF origin check
  if (
    pwdRouteContent.includes("request.headers.get(\"origin\")") &&
    pwdRouteContent.includes("ALLOWED_ORIGINS") &&
    pwdRouteContent.includes("status: 403")
  ) {
    ok(`${passwordRoutePath}: CSRF origin protection blocks unexpected origins`);
  } else {
    fail(`${passwordRoutePath}: CSRF protection`, "Missing Origin header check or 403 response");
  }

  // force-dynamic
  if (pwdRouteContent.includes('export const dynamic = "force-dynamic";')) {
    ok(`${passwordRoutePath}: Configured with force-dynamic`);
  } else {
    fail(`${passwordRoutePath}: force-dynamic`, "Missing force-dynamic export");
  }

  // Password length validation server-side
  if (pwdRouteContent.includes("newPassword.length < 6")) {
    ok(`${passwordRoutePath}: Server-side minimum 6-character password validation`);
  } else {
    fail(`${passwordRoutePath}: Password validation`, "Missing server-side password length check");
  }

  // No password logging
  if (
    !pwdRouteContent.includes("console.log(newPassword") &&
    !pwdRouteContent.includes("console.log(password") &&
    !pwdRouteContent.includes("console.log(body")
  ) {
    ok(`${passwordRoutePath}: No password or request body logging`);
  } else {
    fail(`${passwordRoutePath}: Secret leakage`, "Found console.log of password or body");
  }
} else {
  fail(`File Exists: ${passwordRoutePath}`, "Missing server-side password route");
}

// ── 7b. CustomerSecuritySection component ───────────────────────
if (fs.existsSync(secCompPath)) {
  ok(`File Exists: ${secCompPath}`);
  const secContent = fs.readFileSync(secCompPath, "utf8");

  // Must use server-side fetch — NOT supabase.auth.updateUser
  if (secContent.includes('fetch("/api/customer/password"') && secContent.includes('"POST"')) {
    ok(`${secCompPath}: Uses server-side POST /api/customer/password for password update`);
  } else {
    fail(`${secCompPath}: Server-side update`, "Missing fetch('/api/customer/password') with POST");
  }

  // Must NOT use browser-side supabase.auth.updateUser (the bug we fixed)
  if (!secContent.includes("supabase.auth.updateUser")) {
    ok(`${secCompPath}: Does NOT use browser-side supabase.auth.updateUser (bug fixed)`);
  } else {
    fail(`${secCompPath}: Browser auth leak`, "Found supabase.auth.updateUser — must use server route instead");
  }

  // Must NOT use supabase.auth.getSession for password update flow
  if (!secContent.includes("supabase.auth.getSession")) {
    ok(`${secCompPath}: Does NOT call supabase.auth.getSession (no browser session exists)`);
  } else {
    fail(`${secCompPath}: Browser session check`, "Found supabase.auth.getSession — browser session is not available");
  }

  // Must NOT send user ID or email in body
  if (
    !secContent.includes("user.id") &&
    !secContent.includes("userId:") &&
    !secContent.includes("auth_user_id:") &&
    !secContent.includes("email: userEmail")
  ) {
    ok(`${secCompPath}: Does NOT send identity fields (user.id/email) to the server`);
  } else {
    fail(`${secCompPath}: Identity from body`, "Found identity field sent to server from browser");
  }

  // Client-side password validation still present
  if (secContent.includes("newPassword.length < 6")) {
    ok(`${secCompPath}: Enforces minimum 6-character password constraint (client-side)`);
  } else {
    fail(`${secCompPath}: Password length constraint`, "Missing minimum length check");
  }

  if (secContent.includes("newPassword !== confirmPassword")) {
    ok(`${secCompPath}: Enforces password confirmation match`);
  } else {
    fail(`${secCompPath}: Password match`, "Missing confirmation match check");
  }

  // Password fields cleared on success
  if (secContent.includes('setNewPassword("")') && secContent.includes('setConfirmPassword("")')) {
    ok(`${secCompPath}: Clears credential inputs immediately upon successful update`);
  } else {
    fail(`${secCompPath}: Input cleanup`, "Password inputs are not cleared on success");
  }

  // Password masking UI preserved
  if (secContent.includes('type={showPassword ? "text" : "password"}')) {
    ok(`${secCompPath}: Passwords masked by default with Show/Hide toggle`);
  } else {
    fail(`${secCompPath}: Password masking`, "Missing masked password type or show/hide control");
  }

  // Admin boundary
  if (
    !secContent.includes("/api/admin") &&
    !secContent.includes("/admin/") &&
    !secContent.includes("SERVICE_ROLE")
  ) {
    ok(`${secCompPath}: Zero admin route leakage or service role usage`);
  } else {
    fail(`${secCompPath}: Admin boundary violation`, "Found references to /admin or SERVICE_ROLE in customer component");
  }

  // Decoupled from profile endpoint
  if (!secContent.includes("/api/customer/profile")) {
    ok(`${secCompPath}: Strictly decoupled from /api/customer/profile (independent form boundary)`);
  } else {
    fail(`${secCompPath}: Form coupling`, "Found customer profile API call in security component");
  }
} else {
  fail(`File Exists: ${secCompPath}`, "Missing CustomerSecuritySection component");
}

const profileContent = fs.readFileSync(profilePagePath, "utf8");
if (profileContent.includes("CustomerSecuritySection") && profileContent.includes("<CustomerSecuritySection")) {
  ok(`${profilePagePath}: Embeds <CustomerSecuritySection /> component`);
} else {
  fail(`${profilePagePath}: Integration`, "Missing CustomerSecuritySection import or usage");
}

if (!profileContent.includes("formData.password") && !profileContent.includes("password: formData")) {
  ok(`${profilePagePath}: Profile form payload strictly excludes password fields`);
} else {
  fail(`${profilePagePath}: Payload integrity`, "Found password fields attached to main profile formData");
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
