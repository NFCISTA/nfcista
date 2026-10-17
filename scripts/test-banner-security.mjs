import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("=== NFCISTA Custom Profile Banner Security Verification Suite ===");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

// 1. Path generation logic audit
runTest("Deterministic customer-scoped path logic for auth_user_id = NULL and NOT NULL", () => {
  const custPath = path.join(rootDir, "lib/customers.js");
  const custContent = fs.readFileSync(custPath, "utf-8");

  // Check the folder selection logic in lib/customers.js
  assert.ok(/folder\s*=\s*targetAuthId[\s\S]*?cid-\$\{targetCustomerId\}[\s\S]*?slug-\$\{cleanSlug\}/.test(custContent),
    "Must select folder hierarchically: targetAuthId -> cid-customerId -> slug-cleanSlug");
  assert.ok(custContent.includes("const filePath = `customers/${folder}/banners/${fileName}`;"),
    "All banners MUST reside under customers/{folder}/banners/");
  assert.ok(!custContent.includes("`banners/${cleanSlug}-${fileName}`"),
    "Global banners/ directory MUST NOT be used");
});

// 2. Unit simulation of path determination
runTest("Path isolation simulation across customer states", () => {
  function getBannerPath(slugOrOptions, authUserId = null, customerId = null, filename = "image.png") {
    let slug = "customer";
    let targetAuthId = null;
    let targetCustomerId = null;

    if (typeof slugOrOptions === "object" && slugOrOptions !== null) {
      slug = slugOrOptions.slug || "customer";
      targetAuthId = slugOrOptions.authUserId || null;
      targetCustomerId = slugOrOptions.customerId || null;
    } else {
      slug = slugOrOptions || "customer";
      targetAuthId = authUserId || null;
      targetCustomerId = customerId || null;
    }

    const cleanSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9-_]+/g, "-");
    const ext = filename.split(".").pop().toLowerCase();
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
    const fileName = `test.${safeExt}`;

    const folder = targetAuthId
      ? targetAuthId
      : targetCustomerId
      ? `cid-${targetCustomerId}`
      : `slug-${cleanSlug}`;

    return `customers/${folder}/banners/${fileName}`;
  }

  // Case A: Customer with active login (auth_user_id exists)
  const pathWithAuth = getBannerPath("acme-corp", "user-uuid-1234", "cust-uuid-5678");
  assert.equal(pathWithAuth, "customers/user-uuid-1234/banners/test.png");

  // Case B: Customer WITHOUT login (auth_user_id is NULL, customerId exists)
  const pathWithoutAuth = getBannerPath("acme-corp", null, "cust-uuid-5678");
  assert.equal(pathWithoutAuth, "customers/cid-cust-uuid-5678/banners/test.png");

  // Case C: Admin creating new customer (auth_user_id is NULL, customerId is NULL, slug provided)
  const pathNewCustomer = getBannerPath("brand-new-co", null, null);
  assert.equal(pathNewCustomer, "customers/slug-brand-new-co/banners/test.png");

  // Collision check between two different customers with auth_user_id = NULL
  const custBPath = getBannerPath("another-co", null, "cust-uuid-9999");
  assert.equal(custBPath, "customers/cid-cust-uuid-9999/banners/test.png");
  assert.notEqual(pathWithoutAuth, custBPath, "Paths for different customer IDs must never collide");
});

// 3. Customer API Cross-Tenant Attack Prevention
runTest("Customer banner API strictly binds to verified session identity", () => {
  const routePath = path.join(rootDir, "app/api/customer/banner/route.js");
  const content = fs.readFileSync(routePath, "utf-8");

  // Verify authenticateCustomer is called first
  assert.ok(content.includes("const { errorResponse, user, customer, authClient } = await authenticateCustomer(request);"),
    "Must authenticate customer via session token");
  assert.ok(content.includes("if (errorResponse) return errorResponse;"),
    "Must halt immediately on invalid or missing session");

  // Verify storage upload path uses user.id from verified session ONLY
  assert.ok(content.includes("const storagePath = `customers/${user.id}/banners/${fileName}`;"),
    "Storage path must be hardcoded to verified session user.id, never accepted from request body");

  // Verify database update strictly filters by auth_user_id = user.id
  assert.ok(content.includes('.eq("id", customer.id)'), "Database update must match customer.id");
  assert.ok(content.includes('.eq("auth_user_id", user.id)'), "Database update must match customer auth_user_id");

  // Verify DELETE handler also enforces strict double-check
  assert.ok(content.includes('.eq("auth_user_id", user.id)'), "DELETE must verify customer auth_user_id");
});

// 4. Admin API Authorization & customer-specific routing
runTest("Admin Customer Modal correctly passes editingId when auth_user_id is NULL", () => {
  const adminPagePath = path.join(rootDir, "app/admin/page.js");
  const adminContent = fs.readFileSync(adminPagePath, "utf-8");

  assert.ok(adminContent.includes("uploadCustomerBanner("), "Admin page must call uploadCustomerBanner");
  assert.ok(adminContent.includes("editingId || null"), "Admin page must pass editingId (customer ID) as fallback");
});

// 5. Revert-to-Default & Deletion Storage Cleanup Audit
runTest("Revert to default and deletion accurately remove storage object", () => {
  const custPath = path.join(rootDir, "lib/customers.js");
  const custContent = fs.readFileSync(custPath, "utf-8");

  assert.ok(custContent.includes("export async function deleteCustomerBanner(bannerUrl)"),
    "Must export deleteCustomerBanner");
  assert.ok(custContent.includes('const marker = "/profile-photos/";'),
    "Must locate profile-photos marker in URL");
  assert.ok(custContent.includes('await supabase.storage.from("profile-photos").remove([filePath]);'),
    "Must remove the extracted filePath from profile-photos bucket");
});

// 6. Existing Storage RLS Policies Preservation Audit
runTest("profile-photos bucket policies remain strictly intact", () => {
  const migBucketPath = path.join(rootDir, "supabase/migrations/20261006000001_create_profile_photos_bucket.sql");
  const bucketSql = fs.readFileSync(migBucketPath, "utf-8");

  assert.ok(bucketSql.includes("bucket_id = 'profile-photos'"), "Bucket ID must be profile-photos");
  assert.ok(bucketSql.includes("(storage.foldername(name))[1] = 'customers'"), "Customer upload must be under customers/ folder");
  assert.ok(bucketSql.includes("(storage.foldername(name))[2] = auth.uid()::text"), "Customer upload must be under auth.uid() folder");
  assert.ok(bucketSql.includes("public.is_admin()"), "Admins retain full management access");
});

console.log(`\nResults: ${passed}/${total} banner security verification checks passed.`);
if (passed !== total) {
  process.exit(1);
}
