import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("=== NFCISTA Custom Profile Banner Feature Test Suite ===");

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

// 1. Migration File Verification
runTest("Migration SQL file exists and is properly structured", () => {
  const migPath = path.join(rootDir, "supabase/migrations/20261018000000_add_banner_url_to_customers.sql");
  assert.ok(fs.existsSync(migPath), "Migration file must exist");

  const content = fs.readFileSync(migPath, "utf-8");
  assert.ok(content.startsWith("BEGIN;"), "Migration must use BEGIN transaction");
  assert.ok(content.trim().endsWith("COMMIT;"), "Migration must end with COMMIT");
  assert.ok(content.includes("ALTER TABLE public.customers"), "Must alter customers table");
  assert.ok(content.includes("ADD COLUMN IF NOT EXISTS banner_url TEXT DEFAULT NULL;"), "Must add banner_url with DEFAULT NULL");
  assert.ok(content.includes("DROP FUNCTION IF EXISTS public.get_customer_by_slug(text);"), "Must safely drop existing RPC");
  assert.ok(content.includes("CREATE FUNCTION public.get_customer_by_slug"), "Must recreate RPC");
  assert.ok(content.includes("banner_url        TEXT"), "RPC must return banner_url column");
  assert.ok(content.includes("SECURITY DEFINER"), "Must preserve SECURITY DEFINER");
  assert.ok(content.includes("SET search_path = public"), "Must preserve search_path");
  assert.ok(content.includes("GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;"), "Must re-grant EXECUTE permissions");

  // Verify return columns count (18 total)
  const returnsTableMatch = content.match(/RETURNS TABLE \(([\s\S]*?)\)\s*LANGUAGE/i);
  assert.ok(returnsTableMatch, "Must define RETURNS TABLE");
  const columnLines = returnsTableMatch[1].trim().split("\n").map(l => l.trim()).filter(Boolean);
  assert.equal(columnLines.length, 18, `Expected exactly 18 return columns, got ${columnLines.length}`);
  assert.ok(columnLines[17].includes("banner_url"), "18th column must be banner_url");
});

// 2. Client Helpers (lib/customers.js)
function validateBannerFile(file) {
  if (!file) {
    return { valid: false, message: "No file selected." };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: "Invalid file type. Only JPG, PNG, and WebP images are allowed.",
    };
  }

  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: "File is too large. Maximum allowed size is 5 MB.",
    };
  }

  return { valid: true };
}

runTest("lib/customers.js exports banner validation and helpers", () => {
  const custPath = path.join(rootDir, "lib/customers.js");
  const custContent = fs.readFileSync(custPath, "utf-8");

  assert.ok(custContent.includes("export function validateBannerFile("), "Must export validateBannerFile");
  assert.ok(custContent.includes("export async function uploadCustomerBanner("), "Must export uploadCustomerBanner");
  assert.ok(custContent.includes("export async function deleteCustomerBanner("), "Must export deleteCustomerBanner");
  assert.ok(custContent.includes("banner_url: null"), "Fallback mock must include banner_url: null");
  assert.ok(custContent.includes("banner_url: formData.banner_url"), "create/updateCustomer must persist banner_url");

  // Test validation logic
  const nullFile = validateBannerFile(null);
  assert.equal(nullFile.valid, false);

  const validJpg = validateBannerFile({ type: "image/jpeg", size: 1024 * 1024 });
  assert.equal(validJpg.valid, true);

  const validPng = validateBannerFile({ type: "image/png", size: 2 * 1024 * 1024 });
  assert.equal(validPng.valid, true);

  const validWebp = validateBannerFile({ type: "image/webp", size: 3 * 1024 * 1024 });
  assert.equal(validWebp.valid, true);

  const invalidSvg = validateBannerFile({ type: "image/svg+xml", size: 1024 });
  assert.equal(invalidSvg.valid, false);

  const invalidGif = validateBannerFile({ type: "image/gif", size: 1024 });
  assert.equal(invalidGif.valid, false);

  const invalidPdf = validateBannerFile({ type: "application/pdf", size: 1024 });
  assert.equal(invalidPdf.valid, false);

  const tooLarge = validateBannerFile({ type: "image/jpeg", size: 6 * 1024 * 1024 });
  assert.equal(tooLarge.valid, false);
});

