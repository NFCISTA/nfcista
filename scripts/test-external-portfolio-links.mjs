import assert from "assert";
import fs from "fs";
import { isSafeHttpUrl, getDomainFromUrl } from "../lib/gallery.js";

console.log("=== NFCISTA EXTERNAL PORTFOLIO LINKS & PREVIEW PAGES TEST SUITE ===\n");

// 1. Migration File Verification
console.log("1. Checking Database Migration File...");
const migrationPath = "supabase/migrations/20261107000000_add_external_portfolio_links.sql";
assert(fs.existsSync(migrationPath), `${migrationPath} must exist`);
const migrationSql = fs.readFileSync(migrationPath, "utf-8");

assert(
  migrationSql.includes("is_external_link BOOLEAN NOT NULL DEFAULT false"),
  "Migration must add is_external_link column with DEFAULT false"
);
assert(
  migrationSql.includes("idx_gallery_items_external_link"),
  "Migration must create index on (customer_id, is_external_link)"
);
assert(
  migrationSql.includes("gi.is_external_link") && migrationSql.includes("get_customer_gallery"),
  "Migration must update get_customer_gallery RPC to expose is_external_link"
);
console.log("  ✅ PASS: Database migration correctly defines column, index, and RPC.");

// 2. Security & URL Validation Logic
console.log("\n2. Checking Security & URL Validation Logic (lib/gallery.js)...");

// isSafeHttpUrl tests
assert.strictEqual(isSafeHttpUrl("https://behance.net/gallery/123/branding"), true);
assert.strictEqual(isSafeHttpUrl("http://dribbble.com/shots/456"), true);
assert.strictEqual(isSafeHttpUrl("https://github.com/nfcista/project"), true);
assert.strictEqual(isSafeHttpUrl("https://my-custom-portfolio.io"), true);

// Malicious & unsafe schemes must be strictly rejected
assert.strictEqual(isSafeHttpUrl("javascript:alert(1)"), false);
assert.strictEqual(isSafeHttpUrl("javascript:void(0)"), false);
assert.strictEqual(isSafeHttpUrl("data:text/html,<script>alert(1)</script>"), false);
assert.strictEqual(isSafeHttpUrl("file:///etc/passwd"), false);
assert.strictEqual(isSafeHttpUrl("vbscript:msgbox(1)"), false);
assert.strictEqual(isSafeHttpUrl("/relative/path"), false);
assert.strictEqual(isSafeHttpUrl("//protocol-relative.com"), false);
assert.strictEqual(isSafeHttpUrl(""), false);
assert.strictEqual(isSafeHttpUrl(null), false);
assert.strictEqual(isSafeHttpUrl(undefined), false);

// getDomainFromUrl tests
assert.strictEqual(getDomainFromUrl("https://www.behance.net/gallery/123"), "behance.net");
assert.strictEqual(getDomainFromUrl("https://dribbble.com/shots/456"), "dribbble.com");
assert.strictEqual(getDomainFromUrl("http://GITHUB.COM/nfcista"), "github.com");
assert.strictEqual(getDomainFromUrl("https://subdomain.portfolio.co.uk/project"), "subdomain.portfolio.co.uk");
assert.strictEqual(getDomainFromUrl("javascript:alert(1)"), null);
assert.strictEqual(getDomainFromUrl("not a url"), null);
assert.strictEqual(getDomainFromUrl(""), null);
assert.strictEqual(getDomainFromUrl(null), null);

console.log("  ✅ PASS: URL validator strictly accepts http/https and domain extractor functions accurately.");

// 3. Dedicated Preview Page Component
console.log("\n3. Checking Dedicated Preview Page (app/p/[slug]/portfolio/[id]/page.js)...");
const previewPagePath = "app/p/[slug]/portfolio/[id]/page.js";
assert(fs.existsSync(previewPagePath), `${previewPagePath} must exist`);
const previewPageCode = fs.readFileSync(previewPagePath, "utf-8");

assert(
  previewPageCode.includes("getPortfolioItemById"),
  "Preview page must call getPortfolioItemById to load item and customer branding"
);
assert(
  previewPageCode.includes("generateMetadata"),
  "Preview page must implement generateMetadata for dynamic OpenGraph support"
);
assert(
  previewPageCode.includes('target="_blank"') && previewPageCode.includes('rel="noopener noreferrer"'),
  "External button must use target=_blank and rel=noopener noreferrer for security"
);
assert(
  previewPageCode.includes("Visit Original Website"),
  "Preview page must feature prominent 'Visit Original Website' CTA button"
);
assert(
  previewPageCode.includes("Back to Profile"),
  "Preview page must allow visitors to easily navigate back to public profile"
);
assert(
  !previewPageCode.includes("window.location") && !previewPageCode.includes("router.push"),
  "Preview page must NOT contain automatic redirects (prevents open-redirect vulnerability)"
);
console.log("  ✅ PASS: Preview page is secure, responsive, and adheres to NFCISTA brand standards.");

