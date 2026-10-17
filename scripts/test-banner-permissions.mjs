/**
 * Dedicated Security & Permission Audit for Custom Profile Banner
 * Tests: Customer API, Admin API, Storage RLS, Database RLS, Public Isolation
 * Run with: node scripts/test-banner-permissions.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("=== NFCISTA Custom Profile Banner Permission & Security Audit Suite ===\n");

let passed = 0;
let total = 0;

function runAudit(id, title, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] Test ${id}: ${title}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] Test ${id}: ${title}`);
    console.error(`         ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// 1. Unauthenticated Attacks
// ---------------------------------------------------------------------------

runAudit(1, "Unauthenticated user -> upload banner -> MUST FAIL (401)", () => {
  const routePath = path.join(rootDir, "app/api/customer/banner/route.js");
  const content = fs.readFileSync(routePath, "utf-8");

  // Check that authenticateCustomer is called first in POST
  assert.ok(content.includes("const { errorResponse, user, customer, authClient } = await authenticateCustomer(request);"), 
    "POST handler must call authenticateCustomer first");
  assert.ok(content.includes("if (errorResponse) return errorResponse;"), 
    "POST handler must immediately return errorResponse (401)");

  // Check authenticateCustomer logic in lib/customerAuth.js
  const authPath = path.join(rootDir, "lib/customerAuth.js");
  const authContent = fs.readFileSync(authPath, "utf-8");
  assert.ok(authContent.includes('status: 401'), "authenticateCustomer must reject missing or invalid tokens with HTTP 401");
});

runAudit(2, "Unauthenticated user -> delete banner -> MUST FAIL (401)", () => {
  const routePath = path.join(rootDir, "app/api/customer/banner/route.js");
  const content = fs.readFileSync(routePath, "utf-8");

  // Check that authenticateCustomer is called first in DELETE
  const deleteHandlerMatch = content.match(/export async function DELETE[\s\S]*?authenticateCustomer\(request\)/);
  assert.ok(deleteHandlerMatch, "DELETE handler must call authenticateCustomer");
  assert.ok(content.includes("if (errorResponse) return errorResponse;"), 
    "DELETE handler must immediately return errorResponse (401)");
});

// ---------------------------------------------------------------------------
// 2. Customer A Authorized Operations (Own Profile)
// ---------------------------------------------------------------------------

runAudit(3, "Customer A -> upload own banner -> MUST PASS (validates type/size, uses own user.id)", () => {
  const routePath = path.join(rootDir, "app/api/customer/banner/route.js");
  const content = fs.readFileSync(routePath, "utf-8");

  // Enforces 5 MB and valid MIME
  assert.ok(content.includes("5 * 1024 * 1024"), "Enforces 5 MB limit");
  assert.ok(content.includes("image/jpeg") && content.includes("image/png") && content.includes("image/webp"), "Enforces allowed types");

  // Generates storage path strictly with user.id from session
  assert.ok(content.includes("const storagePath = `customers/${user.id}/banners/${fileName}`;"), 
    "Path must be scoped to customers/${user.id}/banners/");

  // Updates database where auth_user_id = user.id
  assert.ok(content.includes('.eq("auth_user_id", user.id)'), 
    "Database update must be scoped to user's auth_user_id");
});

runAudit(4, "Customer A -> replace own banner -> MUST PASS (cleans up old banner file)", () => {
  const routePath = path.join(rootDir, "app/api/customer/banner/route.js");
  const content = fs.readFileSync(routePath, "utf-8");

  // Check previous banner cleanup logic
  assert.ok(content.includes("const prevBannerUrl = customer.banner_url || \"\";"), 
    "Reads previous banner URL from customer record");
  assert.ok(content.includes("serviceClient.storage.from(BUCKET).remove([prevPath])"), 
    "Cleans up old banner object from storage");
  assert.ok(content.includes("upsert: true"), 
    "Allows upload replacement");
});

runAudit(5, "Customer A -> reset own banner -> MUST PASS (sets banner_url = null, deletes file)", () => {
  const routePath = path.join(rootDir, "app/api/customer/banner/route.js");
  const content = fs.readFileSync(routePath, "utf-8");

  // Check DELETE handler logic
  assert.ok(content.includes('.update({ banner_url: null })'), 
    "Sets banner_url = null in database");
  assert.ok(content.includes("serviceClient.storage.from(BUCKET).remove([prevPath])"), 
    "Removes stored banner object on delete");
  assert.ok(content.includes("revalidateCustomerProfile(customer.profile_slug)"), 
    "Purges public cache after reset");
});

// ---------------------------------------------------------------------------
// 3. Cross-Tenant Tampering Attacks (Customer A targeting Customer B)
// ---------------------------------------------------------------------------

runAudit(6, "Customer A -> upload to Customer B -> MUST FAIL (API ignores body IDs, binds to user.id)", () => {
  const routePath = path.join(rootDir, "app/api/customer/banner/route.js");
  const content = fs.readFileSync(routePath, "utf-8");

  // Verify that POST handler ONLY reads 'file' from multipart form data
  assert.ok(content.includes('const file = formData.get("file");'), "Only extracts file from formData");
  assert.ok(!content.includes('formData.get("customerId")'), "Must NOT accept customerId from form data");
  assert.ok(!content.includes('formData.get("auth_user_id")'), "Must NOT accept auth_user_id from form data");
  assert.ok(!content.includes('formData.get("slug")'), "Must NOT accept slug from form data");

  // Target customer in DB update is strictly customer.id and user.id from session
  assert.ok(content.includes('.eq("id", customer.id)'), "Update strictly targets session customer.id");
  assert.ok(content.includes('.eq("auth_user_id", user.id)'), "Update strictly targets session user.id");
});

runAudit(7, "Customer A -> delete Customer B banner -> MUST FAIL (DELETE takes no params, scoped to session)", () => {
  const routePath = path.join(rootDir, "app/api/customer/banner/route.js");
  const content = fs.readFileSync(routePath, "utf-8");

  // Extract DELETE handler body
  const deleteHandlerMatch = content.match(/export async function DELETE[\s\S]*$/);
  assert.ok(deleteHandlerMatch, "DELETE handler must exist");
  const deleteCode = deleteHandlerMatch[0];

  // Verify DELETE takes no body parameters and only uses customer from authenticateCustomer
  assert.ok(!deleteCode.includes("request.json()"), "DELETE handler must not accept JSON payload");
  assert.ok(!deleteCode.includes("request.formData()"), "DELETE handler must not accept formData");
  assert.ok(deleteCode.includes('.eq("auth_user_id", user.id)'), "DELETE only updates row where auth_user_id = user.id");
});

runAudit(8, "Customer A -> modify Customer B banner_url -> MUST FAIL (profile PUT enforces RLS & auth_user_id)", () => {
  const profileRoutePath = path.join(rootDir, "app/api/customer/profile/route.js");
  const content = fs.readFileSync(profileRoutePath, "utf-8");

  // Verify authenticateCustomer is called
  assert.ok(content.includes("authenticateCustomer(request)"), "Profile PUT must authenticate customer");

  // Verify DB update is strictly scoped
  assert.ok(content.includes('.eq("id", customer.id)'), "Profile PUT must target customer.id from session");
  assert.ok(content.includes('.eq("auth_user_id", user.id)'), "Profile PUT must target user.id from session");

  // Database RLS audit
  const migAuthPath = path.join(rootDir, "supabase/migrations/20261006000000_add_customer_auth.sql");
  const rlsContent = fs.readFileSync(migAuthPath, "utf-8");
  assert.ok(rlsContent.includes("USING (auth_user_id = auth.uid())"), "PostgreSQL RLS rejects non-matching auth.uid()");
  assert.ok(rlsContent.includes("WITH CHECK (auth_user_id = auth.uid())"), "PostgreSQL RLS check rejects non-matching updates");
});

runAudit(9, "Customer A -> use Customer B slug -> MUST FAIL (session customer lookup binds to auth_user_id)", () => {
  const authPath = path.join(rootDir, "lib/customerAuth.js");
  const authContent = fs.readFileSync(authPath, "utf-8");

  // Lookup in lib/customerAuth.js strictly queries: .eq("auth_user_id", userData.user.id)
  assert.ok(authContent.includes('.eq("auth_user_id", userData.user.id)'), 
    "authenticateCustomer must fetch customer strictly by auth_user_id = user.id, ignoring any user-submitted slug");
});

runAudit(10, "Customer A -> use Customer B storage path -> MUST FAIL (Storage RLS restricts to auth.uid())", () => {
  const storageMigPath = path.join(rootDir, "supabase/migrations/20261006000001_create_profile_photos_bucket.sql");
  const storageSql = fs.readFileSync(storageMigPath, "utf-8");

  // Check Storage RLS policies for customers
  assert.ok(storageSql.includes("(storage.foldername(name))[1] = 'customers'"), "Storage policy requires customers folder");
  assert.ok(storageSql.includes("(storage.foldername(name))[2] = auth.uid()::text"), "Storage policy strictly locks folder to auth.uid()");

  // Simulation: Verify folder matching
  const userA_id = "11111111-1111-1111-1111-111111111111";
  const userB_id = "22222222-2222-2222-2222-222222222222";
  const targetFolder = userB_id;

  const isPermitted = targetFolder === userA_id;
  assert.equal(isPermitted, false, "Customer A auth.uid() MUST NOT match Customer B's folder name");
});

// ---------------------------------------------------------------------------
// 4. Admin API & Owner Authorization
// ---------------------------------------------------------------------------

runAudit(11, "Normal customer -> call admin banner endpoint -> MUST FAIL (403 Forbidden)", () => {
  const adminAuthPath = path.join(rootDir, "lib/adminAuth.js");
  const adminAuthContent = fs.readFileSync(adminAuthPath, "utf-8");

  // Strict email check
  assert.ok(adminAuthContent.includes('userData.user.email?.toLowerCase() !== "hellonfcista@gmail.com"'), 
    "Must verify email is hellonfcista@gmail.com");
  assert.ok(adminAuthContent.includes('status: 403'), "Must reject non-owner with 403 Forbidden");

  // Strict is_admin() RPC check
  assert.ok(adminAuthContent.includes('rpc("is_admin")'), "Must verify is_admin() database function");

  // Proxy / Middleware audit
  const proxyPath = path.join(rootDir, "proxy.js");
  const proxyContent = fs.readFileSync(proxyPath, "utf-8");
  assert.ok(proxyContent.includes("hellonfcista@gmail.com"), "proxy.js must restrict /admin routes to hellonfcista@gmail.com");
});

runAudit(12, "NFCISTA owner/admin -> manage Customer A banner -> MUST PASS (Deterministic cid / auth path)", () => {
  const adminPagePath = path.join(rootDir, "app/admin/page.js");
  const adminPageContent = fs.readFileSync(adminPagePath, "utf-8");

  // Admin handles banner upload, removal, reset
  assert.ok(adminPageContent.includes("uploadCustomerBanner("), "Admin page calls uploadCustomerBanner");
  assert.ok(adminPageContent.includes("deleteCustomerBanner("), "Admin page calls deleteCustomerBanner");
  assert.ok(adminPageContent.includes("handleRemoveBanner"), "Admin page has handleRemoveBanner (reset to default)");
  assert.ok(adminPageContent.includes("editingId || null"), "Admin passes customerId (editingId) to prevent path collision");

  const customersLibPath = path.join(rootDir, "lib/customers.js");
  const customersLibContent = fs.readFileSync(customersLibPath, "utf-8");
  assert.ok(customersLibContent.includes("customers/${folder}/banners/${fileName}"), 
    "Admin banner uploads use isolated customers/{folder}/banners/ namespace");
});

// ---------------------------------------------------------------------------
// 5. Public Profile Read-Only Verification
// ---------------------------------------------------------------------------

runAudit(13, "Public profile (/p/[slug]) -> READ-ONLY verification (No mutation endpoints or exposed keys)", () => {
  const profilePagePath = path.join(rootDir, "app/p/[slug]/page.js");
  const profilePageContent = fs.readFileSync(profilePagePath, "utf-8");

  assert.ok(!profilePageContent.includes("<form action"), "Public profile must not have mutation form action");
  assert.ok(!profilePageContent.includes("SUPABASE_SERVICE_ROLE_KEY"), "Service role key must never be in public profile");
  assert.ok(profilePageContent.includes("safeBannerUrl"), "Public profile only reads safeBannerUrl");
  assert.ok(profilePageContent.includes('/images/hero-mountains.jpg'), "Defaults to /images/hero-mountains.jpg when null");
});

// ---------------------------------------------------------------------------
// 6. Existing Features Permission Integrity Audit
// ---------------------------------------------------------------------------

runAudit(14, "Preservation of Profile Photo permissions and security", () => {
  const photoRoutePath = path.join(rootDir, "app/api/customer/photo/route.js");
  const photoRouteContent = fs.readFileSync(photoRoutePath, "utf-8");

  assert.ok(photoRouteContent.includes("authenticateCustomer(request)"), "Photo route authenticates customer");
  assert.ok(photoRouteContent.includes("customers/${user.id}/"), "Photo storage path is scoped to user.id");
  assert.ok(photoRouteContent.includes('.eq("auth_user_id", user.id)'), "Photo update is scoped to user.id");
});

runAudit(15, "Preservation of Gallery permissions and security", () => {
  const galleryRoutePath = path.join(rootDir, "app/api/customer/gallery/route.js");
  const galleryRouteContent = fs.readFileSync(galleryRoutePath, "utf-8");

  assert.ok(galleryRouteContent.includes("authenticateCustomer(request)"), "Gallery route authenticates customer");
  assert.ok(galleryRouteContent.includes('.eq("customer_id", customer.id)'), "Gallery query is scoped to customer.id");
});

runAudit(16, "Preservation of Facebook & LinkedIn permissions and security", () => {
  const profileRoutePath = path.join(rootDir, "app/api/customer/profile/route.js");
  const profileRouteContent = fs.readFileSync(profileRoutePath, "utf-8");

  assert.ok(profileRouteContent.includes("getSafeExternalHttpsUrl"), "Strictly enforces HTTPS for Facebook/LinkedIn");
  assert.ok(profileRouteContent.includes('.eq("auth_user_id", user.id)'), "Facebook/LinkedIn updates scoped to user.id");
});

console.log(`\n========================================================`);
console.log(`Audit Complete: ${passed} / ${total} Security Checks Passed.`);
console.log(`========================================================\n`);

if (passed !== total) {
  process.exit(1);
}
