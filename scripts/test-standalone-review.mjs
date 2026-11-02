import assert from "node:assert";
import fs from "node:fs";
import {
  isValidReviewCardCode,
  normalizeCardCode,
  validateGoogleReviewUrl,
} from "../lib/reviewCards.js";

console.log("==================================================================");
console.log("   NFCISTA: STANDALONE REVIEW ASSISTANT VERIFICATION SUITE");
console.log("==================================================================");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
  }
}

// -----------------------------------------------------------------------------
// 1. Validation & Safeguard 1: Card Code and Google Review URL
// -----------------------------------------------------------------------------
runTest("Card Code syntax: validates valid 3-32 char alphanumeric codes", () => {
  assert.strictEqual(isValidReviewCardCode("NF8K29"), true);
  assert.strictEqual(isValidReviewCardCode("RC-SHOP-1"), true);
  assert.strictEqual(isValidReviewCardCode("GRC_102"), true);
  assert.strictEqual(normalizeCardCode("  nf8k29  "), "NF8K29");
});

runTest("Card Code syntax: rejects invalid codes", () => {
  assert.strictEqual(isValidReviewCardCode(""), false);
  assert.strictEqual(isValidReviewCardCode(null), false);
  assert.strictEqual(isValidReviewCardCode("AB"), false); // too short (<3)
  assert.strictEqual(isValidReviewCardCode("A".repeat(33)), false); // too long (>32)
  assert.strictEqual(isValidReviewCardCode("NF$#@!"), false); // special characters
});

runTest("Safeguard 1: Google Review URL validator accepts genuine Google review links", () => {
  const gPage = validateGoogleReviewUrl("https://g.page/r/CZZZ_test/review");
  assert.strictEqual(gPage.valid, true);
  assert.ok(gPage.normalizedUrl.includes("g.page"));

  const searchGoogle = validateGoogleReviewUrl(
    "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4"
  );
  assert.strictEqual(searchGoogle.valid, true);

  const mapsGoogle = validateGoogleReviewUrl("https://maps.google.com/?cid=1029384756");
  assert.strictEqual(mapsGoogle.valid, true);

  const gooGl = validateGoogleReviewUrl("https://goo.gl/maps/xyz123");
  assert.strictEqual(gooGl.valid, true);
});

runTest("Safeguard 1: Google Review URL validator strictly rejects malicious, deceptive or non-Google URLs", () => {
  assert.strictEqual(validateGoogleReviewUrl("").valid, false);
  assert.strictEqual(validateGoogleReviewUrl(null).valid, false);
  assert.strictEqual(validateGoogleReviewUrl("not-a-url").valid, false);
  assert.strictEqual(validateGoogleReviewUrl("javascript:alert(1)").valid, false);
  assert.strictEqual(validateGoogleReviewUrl("ftp://google.com/review").valid, false);
  assert.strictEqual(validateGoogleReviewUrl("https://phishing-site.com/fake-google").valid, false);
  
  // Deceptive domain checks (subdomain or suffix spoofing)
  assert.strictEqual(validateGoogleReviewUrl("https://evilgoogle.com/review").valid, false);
  assert.strictEqual(validateGoogleReviewUrl("https://attacker-google.com/writereview").valid, false);
  assert.strictEqual(validateGoogleReviewUrl("https://google.com.phishing.io/review").valid, false);
  assert.strictEqual(validateGoogleReviewUrl("https://fakeg.page/r/abc").valid, false);

  // Embedded credentials check
  assert.strictEqual(validateGoogleReviewUrl("https://admin:pass@google.com/maps").valid, false);

  // Generic root search homepage rejection
  assert.strictEqual(validateGoogleReviewUrl("https://google.com/").valid, false);
  assert.strictEqual(validateGoogleReviewUrl("https://www.google.com").valid, false);
});

// -----------------------------------------------------------------------------
// 2. Safeguard 2 & Schema: Migration inspection
// -----------------------------------------------------------------------------
const migrationPath = "supabase/migrations/20261101000000_create_review_cards.sql";
const migrationContent = fs.readFileSync(migrationPath, "utf8");

runTest("Migration: review_assistant_enabled defaults to FALSE (Mandatory requirement)", () => {
  assert.ok(
    migrationContent.includes("review_assistant_enabled BOOLEAN NOT NULL DEFAULT false"),
    "review_assistant_enabled must default to false"
  );
});

runTest("Migration: RLS enabled and direct table access denied from PUBLIC, anon, and non-admin authenticated", () => {
  assert.ok(migrationContent.includes("ALTER TABLE public.review_cards ENABLE ROW LEVEL SECURITY;"));
  assert.ok(
    migrationContent.includes("REVOKE ALL ON TABLE public.review_cards FROM PUBLIC, anon, authenticated;"),
    "Must revoke all table privileges from PUBLIC, anon, and authenticated"
  );
  assert.ok(migrationContent.includes('CREATE POLICY "Deny direct anon access to review_cards"'));
  assert.ok(migrationContent.includes("public.is_admin()"));
});