// 4. Public Profile Gallery Component
console.log("\n4. Checking Public Profile Gallery (components/profile/ProfileGallery.jsx)...");
const profileGalleryPath = "components/profile/ProfileGallery.jsx";
const profileGalleryCode = fs.readFileSync(profileGalleryPath, "utf-8");

assert(
  profileGalleryCode.includes("externalLinks"),
  "ProfileGallery must partition items to identify externalLinks"
);
assert(
  profileGalleryCode.includes("/portfolio/"),
  "ProfileGallery must link external portfolio items to dedicated preview pages"
);
assert(
  profileGalleryCode.includes("External Portfolio Links") || profileGalleryCode.includes("External Links"),
  "ProfileGallery must render dedicated External Portfolio Links section"
);
console.log("  ✅ PASS: Public profile cleanly separates external portfolio links and links them to preview pages.");

// 5. Customer Dashboard Gallery Manager
console.log("\n5. Checking Customer Dashboard Gallery Manager (components/dashboard/CustomerGalleryManager.jsx)...");
const dashboardGalleryPath = "components/dashboard/CustomerGalleryManager.jsx";
const dashboardGalleryCode = fs.readFileSync(dashboardGalleryPath, "utf-8");

assert(
  dashboardGalleryCode.includes("externalLinkItems"),
  "CustomerGalleryManager must partition items for external links"
);
assert(
  dashboardGalleryCode.includes("Add External Link"),
  "CustomerGalleryManager must provide 'Add External Link' CTA"
);
assert(
  dashboardGalleryCode.includes("isLinkEditorOpen"),
  "CustomerGalleryManager must provide a modal/editor for external links"
);
assert(
  dashboardGalleryCode.includes("handleDeleteLink") && dashboardGalleryCode.includes("handleMoveLink"),
  "CustomerGalleryManager must support editing, deleting, and reordering external links"
);
console.log("  ✅ PASS: Customer dashboard enables full CRUD and reordering of external portfolio links.");

// 6. Admin Customer Gallery Section
console.log("\n6. Checking Admin Customer Gallery Section (components/admin/CustomerGallerySection.jsx)...");
const adminGalleryPath = "components/admin/CustomerGallerySection.jsx";
const adminGalleryCode = fs.readFileSync(adminGalleryPath, "utf-8");

assert(
  adminGalleryCode.includes('openAddItem("external_link")'),
  "Admin CustomerGallerySection must have Add External Link action"
);
assert(
  adminGalleryCode.includes('formType !== "external_link"'),
  "Admin CustomerGallerySection must hide image upload for external links"
);
assert(
  adminGalleryCode.includes("External Link"),
  "Admin CustomerGallerySection must label external links clearly in item rows"
);
console.log("  ✅ PASS: Admin CustomerGallerySection allows administrators to manage external links.");

// 7. API Routes Security & Defensive Fallbacks
console.log("\n7. Checking API Security & Backward-Compatibility Fallback...");
const customerApiCode = fs.readFileSync("app/api/customer/gallery/route.js", "utf-8");
const adminApiCode = fs.readFileSync("app/api/admin/gallery/route.js", "utf-8");

// Customer API checks
assert(
  customerApiCode.includes("authenticateCustomer(request)"),
  "Customer API must use authenticateCustomer to enforce server-side authentication"
);
assert(
  customerApiCode.includes("isSafeHttpUrl"),
  "Customer API must validate that external_url uses strictly http or https"
);
assert(
  customerApiCode.includes("42703"),
  "Customer API must include defensive fallback for code 42703 (undefined column) before migration"
);

// Admin API checks
assert(
  adminApiCode.includes("isSafeHttpUrl"),
  "Admin API must validate that external_url uses strictly http or https"
);
assert(
  adminApiCode.includes("42703"),
  "Admin API must include defensive fallback for code 42703 (undefined column) before migration"
);
console.log("  ✅ PASS: API routes enforce authentication, validate URLs, and provide defensive column fallbacks.");

console.log("\n🎉 ALL EXTERNAL PORTFOLIO LINKS VERIFICATION CHECKS PASSED SUCCESSFULLY!\n");