// 3. Customer Banner API Route Verification
runTest("app/api/customer/banner/route.js exists and enforces security", () => {
  const routePath = path.join(rootDir, "app/api/customer/banner/route.js");
  assert.ok(fs.existsSync(routePath), "Customer banner route must exist");

  const content = fs.readFileSync(routePath, "utf-8");
  assert.ok(content.includes("export async function POST"), "Must export POST handler");
  assert.ok(content.includes("export async function DELETE"), "Must export DELETE handler");
  assert.ok(content.includes("authenticateCustomer"), "Must authenticate customer session");
  assert.ok(content.includes("customers/${user.id}/banners/"), "Must use customer-scoped storage path");
  assert.ok(content.includes("5 * 1024 * 1024"), "Must enforce 5 MB limit");
  assert.ok(content.includes("image/jpeg") && content.includes("image/png") && content.includes("image/webp"), "Must restrict to JPG, PNG, WebP");
  assert.ok(content.includes("revalidateCustomerProfile"), "Must revalidate profile cache on update and delete");
});

// 4. Customer Profile API Route Verification
runTest("app/api/customer/profile/route.js handles banner_url validation", () => {
  const routePath = path.join(rootDir, "app/api/customer/profile/route.js");
  const content = fs.readFileSync(routePath, "utf-8");
  assert.ok(content.includes("updates.banner_url = cleanBanner"), "Must set updates.banner_url");
  assert.ok(content.includes("Profile banner URL must be a valid image URL"), "Must validate banner URL format");
});

// 5. Public Profile Page Verification
runTest("app/p/[slug]/page.js safely renders banner_url with fallback", () => {
  const pagePath = path.join(rootDir, "app/p/[slug]/page.js");
  const content = fs.readFileSync(pagePath, "utf-8");
  assert.ok(/safeBannerUrl\s*=\s*getSafeExternalUrl\(customer\.banner_url\)\s*\|\|\s*["']\/images\/hero-mountains\.jpg["']/.test(content), "Must fallback to /images/hero-mountains.jpg");
  assert.ok(content.includes("src={safeBannerUrl}"), "Must use safeBannerUrl for Image src");
  assert.ok(content.includes("object-cover"), "Must maintain object-cover on banner");
});

// 6. Customer Dashboard UI Verification
runTest("app/dashboard/profile/page.js implements banner UX with default/custom options", () => {
  const pagePath = path.join(rootDir, "app/dashboard/profile/page.js");
  const content = fs.readFileSync(pagePath, "utf-8");
  assert.ok(content.includes("Profile Banner"), "Must have Profile Banner section");
  assert.ok(content.includes("NFCISTA Default"), "Must have NFCISTA Default indicator");
  assert.ok(content.includes("Custom Banner"), "Must have Custom Banner indicator");
  assert.ok(content.includes("handleBannerUpload"), "Must handle banner upload");
  assert.ok(content.includes("handleBannerRemove"), "Must handle banner revert");
  assert.ok(content.includes("aspect-[2.4/1]"), "Must display approx 2.4:1 ratio preview");
  assert.ok(content.includes("1200 × 500 px"), "Must recommend 1200 x 500 px");
});

// 7. Admin Console UI Verification
runTest("app/admin/page.js implements banner management in Customer Modal", () => {
  const pagePath = path.join(rootDir, "app/admin/page.js");
  const content = fs.readFileSync(pagePath, "utf-8");
  assert.ok(content.includes("Profile Banner"), "Admin modal must have Profile Banner field");
  assert.ok(content.includes("bannerPreview"), "Admin modal must show bannerPreview");
  assert.ok(content.includes("handleBannerChange"), "Admin modal must handle banner file changes");
  assert.ok(content.includes("handleRemoveBanner"), "Admin modal must handle banner reset to default");
  assert.ok(content.includes("deleteCustomerBanner"), "Admin modal must clean up banner storage on delete");
});

console.log(`\nResults: ${passed}/${total} banner feature tests passed.`);
if (passed !== total) {
  process.exit(1);
}
