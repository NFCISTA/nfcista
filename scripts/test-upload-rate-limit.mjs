/**
 * NFCISTA SECURITY PHASE B TEST SUITE
 * LOW-06: Upload Rate Limiting
 *
 * Static source-inspection tests — no live server required.
 * Verifies that the correct rate-limit logic has been added to all three
 * authenticated upload endpoints.
 *
 * Run: node scripts/test-upload-rate-limit.mjs
 */

import fs from "fs";
import path from "path";

const rootDir = process.cwd();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function pass(name) {
  totalTests++;
  passedTests++;
  console.log(`  ✅ PASS: ${name}`);
}

function fail(name, details = "") {
  totalTests++;
  failedTests++;
  console.error(`  ❌ FAIL: ${name}${details ? ` — ${details}` : ""}`);
}

function section(title) {
  console.log(`\n${"=".repeat(68)}\n  ${title}\n${"=".repeat(68)}`);
}

function readSrc(relPath) {
  return fs.readFileSync(path.join(rootDir, relPath), "utf-8");
}

// ============================================================================
// SECTION 1 — PHOTO ENDPOINT
// ============================================================================
section("1. POST /api/customer/photo — Rate Limit Implementation");

const photoSrc = readSrc("app/api/customer/photo/route.js");

// 1.1 Imports
if (photoSrc.includes('from "@/lib/rateLimit"')) {
  pass("photo: imports from @/lib/rateLimit");
} else {
  fail("photo: missing import from @/lib/rateLimit");
}

if (photoSrc.includes("getClientIp") && photoSrc.includes("checkRateLimit")) {
  pass("photo: imports getClientIp and checkRateLimit");
} else {
  fail("photo: getClientIp or checkRateLimit not imported");
}

// 1.2 Rate-limit key
if (photoSrc.includes("upload:photo:${customer.id}:${clientIp}")) {
  pass("photo: rate-limit key is 'upload:photo:<customer.id>:<clientIp>'");
} else {
  fail("photo: rate-limit key does not match expected format");
}

// 1.3 Correct limit
if (photoSrc.includes("limit: 5")) {
  pass("photo: limit is 5");
} else {
  fail("photo: limit is not 5");
}

// 1.4 Correct window
if (photoSrc.includes("windowMs: 10 * 60 * 1000")) {
  pass("photo: windowMs is 10 * 60 * 1000 (10 minutes)");
} else {
  fail("photo: windowMs is not 10 minutes");
}

// 1.5 429 status on rejection
if (photoSrc.includes("status: 429")) {
  pass("photo: returns HTTP 429 on rate-limit rejection");
} else {
  fail("photo: does not return 429 on rate-limit rejection");
}

// 1.6 Retry-After header
if (photoSrc.includes('"Retry-After": String(rateCheck.reset)')) {
  pass("photo: includes Retry-After header derived from rateCheck.reset");
} else {
  fail("photo: Retry-After header missing or incorrect");
}

// 1.7 Rate check before formData parsing
const photoCheckPos = photoSrc.indexOf("checkRateLimit(rateLimitKey");
const photoFormDataPos = photoSrc.indexOf("request.formData()");
if (photoCheckPos !== -1 && photoFormDataPos !== -1 && photoCheckPos < photoFormDataPos) {
  pass("photo: rate-limit check appears before request.formData()");
} else {
  fail("photo: rate-limit check must appear before request.formData()");
}

// 1.8 Rate check after authenticateCustomer
const photoAuthPos = photoSrc.indexOf("authenticateCustomer(request)");
if (photoAuthPos !== -1 && photoCheckPos !== -1 && photoAuthPos < photoCheckPos) {
  pass("photo: rate-limit check appears after authenticateCustomer()");
} else {
  fail("photo: rate-limit check must appear after authenticateCustomer()");
}

// ============================================================================
// SECTION 2 — BANNER ENDPOINT
// ============================================================================
section("2. POST /api/customer/banner — Rate Limit Implementation");

const bannerSrc = readSrc("app/api/customer/banner/route.js");

// 2.1 Imports
if (bannerSrc.includes('from "@/lib/rateLimit"')) {
  pass("banner: imports from @/lib/rateLimit");
} else {
  fail("banner: missing import from @/lib/rateLimit");
}

if (bannerSrc.includes("getClientIp") && bannerSrc.includes("checkRateLimit")) {
  pass("banner: imports getClientIp and checkRateLimit");
} else {
  fail("banner: getClientIp or checkRateLimit not imported");
}

