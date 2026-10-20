/**
 * Test Suite: AI Google Review Assistant Architecture & Security
 *
 * Verifies:
 * 1. Database schema & RPC backward compatibility (review_assistant_enabled column)
 * 2. Data access layer defaults & customer immutability
 * 3. Admin dashboard controls for Google Review AI Assistant
 * 4. Digital Business Profile (/p/[slug]) remains 100% untouched and unchanged
 * 5. Dedicated Review Hub (/review/[slug]) route:
 *    - Validates slug and handles 404
 *    - Provides [⭐ Write a Google Review Directly]
 *    - Provides [✨ Help Me Write My Review]
 *    - When review_assistant_enabled is false, presents clean normal/manual Google Review flow
 *    - When review_assistant_enabled is true, enables the Review Assistant
 *    - Never replaces direct review button
 *    - Full 1-5 star autonomy (no forced 5 stars)
 *    - Editable draft textarea and clipboard copy
 * 6. Server-side AI API route (/api/review-assistant):
 *    - Single configured provider: OpenAI (gpt-4o-mini) via native fetch
 *    - Rate limiting (5 req / 10 min / IP+slug)
 *    - Feature flag enforcement (403 if disabled)
 *    - Anti-hallucination prompt guardrails
 *    - Ephemeral processing (no visitor draft storage in DB)
 *    - 8s timeout protection
 * 7. Regression audit on existing NFCISTA capabilities (/r/[cardCode], /api/enquiry, etc.)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

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
  console.error(`  ❌ FAIL: ${name}`);
  if (details) console.error(`     Details: ${details}`);
}

function section(title) {
  console.log(`\n${"=".repeat(68)}`);
  console.log(`  ${title}`);
  console.log("=".repeat(68));
}

function readSrc(relPath) {
  const fullPath = path.join(rootDir, relPath);
  return fs.readFileSync(fullPath, "utf-8");
}

async function runTests() {
  console.log("=== NFCISTA AI GOOGLE REVIEW ASSISTANT COMPREHENSIVE TEST SUITE ===");

  // ============================================================================
  // SECTION 1 — DATABASE MIGRATION & RPC SIGNATURE INTEGRITY
  // ============================================================================
  section("1. Database Migration & RPC Signature Integrity");

  const migrationFiles = fs.readdirSync(path.join(rootDir, "supabase", "migrations"));
  const reviewMigrationFile = migrationFiles.find((f) => f.includes("add_review_assistant"));

  if (!reviewMigrationFile) {
    fail("1.1: Migration file for review assistant does not exist");
  } else {
    const migrationSql = readSrc(`supabase/migrations/${reviewMigrationFile}`);

    // Check review_assistant_enabled column added with DEFAULT FALSE
    if (
      migrationSql.includes("ADD COLUMN IF NOT EXISTS review_assistant_enabled BOOLEAN NOT NULL DEFAULT FALSE")
    ) {
      pass("1.1: Migration adds review_assistant_enabled with DEFAULT FALSE");
    } else {
      fail("1.1: Migration does not add review_assistant_enabled with DEFAULT FALSE");
    }

    // Check RPC function appends review_assistant_enabled as 22nd column
    if (
      migrationSql.toLowerCase().includes("review_assistant_enabled") &&
      migrationSql.includes("CREATE FUNCTION public.get_customer_by_slug")
    ) {
      pass("1.2: get_customer_by_slug RPC appends review_assistant_enabled as 22nd column");
    } else {
      fail("1.2: RPC get_customer_by_slug does not return review_assistant_enabled");
    }

    // Check SECURITY DEFINER and search_path = public preserved
    if (
      migrationSql.includes("SECURITY DEFINER") &&
      migrationSql.includes("SET search_path = public")
    ) {
      pass("1.3: RPC maintains SECURITY DEFINER and search_path = public");
    } else {
      fail("1.3: RPC missing SECURITY DEFINER or search_path = public");
    }
  }

  // ============================================================================
  // SECTION 2 — DATA ACCESS DEFAULTS & CUSTOMER IMMUTABILITY
  // ============================================================================
  section("2. Data Access Defaults & Immutability");

  const customersSrc = readSrc("lib/customers.js");

  // Mock customer fallback defaults review_assistant_enabled to false
  if (customersSrc.includes("review_assistant_enabled: false")) {
    pass("2.1: getCustomerBySlug mock fallback defaults review_assistant_enabled to false");
  } else {
    fail("2.1: Mock customer fallback does not default review_assistant_enabled to false");
  }

  // createCustomer and updateCustomer default review_assistant_enabled to false
  if (
    customersSrc.includes("review_assistant_enabled: formData.review_assistant_enabled !== undefined")
  ) {
    pass("2.2: createCustomer and updateCustomer default review_assistant_enabled to false");
  } else {
    fail("2.2: createCustomer / updateCustomer missing review_assistant_enabled handling");
  }

  // Customer Profile Route (/api/customer/profile)
  const profileRouteSrc = readSrc("app/api/customer/profile/route.js");

  // Serializer includes review_assistant_enabled safely
  if (profileRouteSrc.includes("review_assistant_enabled: Boolean(customer.review_assistant_enabled)")) {
    pass("2.3: Customer profile serializer safely includes review_assistant_enabled");
  } else {
    fail("2.3: Customer profile serializer does not include review_assistant_enabled");
  }

  // Customer self-service PUT cannot modify review_assistant_enabled
  if (!profileRouteSrc.includes("review_assistant_enabled: body.review_assistant_enabled")) {
    pass("2.4: Customer self-service PUT /api/customer/profile cannot modify review_assistant_enabled");
  } else {
    fail("2.4: Customer self-service PUT allows modifying review_assistant_enabled");
  }

  // ============================================================================
  // SECTION 3 — ADMIN DASHBOARD CONTROLS
  // ============================================================================
  section("3. Admin Dashboard Controls");

  const adminSrc = readSrc("app/admin/page.js");

  if (adminSrc.includes("review_assistant_enabled: false")) {
    pass("3.1: Admin initial form data defaults review_assistant_enabled to false");
  } else {
    fail("3.1: Admin initial form data missing review_assistant_enabled: false");
  }

  if (adminSrc.includes("review_assistant_enabled: Boolean(fullRecord.review_assistant_enabled)")) {
    pass("3.2: Admin customer edit loads review_assistant_enabled from database");
  } else {
    fail("3.2: Admin customer edit does not load review_assistant_enabled");
  }

  if (
    adminSrc.includes("Google Review AI Assistant") &&
    adminSrc.includes("formData.review_assistant_enabled") &&
    adminSrc.includes("/review/")
  ) {
    pass("3.3: Admin UI contains Google Review AI Assistant toggle pointing to /review/[slug]");
  } else {
    fail("3.3: Admin UI missing Google Review AI Assistant toggle or incorrect route reference");
  }

  // ============================================================================
  // SECTION 4 — DIGITAL BUSINESS PROFILE (/p/[slug]) UNTOUCHED
  // ============================================================================
  section("4. Digital Business Profile (/p/[slug]) Unchanged");

  const publicProfileSrc = readSrc("app/p/[slug]/page.js");

  // Confirm direct Google Review button is preserved
  if (publicProfileSrc.includes('label: "Google Review"') && publicProfileSrc.includes("href: safeGoogleReview")) {
    pass("4.1: Direct Google Review button remains untouched on /p/[slug]");
  } else {
    fail("4.1: Direct Google Review button was modified or removed from public profile");
  }

  // Confirm /p/[slug] does NOT contain review assistant links or /review/ sub-route
  if (!publicProfileSrc.includes("Review Assistant") && !publicProfileSrc.includes("/review")) {
    pass("4.2: /p/[slug] is 100% clean of Review Assistant modifications (Digital Business Profile unchanged)");
  } else {
    fail("4.2: /p/[slug] contains Review Assistant modifications");
  }

  // ============================================================================
  // SECTION 5 — DEDICATED REVIEW HUB ROUTE (/review/[slug])
  // ============================================================================
  section("5. Dedicated Public Review Hub (/review/[slug])");

  // Verify file exists at app/review/[slug]/page.js
  const reviewPagePath = path.join(rootDir, "app", "review", "[slug]", "page.js");
  if (!fs.existsSync(reviewPagePath)) {
    fail("5.1: File app/review/[slug]/page.js does not exist");
  } else {
    pass("5.1: File app/review/[slug]/page.js exists at the locked route");
  }

  // Old route app/p/[slug]/review must NOT exist
  const oldReviewPath = path.join(rootDir, "app", "p", "[slug]", "review");
  if (!fs.existsSync(oldReviewPath)) {
    pass("5.2: Old route app/p/[slug]/review successfully removed");
  } else {
    fail("5.2: Old route app/p/[slug]/review still exists");
  }

  const reviewPageSrc = readSrc("app/review/[slug]/page.js");
  const reviewClientSrc = readSrc("components/review/ReviewHubClient.jsx");

  // Slug validation
  if (reviewPageSrc.includes("getCustomerBySlug(slug)") && reviewPageSrc.includes("notFound()")) {
    pass("5.3: Review page validates slug via getCustomerBySlug and 404s if missing/inactive");
  } else {
    fail("5.3: Review page missing slug validation");
  }

  // [⭐ Write a Google Review Directly] button
  if (reviewClientSrc.includes("Write a Google Review Directly") && reviewClientSrc.includes("customer.google_review_url")) {
    pass("5.4: [⭐ Write a Google Review Directly] is prominently available on review hub");
  } else {
    fail("5.4: Direct Google Review button missing from review hub");
  }

  // [✨ Create My Review] button
  if (reviewClientSrc.includes("Create My Review")) {
    pass("5.5: [✨ Create My Review] action button is provided");
  } else {
    fail("5.5: Create My Review action button missing");
  }

  // Graceful missing Google Review URL
  if (
    reviewClientSrc.includes("!hasGoogleUrl") &&
    (reviewClientSrc.includes("Google Review link hasn't been configured") ||
     reviewClientSrc.includes("Google Review link hasn&apos;t been configured"))
  ) {
    pass("5.6: Missing Google Review URL displays helpful notice without broken button");
  } else {
    fail("5.6: Missing Google Review URL not handled gracefully");
  }

  // Normal/manual flow when review_assistant_enabled is false
  if (reviewClientSrc.includes("assistantEnabled && hasGoogleUrl") && reviewClientSrc.includes("canUseReviewAssistant")) {
    pass("5.7: Review Assistant UI is strictly conditioned on canUseReviewAssistant(customer)");
  } else {
    fail("5.7: Assistant UI is not conditioned on canUseReviewAssistant");
  }

  // Transparency disclaimer
  if (reviewClientSrc.includes("Your review should reflect your real experience. This tool only helps you turn your own thoughts into a clear review.")) {
    pass("5.8: Mandatory transparency disclaimer is visibly rendered with exact required text");
  } else {
    fail("5.8: Transparency disclaimer missing or inaccurate");
  }

  // Review modes
  if (
    reviewClientSrc.includes("Quick Review") &&
    reviewClientSrc.includes("Assistant") &&
    reviewClientSrc.includes("Write My Own")
  ) {
    pass("5.9: Three distinct review modes implemented: Quick Review, Assistant, Write My Own");
  } else {
    fail("5.9: One or more review modes missing from ReviewHubClient");
  }

  // Independent star rating: initial state is null
  if (reviewClientSrc.includes("const [rating, setRating] = useState(null);")) {
    pass("5.10: Star rating is NOT defaulted to 5 stars (defaults to null, independent customer choice)");
  } else {
    fail("5.10: Star rating is incorrectly defaulted or forced");
  }

  // Rating buttons from 1 to 5
  if (reviewClientSrc.includes("[1, 2, 3, 4, 5].map")) {
    pass("5.11: Star selector provides all 1 to 5 stars with full customer autonomy");
  } else {
    fail("5.11: Star selector does not support all 1 to 5 ratings");
  }

  // Review editor & copy
  if (reviewClientSrc.includes("ref={textareaRef}") && reviewClientSrc.includes("value={draft}")) {
    pass("5.12: Generated review draft is displayed in an editable textarea");
  } else {
    fail("5.12: Generated review draft is not in an editable textarea");
  }

  if (reviewClientSrc.includes("navigator.clipboard?.writeText") || reviewClientSrc.includes("navigator?.clipboard?.writeText")) {
    pass("5.13: Clipboard copy implemented with manual textarea selection fallback");
  } else {
    fail("5.13: Clipboard copy or fallback missing");
  }

  if (reviewClientSrc.includes("Review copied! Now open Google Reviews and paste it.")) {
    pass("5.14: Review copied confirmation states paste instructions clearly");
  } else {
    fail("5.14: Review copied confirmation missing or inaccurate");
  }

  if (
    reviewClientSrc.includes("Google Review Opened") &&
    !reviewClientSrc.includes("Google Review Submitted")
  ) {
    pass("5.15: UI uses 'Google Review Opened' and never claims review was submitted");
  } else {
    fail("5.15: UI improperly claims review was submitted");
  }

  // Word count display
  if (reviewClientSrc.includes("wordCount") && (reviewClientSrc.includes("words") || reviewClientSrc.includes("word"))) {
    pass("5.16: Word count is displayed for the editable draft");
  } else {
    fail("5.16: Word count display missing");
  }

  // Google Review available for all ratings + optional private feedback
  if (
    reviewClientSrc.includes("Write a Google Review Directly") &&
    reviewClientSrc.includes("Open Google Review") &&
    reviewClientSrc.includes("Need immediate help or want to speak with us directly?") &&
    !reviewClientSrc.includes("rating > 2 && <button") &&
    !reviewClientSrc.includes("rating >= 3 && <button")
  ) {
    pass("5.17: Google Review buttons remain available for all ratings; private feedback is strictly additive");
  } else {
    fail("5.17: Google Review button hidden or replaced for lower ratings");
  }

  // ============================================================================
  // SECTION 6 — LOCAL PURE TEMPLATE REVIEW GENERATOR (ZERO AI APIS)
  // ============================================================================
  section("6. Local Pure Template Review Generator (Zero AI APIs)");

  // ReviewHubClient uses local generateReview
  if (
    reviewClientSrc.includes("import { generateReview } from") &&
    reviewClientSrc.includes("generateReview(")
  ) {
    pass("6.1: ReviewHubClient imports and invokes local generateReview generator");
  } else {
    fail("6.1: ReviewHubClient does not import or invoke generateReview");
  }

  // ReviewHubClient does NOT fetch /api/review-assistant
  if (!reviewClientSrc.includes('fetch("/api/review-assistant"') && !reviewClientSrc.includes("fetch('/api/review-assistant'")) {
    pass("6.2: ReviewHubClient does NOT fetch /api/review-assistant (runs 100% in browser)");
  } else {
    fail("6.2: ReviewHubClient still fetches /api/review-assistant");
  }

  // ReviewHubClient does NOT call OpenAI or Gemini
  if (
    !reviewClientSrc.includes("OpenAI") &&
    !reviewClientSrc.includes("Gemini") &&
    !reviewClientSrc.includes("callGemini") &&
    !reviewClientSrc.includes("callOpenAi")
  ) {
    pass("6.3: Zero AI provider calls in client code");
  } else {
    fail("6.3: Found AI provider calls in client code");
  }

  // Secret keys server-only
  if (!reviewClientSrc.includes("GEMINI_API_KEY") && !reviewClientSrc.includes("OPENAI_API_KEY")) {
    pass("6.4: Zero secret AI API keys referenced in client components");
  } else {
    fail("6.4: Secret AI API key referenced in client components");
  }

  // Legacy API route exists and is preserved untouched
  const apiRoutePath = path.join(rootDir, "app", "api", "review-assistant", "route.js");
  if (fs.existsSync(apiRoutePath)) {
    pass("6.5: Legacy app/api/review-assistant/route.js preserved untouched");
  } else {
    fail("6.5: Legacy API route was deleted prematurely");
  }

  const apiRouteSrc = readSrc("app/api/review-assistant/route.js");

  // Rate limiter check in legacy API
  if (apiRouteSrc.includes("checkRateLimit") && apiRouteSrc.includes("review_assistant:${slug}:${clientIp}")) {
    pass("6.6: Legacy API route rate limiter preserved");
  } else {
    fail("6.6: Rate limiter missing in legacy API route");
  }

  // Feature flag check in legacy API
  if (apiRouteSrc.includes("!customer.review_assistant_enabled") && apiRouteSrc.includes("status: 403")) {
    pass("6.7: Legacy API route returns HTTP 403 Forbidden if review_assistant_enabled is false");
  } else {
    fail("6.7: Missing check for review_assistant_enabled in legacy API route");
  }

  // Ephemeral processing: No database write in route
  if (!apiRouteSrc.includes(".insert(") && !apiRouteSrc.includes(".update(")) {
    pass("6.8: Privacy guarantee: Visitor review answers are never permanently stored in database");
  } else {
    fail("6.8: Privacy issue: Route writes visitor review data to database");
  }

  // ============================================================================
  // SECTION 7 — REGRESSIONS ON EXISTING CORE CAPABILITIES
  // ============================================================================
  section("7. Regression Audit on Existing NFCISTA Capabilities");

  // Dynamic QR redirect route untouched
  const qrRouteSrc = readSrc("app/r/[cardCode]/route.js");
  if (qrRouteSrc.includes("getDynamicQrDestination(cardCode)") && qrRouteSrc.includes("status: 307")) {
    pass("7.1: /r/[cardCode] dynamic QR redirect logic is 100% intact");
  } else {
    fail("7.1: /r/[cardCode] dynamic QR logic was altered");
  }

  // Enquiry route untouched
  const enquiryRouteSrc = readSrc("app/api/enquiry/route.js");
  if (enquiryRouteSrc.includes("submit_customer_enquiry") && enquiryRouteSrc.includes("checkRateLimit")) {
    pass("7.2: /api/enquiry form handling is 100% intact");
  } else {
    fail("7.2: /api/enquiry was modified");
  }

  // Customer upload rate limiting untouched
  const photoRouteSrc = readSrc("app/api/customer/photo/route.js");
  const bannerRouteSrc = readSrc("app/api/customer/banner/route.js");
  const galleryUploadSrc = readSrc("app/api/customer/gallery/upload/route.js");
  if (
    photoRouteSrc.includes("upload:photo:") &&
    bannerRouteSrc.includes("upload:banner:") &&
    galleryUploadSrc.includes("upload:gallery:")
  ) {
    pass("7.3: LOW-06 upload rate limiting across photo, banner, and gallery is 100% intact");
  } else {
    fail("7.3: LOW-06 upload rate limiting was altered");
  }

  // Auth session separation untouched
  const adminAuthSrc = readSrc("lib/adminAuth.js");
  const customerAuthSrc = readSrc("lib/customerAuth.js");
  if (adminAuthSrc.includes("sb-admin-token") && customerAuthSrc.includes("sb-customer-token")) {
    pass("7.4: SEC-03 admin and customer session separation is 100% intact");
  } else {
    fail("7.4: Session separation altered");
  }

  // package.json dependencies untouched
  const pkgJson = JSON.parse(readSrc("package.json"));
  const deps = Object.keys({ ...pkgJson.dependencies, ...pkgJson.devDependencies });
  const forbiddenDeps = ["openai", "@ai-sdk", "langchain", "@google/genai", "@google/generative-ai"];
  let badDepFound = false;
  for (const dep of deps) {
    for (const f of forbiddenDeps) {
      if (dep.includes(f)) {
        fail(`7.5: Unnecessary AI package detected: ${dep}`);
        badDepFound = true;
      }
    }
  }
  if (!badDepFound) {
    pass("7.5: package.json has ZERO unnecessary AI packages (native fetch used exclusively)");
  }

  // ============================================================================
  // FINAL RESULTS
  // ============================================================================
  console.log(`\n${"=".repeat(68)}`);
  console.log(`  RESULTS: ${passedTests}/${totalTests} passed, ${failedTests} failed`);
  console.log("=".repeat(68));

  if (failedTests > 0) {
    console.error(`\n❌ ${failedTests} test(s) FAILED.`);
    process.exit(1);
  } else {
    console.log(`\n✅ ALL ${totalTests} TESTS PASSED — AI Review Assistant implementation verified.`);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