runTest("Migration: Public RPC get_review_card_config is SECURITY DEFINER with minimal projection", () => {
  assert.ok(migrationContent.includes("CREATE OR REPLACE FUNCTION public.get_review_card_config"));
  assert.ok(migrationContent.includes("SECURITY DEFINER"));
  assert.ok(migrationContent.includes("SET search_path = public"));
  assert.ok(migrationContent.includes("ALTER FUNCTION public.get_review_card_config(text) OWNER TO postgres;"));
  assert.ok(migrationContent.includes("r.is_active = true"));
  assert.ok(migrationContent.includes("r.review_assistant_enabled = true"), "RPC must filter for review_assistant_enabled = true");
  assert.ok(migrationContent.includes("REVOKE ALL ON FUNCTION public.get_review_card_config(text) FROM PUBLIC;"), "Must revoke execution from PUBLIC");
  assert.ok(migrationContent.includes("GRANT EXECUTE ON FUNCTION public.get_review_card_config(text) TO anon, authenticated, service_role;"));
});

// -----------------------------------------------------------------------------
// 3. Customer Route Protection Checks
// -----------------------------------------------------------------------------
const customerPagePath = "app/review/c/[cardCode]/page.js";
const customerPageContent = fs.readFileSync(customerPagePath, "utf8");

runTest("Customer Route: Inactive or disabled cards are protected and render InactiveCardView", () => {
  assert.ok(
    customerPageContent.includes("!cardConfig.is_active || !cardConfig.review_assistant_enabled"),
    "Server page must check both is_active and review_assistant_enabled"
  );
  assert.ok(customerPageContent.includes("<InactiveCardView cardCode={cardCode} />"));
});

// -----------------------------------------------------------------------------
// 3. Safeguard 3 & 4: Admin API checks
// -----------------------------------------------------------------------------
const adminApiPath = "app/api/admin/review-cards/route.js";
const adminApiContent = fs.readFileSync(adminApiPath, "utf8");

runTest("Admin API: protected with authenticateAdmin", () => {
  assert.ok(adminApiContent.includes("authenticateAdmin(request)"));
});

runTest("Admin API: Safeguard 4 - safe deletion protects active cards", () => {
  assert.ok(adminApiContent.includes("is_active && !force"));
  assert.ok(adminApiContent.includes("Cannot delete an active Review Card"));
});

runTest("Admin API: Safeguard 3 - cache invalidation triggered on mutations", () => {
  assert.ok(adminApiContent.includes("revalidateTag(`review-card:"));
});

// -----------------------------------------------------------------------------
// 4. Anti-Gating & Standalone UX Verification
// -----------------------------------------------------------------------------
const clientCompPath = "components/review/StandaloneReviewClient.jsx";
const clientCompContent = fs.readFileSync(clientCompPath, "utf8");

runTest("Standalone UX: Anti-gating direct Google review link present at all times", () => {
  assert.ok(clientCompContent.includes("Direct to Google"));
  assert.ok(clientCompContent.includes("window.open(googleUrl"));
});

runTest("Standalone UX: rating starts unselected (null)", () => {
  assert.ok(clientCompContent.includes("const [rating, setRating] = useState(null)"));
});

runTest("Standalone UX: reuses existing reviewGenerator and reviewChips", () => {
  assert.ok(clientCompContent.includes('import { generateReview } from "@/lib/reviewGenerator"'));
  assert.ok(clientCompContent.includes('import { getCategoryChips } from "@/lib/reviewChips"'));
});

// -----------------------------------------------------------------------------
// 5. Existing Routes Preserved
// -----------------------------------------------------------------------------
runTest("Route Preservation: /review/[slug] profile route intact and untouched", () => {
  const profileReviewPath = "app/review/[slug]/page.js";
  assert.ok(fs.existsSync(profileReviewPath));
  const content = fs.readFileSync(profileReviewPath, "utf8");
  assert.ok(content.includes("getCustomerBySlug"));
  assert.ok(content.includes("ReviewHubClient"));
});

runTest("Route Preservation: /r/[cardCode] hardware redirect route intact", () => {
  const rCardPath = "app/r/[cardCode]/route.js";
  assert.ok(fs.existsSync(rCardPath));
  const content = fs.readFileSync(rCardPath, "utf8");
  assert.ok(content.includes("getDynamicQrDestination"));
  assert.ok(content.includes("renderCardNotActiveHtml"));
});

// -----------------------------------------------------------------------------
// 6. Admin Navigation
// -----------------------------------------------------------------------------
const adminNavPath = "app/admin/layout.js";
const adminNavContent = fs.readFileSync(adminNavPath, "utf8");

runTest("Admin Navigation: contains link to /admin/review-cards", () => {
  assert.ok(adminNavContent.includes('/admin/review-cards'));
});

console.log("\n==================================================================");
console.log(`TEST RESULTS: ${passed} of ${total} tests PASSED.`);
if (passed === total) {
  console.log("STATUS: ALL STANDALONE REVIEW ASSISTANT TESTS PASSED PERFECTLY! ✅");
} else {
  console.error("STATUS: SOME TESTS FAILED! ❌");
  process.exit(1);
}
console.log("==================================================================");