// 2.2 Rate-limit key
if (bannerSrc.includes("upload:banner:${customer.id}:${clientIp}")) {
  pass("banner: rate-limit key is 'upload:banner:<customer.id>:<clientIp>'");
} else {
  fail("banner: rate-limit key does not match expected format");
}

// 2.3 Correct limit
if (bannerSrc.includes("limit: 5")) {
  pass("banner: limit is 5");
} else {
  fail("banner: limit is not 5");
}

// 2.4 Correct window
if (bannerSrc.includes("windowMs: 10 * 60 * 1000")) {
  pass("banner: windowMs is 10 * 60 * 1000 (10 minutes)");
} else {
  fail("banner: windowMs is not 10 minutes");
}

// 2.5 429 status
if (bannerSrc.includes("status: 429")) {
  pass("banner: returns HTTP 429 on rate-limit rejection");
} else {
  fail("banner: does not return 429 on rate-limit rejection");
}

// 2.6 Retry-After header
if (bannerSrc.includes('"Retry-After": String(rateCheck.reset)')) {
  pass("banner: includes Retry-After header derived from rateCheck.reset");
} else {
  fail("banner: Retry-After header missing or incorrect");
}

// 2.7 Rate check before formData
const bannerCheckPos = bannerSrc.indexOf("checkRateLimit(rateLimitKey");
const bannerFormDataPos = bannerSrc.indexOf("request.formData()");
if (bannerCheckPos !== -1 && bannerFormDataPos !== -1 && bannerCheckPos < bannerFormDataPos) {
  pass("banner: rate-limit check appears before request.formData()");
} else {
  fail("banner: rate-limit check must appear before request.formData()");
}

// 2.8 Rate check after authenticateCustomer
const bannerAuthPos = bannerSrc.indexOf("authenticateCustomer(request)");
if (bannerAuthPos !== -1 && bannerCheckPos !== -1 && bannerAuthPos < bannerCheckPos) {
  pass("banner: rate-limit check appears after authenticateCustomer()");
} else {
  fail("banner: rate-limit check must appear after authenticateCustomer()");
}

// ============================================================================
// SECTION 3 — GALLERY UPLOAD ENDPOINT
// ============================================================================
section("3. POST /api/customer/gallery/upload — Rate Limit Implementation");

const gallerySrc = readSrc("app/api/customer/gallery/upload/route.js");

// 3.1 Imports
if (gallerySrc.includes('from "@/lib/rateLimit"')) {
  pass("gallery: imports from @/lib/rateLimit");
} else {
  fail("gallery: missing import from @/lib/rateLimit");
}

if (gallerySrc.includes("getClientIp") && gallerySrc.includes("checkRateLimit")) {
  pass("gallery: imports getClientIp and checkRateLimit");
} else {
  fail("gallery: getClientIp or checkRateLimit not imported");
}

// 3.2 Rate-limit key
if (gallerySrc.includes("upload:gallery:${customer.id}:${clientIp}")) {
  pass("gallery: rate-limit key is 'upload:gallery:<customer.id>:<clientIp>'");
} else {
  fail("gallery: rate-limit key does not match expected format");
}

// 3.3 Correct limit (30 for gallery)
if (gallerySrc.includes("limit: 30")) {
  pass("gallery: limit is 30");
} else {
  fail("gallery: limit is not 30");
}

// 3.4 Correct window
if (gallerySrc.includes("windowMs: 10 * 60 * 1000")) {
  pass("gallery: windowMs is 10 * 60 * 1000 (10 minutes)");
} else {
  fail("gallery: windowMs is not 10 minutes");
}

// 3.5 429 status
if (gallerySrc.includes("status: 429")) {
  pass("gallery: returns HTTP 429 on rate-limit rejection");
} else {
  fail("gallery: does not return 429 on rate-limit rejection");
}

// 3.6 Retry-After header
if (gallerySrc.includes('"Retry-After": String(rateCheck.reset)')) {
  pass("gallery: includes Retry-After header derived from rateCheck.reset");
} else {
  fail("gallery: Retry-After header missing or incorrect");
}

// 3.7 Rate check before formData
const galleryCheckPos = gallerySrc.indexOf("checkRateLimit(rateLimitKey");
const galleryFormDataPos = gallerySrc.indexOf("request.formData()");
if (galleryCheckPos !== -1 && galleryFormDataPos !== -1 && galleryCheckPos < galleryFormDataPos) {
  pass("gallery: rate-limit check appears before request.formData()");
} else {
  fail("gallery: rate-limit check must appear before request.formData()");
}

