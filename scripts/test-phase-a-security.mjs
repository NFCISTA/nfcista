/**
 * NFCISTA SECURITY PHASE A TEST SUITE
 * LOW-05: Remove auth_user_id from Customer Profile Response
 * LOW-04: Sanitize Internal Error Responses in Customer APIs
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
  console.error(`  ❌ FAIL: ${name} ${details ? `(${details})` : ""}`);
}

function section(title) {
  console.log(`\n${"=".repeat(64)}\n  ${title}\n${"=".repeat(64)}`);
}

// ==============================================================================
// 1. LOW-05: CUSTOMER PROFILE GET SERIALIZATION AUDIT
// ==============================================================================
section("1. LOW-05: Customer Profile Route & Allowlist Audit");

const profileRoutePath = path.join(rootDir, "app/api/customer/profile/route.js");
const profileRouteSrc = fs.readFileSync(profileRoutePath, "utf-8");

// Test 1.1: serializeCustomerProfile function definition exists
if (profileRouteSrc.includes("function serializeCustomerProfile(customer)")) {
  pass("serializeCustomerProfile function defined in app/api/customer/profile/route.js");
} else {
  fail("serializeCustomerProfile function definition missing");
}

// Test 1.2: GET handler uses serializeCustomerProfile
if (profileRouteSrc.includes("return NextResponse.json({ customer: serializeCustomerProfile(customer) });")) {
  pass("GET /api/customer/profile serializes customer with serializeCustomerProfile");
} else {
  fail("GET /api/customer/profile does not use serializeCustomerProfile");
}

// Test 1.3: PUT handler uses serializeCustomerProfile on updatedCustomer
if (profileRouteSrc.includes("customer: serializeCustomerProfile(updatedCustomer)")) {
  pass("PUT /api/customer/profile serializes updatedCustomer with serializeCustomerProfile");
} else {
  fail("PUT /api/customer/profile does not use serializeCustomerProfile");
}

// Test 1.4: Direct simulation of serializeCustomerProfile
// Extract function from source and test behavior
const mockCustomerRow = {
  id: "c0000000-0000-0000-0000-000000000001",
  auth_user_id: "u0000000-0000-0000-0000-000000000001",
  full_name: "Test Customer",
  job_title: "CEO",
  company_name: "Test Corp",
  category: "Technology",
  description: "Test bio description",
  phone: "+91 99999 88888",
  whatsapp: "919999988888",
  email: "test@example.com",
  instagram: "testcorp",
  website: "https://testcorp.com",
  address: "123 Test Street",
  google_review_url: "https://g.page/r/test",
  facebook_url: "https://facebook.com/testcorp",
  linkedin_url: "https://linkedin.com/in/testcorp",
  twitter_url: "https://x.com/testcorp",
  drive_url: "https://drive.google.com/drive/folders/test",
  photo_url: "https://example.com/photo.jpg",
  banner_url: "https://example.com/banner.jpg",
  profile_slug: "test-corp",
  is_active: true,
  enquiry_enabled: true,
  enquiry_delivery_dashboard: true,
  enquiry_delivery_email: false,
  enquiry_delivery_whatsapp: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-10-19T00:00:00Z",
};

// Evaluate serialize function in isolated context
const serializeMatch = profileRouteSrc.match(
  /function serializeCustomerProfile\(customer\)\s*\{[\s\S]*?\n\}/
);

if (serializeMatch) {
  const serializeFn = new Function(`
    ${serializeMatch[0]}
    return serializeCustomerProfile;
  `)();

  const serialized = serializeFn(mockCustomerRow);

  // Check excluded fields
  if (!("auth_user_id" in serialized)) {
    pass("LOW-05: auth_user_id is strictly absent from serialized profile");
  } else {
    fail("LOW-05: auth_user_id is present in serialized profile");
  }

  if (!("created_at" in serialized)) {
    pass("LOW-05: created_at is strictly absent from serialized profile");
  } else {
    fail("LOW-05: created_at is present in serialized profile");
  }

  if (!("updated_at" in serialized)) {
    pass("LOW-05: updated_at is strictly absent from serialized profile");
  } else {
    fail("LOW-05: updated_at is present in serialized profile");
  }

  // Check required fields
  const requiredFields = [
    "id",
    "full_name",
    "job_title",
    "company_name",
    "category",
    "description",
    "phone",
    "whatsapp",
    "email",
    "instagram",
    "website",
    "address",
    "google_review_url",
    "facebook_url",
    "linkedin_url",
    "twitter_url",
    "drive_url",
    "photo_url",
    "banner_url",
    "profile_slug",
    "is_active",
    "enquiry_enabled",
    "enquiry_delivery_dashboard",
    "enquiry_delivery_email",
    "enquiry_delivery_whatsapp",
  ];

  let allRequiredPresent = true;
  for (const field of requiredFields) {
    if (!(field in serialized)) {
      fail(`LOW-05: Required field '${field}' is missing from serialized profile`);
      allRequiredPresent = false;
    }
  }
  if (allRequiredPresent) {
    pass(`LOW-05: All ${requiredFields.length} required dashboard fields are present`);
  }

  // Check values match
  if (
    serialized.id === mockCustomerRow.id &&
    serialized.full_name === mockCustomerRow.full_name &&
    serialized.profile_slug === mockCustomerRow.profile_slug &&
    serialized.enquiry_enabled === true
  ) {
    pass("LOW-05: Serialized values accurately reflect source customer data");
  } else {
    fail("LOW-05: Serialized values do not match source customer data");
  }

  // Check null handling
  if (serializeFn(null) === null) {
    pass("LOW-05: serializeCustomerProfile(null) returns null safely");
  } else {
    fail("LOW-05: serializeCustomerProfile(null) does not return null");
  }

  // Check fallback fields (e.g. facebook, linkedin, x_url, google_drive_url)
  const legacyCustomerRow = {
    id: "c0000000-0000-0000-0000-000000000002",
    full_name: "Legacy Customer",
    facebook: "https://facebook.com/legacy",
    linkedin: "https://linkedin.com/in/legacy",
    x_url: "https://x.com/legacy",
    google_drive_url: "https://drive.google.com/legacy",
    profile_slug: "legacy-customer",
    is_active: true,
  };
  const legacySerialized = serializeFn(legacyCustomerRow);
  if (
    legacySerialized.facebook_url === "https://facebook.com/legacy" &&
    legacySerialized.linkedin_url === "https://linkedin.com/in/legacy" &&
    legacySerialized.twitter_url === "https://x.com/legacy" &&
    legacySerialized.drive_url === "https://drive.google.com/legacy"
  ) {
    pass("LOW-05: Legacy field fallbacks (facebook, linkedin, x_url, google_drive_url) correctly populate canonical keys");
  } else {
    fail("LOW-05: Legacy field fallbacks did not populate canonical keys");
  }
} else {
  fail("Could not extract serializeCustomerProfile function from source");
}

// ==============================================================================
// 2. LOW-04: SANITIZED INTERNAL ERRORS AUDIT ACROSS ALL CUSTOMER ROUTES
// ==============================================================================
section("2. LOW-04: Sanitized Internal Error Audit Across Customer APIs");

const customerRoutes = [
  { path: "app/api/customer/profile/route.js", name: "profile" },
  { path: "app/api/customer/photo/route.js", name: "photo" },
  { path: "app/api/customer/banner/route.js", name: "banner" },
  { path: "app/api/customer/gallery/route.js", name: "gallery" },
  { path: "app/api/customer/gallery/upload/route.js", name: "gallery/upload" },
  { path: "app/api/customer/gallery/image/route.js", name: "gallery/image" },
  { path: "app/api/customer/gallery/reorder/route.js", name: "gallery/reorder" },
];

for (const route of customerRoutes) {
  const filePath = path.join(rootDir, route.path);
  const src = fs.readFileSync(filePath, "utf-8");

  // Check no raw error concatenation in response
  const rawLeakPatterns = [
    /\+\s*uploadErr\.message/i,
    /\+\s*updateErr\.message/i,
    /\+\s*insertErr\.message/i,
    /\+\s*insertImgErr\.message/i,
    /\+\s*delErr\.message/i,
    /\+\s*fetchErr\.message/i,
    /\+\s*itemErr\.message/i,
    /\+\s*customerErr\.message/i,
  ];

  let leaked = false;
  for (const pat of rawLeakPatterns) {
    if (pat.test(src)) {
      fail(`${route.name} route leaks internal error with pattern ${pat}`);
      leaked = true;
    }
  }
  if (!leaked) {
    pass(`${route.name}: Zero raw database/storage error message concatenations`);
  }

  // Check console.error is used to log internal failures
  if (src.includes("console.error(")) {
    pass(`${route.name}: Retains server-side console.error logging`);
  } else {
    fail(`${route.name}: Missing console.error logging for internal failures`);
  }
}

// Specific route checks for LOW-04
section("3. Specific Error Response Messages Verification");

// Photo route
const photoSrc = fs.readFileSync(path.join(rootDir, "app/api/customer/photo/route.js"), "utf-8");
if (photoSrc.includes('"Failed to upload photo. Please try again."')) {
  pass("Photo route: POST returns 'Failed to upload photo. Please try again.' on storage error");
} else {
  fail("Photo route: Missing safe upload error message");
}

if (photoSrc.includes('"Failed to update profile photo. Please try again."')) {
  pass("Photo route: POST returns 'Failed to update profile photo. Please try again.' on DB error");
} else {
  fail("Photo route: Missing safe DB error message");
}

if (photoSrc.includes('"Failed to remove photo. Please try again."')) {
  pass("Photo route: DELETE returns 'Failed to remove photo. Please try again.' on DB error");
} else {
  fail("Photo route: Missing safe delete error message");
}

// Banner route
const bannerSrc = fs.readFileSync(path.join(rootDir, "app/api/customer/banner/route.js"), "utf-8");
if (bannerSrc.includes('"Failed to upload banner. Please try again."')) {
  pass("Banner route: POST returns 'Failed to upload banner. Please try again.' on storage error");
} else {
  fail("Banner route: Missing safe upload error message");
}

if (bannerSrc.includes('"Failed to update profile banner. Please try again."')) {
  pass("Banner route: POST returns 'Failed to update profile banner. Please try again.' on DB error");
} else {
  fail("Banner route: Missing safe DB error message");
}

if (bannerSrc.includes('"Failed to remove custom banner. Please try again."')) {
  pass("Banner route: DELETE returns 'Failed to remove custom banner. Please try again.' on DB error");
} else {
  fail("Banner route: Missing safe delete error message");
}

// Gallery route
const gallerySrc = fs.readFileSync(path.join(rootDir, "app/api/customer/gallery/route.js"), "utf-8");
if (gallerySrc.includes('"Failed to create gallery item. Please try again."')) {
  pass("Gallery route: POST returns 'Failed to create gallery item. Please try again.' on DB error");
} else {
  fail("Gallery route: Missing safe create error message");
}

if (gallerySrc.includes('"Failed to update gallery item. Please try again."')) {
  pass("Gallery route: PUT returns 'Failed to update gallery item. Please try again.' on DB error");
} else {
  fail("Gallery route: Missing safe update error message");
}

if (gallerySrc.includes('"Failed to delete gallery item. Please try again."')) {
  pass("Gallery route: DELETE returns 'Failed to delete gallery item. Please try again.' on DB error");
} else {
  fail("Gallery route: Missing safe delete error message");
}

// Gallery upload route
const uploadSrc = fs.readFileSync(path.join(rootDir, "app/api/customer/gallery/upload/route.js"), "utf-8");
if (uploadSrc.includes('"Failed to upload image. Please try again."')) {
  pass("Gallery Upload route: POST returns 'Failed to upload image. Please try again.' on storage error");
} else {
  fail("Gallery Upload route: Missing safe upload error message");
}

if (uploadSrc.includes('"Failed to save image. Please try again."')) {
  pass("Gallery Upload route: POST returns 'Failed to save image. Please try again.' on DB error");
} else {
  fail("Gallery Upload route: Missing safe DB error message");
}

// Profile route
if (profileRouteSrc.includes('"Failed to update profile. Please try again."')) {
  pass("Profile route: PUT returns 'Failed to update profile. Please try again.' on DB error");
} else {
  fail("Profile route: Missing safe update error message");
}

// ==============================================================================
// 4. CLIENT VALIDATION PRESERVATION AUDIT
// ==============================================================================
section("4. Client Validation Preservation Audit");

// Profile validations
const profileValidations = [
  "Full name is required and must be 150 characters or less.",
  "Please enter a valid email address.",
  "Google Review URL must be a valid HTTP or HTTPS link.",
  "Profile photo URL must be a valid image URL.",
  "Profile banner URL must be a valid image URL.",
  "Facebook URL must be a valid HTTPS link",
  "LinkedIn URL must be a valid HTTPS link",
  "X / Twitter URL must be a valid HTTPS link",
  "Google Drive URL must be a valid shareable link",
  "At least one delivery destination",
  "A WhatsApp number is required to enable WhatsApp Follow-up delivery.",
];

for (const val of profileValidations) {
  if (profileRouteSrc.includes(val)) {
    pass(`Profile validation preserved: "${val.slice(0, 45)}..."`);
  } else {
    fail(`Profile validation missing: "${val}"`);
  }
}

// Photo & Banner validations
const photoValidations = [
  "No image file provided.",
  "File is too large. Maximum allowed size is 5 MB.",
  "Invalid file type. Only JPG, PNG, and WebP images are allowed.",
];

for (const val of photoValidations) {
  if (photoSrc.includes(val)) {
    pass(`Photo validation preserved: "${val}"`);
  } else {
    fail(`Photo validation missing: "${val}"`);
  }
  if (bannerSrc.includes(val)) {
    pass(`Banner validation preserved: "${val}"`);
  } else {
    fail(`Banner validation missing: "${val}"`);
  }
}

// Gallery validations
const galleryValidations = [
  "Type must be 'portfolio' or 'product'.",
  "Title is required and must be 150 characters or less.",
  "Description must be 2000 characters or less.",
  "Price must be 50 characters or less.",
  "Category must be 50 characters or less.",
  "External URL must be a valid HTTP or HTTPS URL.",
  "CTA text must be 50 characters or less.",
  "Invalid item ID.",
  "Item not found or access denied.",
];

for (const val of galleryValidations) {
  if (gallerySrc.includes(val)) {
    pass(`Gallery validation preserved: "${val}"`);
  } else {
    fail(`Gallery validation missing: "${val}"`);
  }
}

// ==============================================================================
// SUMMARY
// ==============================================================================
console.log(`\n${"=".repeat(64)}`);
console.log(`PHASE A SECURITY TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
if (failedTests > 0) {
  console.error(`STATUS: ${failedTests} FAILURES DETECTED!`);
  process.exit(1);
} else {
  console.log("STATUS: ALL PHASE A CHECKS PASSED PERFECTLY! ✅");
  process.exit(0);
}