// 3.8 Rate check after authenticateCustomer
const galleryAuthPos = gallerySrc.indexOf("authenticateCustomer(request)");
if (galleryAuthPos !== -1 && galleryCheckPos !== -1 && galleryAuthPos < galleryCheckPos) {
  pass("gallery: rate-limit check appears after authenticateCustomer()");
} else {
  fail("gallery: rate-limit check must appear after authenticateCustomer()");
}

// ============================================================================
// SECTION 4 — NAMESPACE ISOLATION
// ============================================================================
section("4. Namespace Isolation — Separate Keys Per Endpoint");

// Photo, banner, and gallery must use different key prefixes
const photoHasPhotoPrefix = photoSrc.includes("`upload:photo:");
const bannerHasBannerPrefix = bannerSrc.includes("`upload:banner:");
const galleryHasGalleryPrefix = gallerySrc.includes("`upload:gallery:");

if (photoHasPhotoPrefix) {
  pass("photo: uses 'upload:photo:' key namespace");
} else {
  fail("photo: 'upload:photo:' namespace not found");
}

if (bannerHasBannerPrefix) {
  pass("banner: uses 'upload:banner:' key namespace");
} else {
  fail("banner: 'upload:banner:' namespace not found");
}

if (galleryHasGalleryPrefix) {
  pass("gallery: uses 'upload:gallery:' key namespace");
} else {
  fail("gallery: 'upload:gallery:' namespace not found");
}

// All three prefixes must be distinct
const prefixesDistinct =
  photoHasPhotoPrefix &&
  bannerHasBannerPrefix &&
  galleryHasGalleryPrefix &&
  !photoSrc.includes("`upload:banner:") &&
  !photoSrc.includes("`upload:gallery:") &&
  !bannerSrc.includes("`upload:photo:") &&
  !bannerSrc.includes("`upload:gallery:") &&
  !gallerySrc.includes("`upload:photo:") &&
  !gallerySrc.includes("`upload:banner:");

if (prefixesDistinct) {
  pass("isolation: all three endpoints use distinct key namespaces");
} else {
  fail("isolation: key namespace collision detected between endpoints");
}

// customer.id is used as part of the key in all three
if (
  photoSrc.includes("${customer.id}") &&
  bannerSrc.includes("${customer.id}") &&
  gallerySrc.includes("${customer.id}")
) {
  pass("isolation: customer.id used in rate-limit key in all three endpoints");
} else {
  fail("isolation: customer.id missing from rate-limit key in one or more endpoints");
}

// clientIp is used as part of the key in all three
if (
  photoSrc.includes("${clientIp}") &&
  bannerSrc.includes("${clientIp}") &&
  gallerySrc.includes("${clientIp}")
) {
  pass("isolation: clientIp used in rate-limit key in all three endpoints");
} else {
  fail("isolation: clientIp missing from rate-limit key in one or more endpoints");
}

// ============================================================================
// SECTION 5 — AUTHENTICATION STILL REQUIRED (rate limit AFTER auth)
// ============================================================================
section("5. Authentication Precedence — Rate Limit After Auth");

// In each file, authenticateCustomer must appear before checkRateLimit
[
  ["photo", photoSrc, photoAuthPos, photoCheckPos],
  ["banner", bannerSrc, bannerAuthPos, bannerCheckPos],
  ["gallery", gallerySrc, galleryAuthPos, galleryCheckPos],
].forEach(([name, src, authPos, checkPos]) => {
  if (authPos !== -1 && checkPos !== -1 && authPos < checkPos) {
    pass(`${name}: authenticateCustomer() called before checkRateLimit() — 401 still enforced`);
  } else {
    fail(`${name}: authentication must precede rate limiting`);
  }
});

// errorResponse from auth must be returned before rate limit is reached
[
  ["photo", photoSrc],
  ["banner", bannerSrc],
  ["gallery", gallerySrc],
].forEach(([name, src]) => {
  // "if (errorResponse) return errorResponse;" must appear before any rate-limit check
  const errReturnPos = src.indexOf("if (errorResponse) return errorResponse;");
  const rateLimitCheckPos = src.indexOf("checkRateLimit(rateLimitKey");
  if (errReturnPos !== -1 && rateLimitCheckPos !== -1 && errReturnPos < rateLimitCheckPos) {
    pass(`${name}: auth errorResponse guard returned before rate-limit check`);
  } else {
    fail(`${name}: auth errorResponse guard must return before rate-limit check`);
  }
});

// ============================================================================
// SECTION 6 — HELPER UNTOUCHED
// ============================================================================
section("6. lib/rateLimit.js — Unchanged");

const rateLimitSrc = readSrc("lib/rateLimit.js");

if (rateLimitSrc.includes("export function getClientIp(request)")) {
  pass("rateLimit.js: getClientIp export present");
} else {
  fail("rateLimit.js: getClientIp export missing");
}

if (rateLimitSrc.includes("export async function checkRateLimit(ip = \"127.0.0.1\", options = {})")) {
  pass("rateLimit.js: checkRateLimit export signature unchanged");
} else {
  fail("rateLimit.js: checkRateLimit export signature changed unexpectedly");
}

// Fail-open behaviour must still be present
if (
  rateLimitSrc.includes("// 3. Fail-open safety guarantee") &&
  rateLimitSrc.includes("success: true,")
) {
  pass("rateLimit.js: fail-open safety still present");
} else {
  fail("rateLimit.js: fail-open safety appears to have been removed");
}

// ============================================================================
// SECTION 7 — NO NEW DEPENDENCIES
// ============================================================================
section("7. package.json — No New Dependencies");

const pkgJson = JSON.parse(readSrc("package.json"));
const allDeps = {
  ...pkgJson.dependencies,
  ...pkgJson.devDependencies,
};

const forbiddenNewDeps = ["upstash", "@upstash", "ioredis", "redis", "rate-limiter-flexible", "express-rate-limit"];
let newDepFound = false;
for (const depName of Object.keys(allDeps)) {
  for (const forbidden of forbiddenNewDeps) {
    if (depName.toLowerCase().includes(forbidden)) {
      fail(`package.json: unexpected new dependency detected: ${depName}`);
      newDepFound = true;
    }
  }
}
if (!newDepFound) {
  pass("package.json: no new rate-limiting dependencies added");
}

// ============================================================================
// SECTION 8 — PHASE A REGRESSION (LOW-05 / LOW-04 still intact)
// ============================================================================
section("8. Phase A Regression — LOW-05 / LOW-04 Still Intact");

const profileRouteSrc = readSrc("app/api/customer/profile/route.js");

if (profileRouteSrc.includes("function serializeCustomerProfile(customer)")) {
  pass("Phase A: serializeCustomerProfile still defined in profile route");
} else {
  fail("Phase A: serializeCustomerProfile missing from profile route");
}

if (profileRouteSrc.includes("customer: serializeCustomerProfile(customer)")) {
  pass("Phase A: GET /api/customer/profile still uses serializeCustomerProfile");
} else {
  fail("Phase A: GET /api/customer/profile no longer uses serializeCustomerProfile");
}

// Extract the body of serializeCustomerProfile to check what it returns.
// auth_user_id must NOT appear as a returned key inside that function.
const serializeFnMatch = profileRouteSrc.match(
  /function serializeCustomerProfile\(customer\)\s*\{([\s\S]*?)\n\}/
);
if (serializeFnMatch) {
  const fnBody = serializeFnMatch[1];
  if (!fnBody.includes("auth_user_id")) {
    pass("Phase A: serializeCustomerProfile does not return auth_user_id");
  } else {
    fail("Phase A: serializeCustomerProfile still returns auth_user_id");
  }
} else {
  fail("Phase A: could not parse serializeCustomerProfile function body for inspection");
}

const customerAuthSrc = readSrc("lib/customerAuth.js");
if (
  customerAuthSrc.includes(
    '"No customer profile is linked to this account. Please contact NFCISTA support."'
  )
) {
  pass("Phase A: SEC-04 sanitized 404 message still present in customerAuth.js");
} else {
  fail("Phase A: SEC-04 sanitized 404 message missing from customerAuth.js");
}

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log(`\n${"=".repeat(68)}`);
console.log(`  RESULTS: ${passedTests}/${totalTests} passed, ${failedTests} failed`);
console.log("=".repeat(68));

if (failedTests > 0) {
  console.error(`\n❌ ${failedTests} test(s) FAILED. See details above.`);
  process.exit(1);
} else {
  console.log(`\n✅ ALL ${totalTests} TESTS PASSED — LOW-06 implementation verified.`);
}
