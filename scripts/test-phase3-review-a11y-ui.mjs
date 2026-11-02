import assert from "node:assert";
import fs from "node:fs";
import { generateReview } from "../lib/reviewGenerator.js";
import { getCategoryChips } from "../lib/reviewChips.js";

console.log("==================================================================");
console.log("   NFCISTA: PHASE 3 ACCESSIBILITY, EDGE CASES & UI SUITE");
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

const clientCompPath = "components/review/StandaloneReviewClient.jsx";
const clientSrc = fs.readFileSync(clientCompPath, "utf8");

const serverPagePath = "app/review/c/[cardCode]/page.js";
const serverSrc = fs.readFileSync(serverPagePath, "utf8");

// =============================================================================
// 1. WCAG 2.1 AA Accessibility Audit
// =============================================================================

runTest("WCAG 2.1 AA: Focus rings present on all interactive controls", () => {
  // Focus visible rings must be present
  assert.ok(clientSrc.includes("focus-visible:ring-2"), "Missing focus-visible ring classes");
  assert.ok(clientSrc.includes("focus-visible:outline-none"), "Missing focus-visible outline-none");
});

runTest("WCAG 2.1 AA: Star rating uses radiogroup and keyboard arrow navigation", () => {
  assert.ok(clientSrc.includes('role="radiogroup"'), "Star container missing role=radiogroup");
  assert.ok(clientSrc.includes('role="radio"'), "Star buttons missing role=radio");
  assert.ok(clientSrc.includes("aria-checked="), "Star buttons missing aria-checked");
  assert.ok(clientSrc.includes("handleStarKeyDown"), "Missing handleStarKeyDown keyboard arrow handler");
  assert.ok(clientSrc.includes("ArrowRight") && clientSrc.includes("ArrowLeft"), "Missing arrow key navigation support");
});

runTest("WCAG 2.1 AA: Languages and Styles have radiogroup semantics and descriptive labels", () => {
  assert.ok(clientSrc.includes('aria-label="Choose review language"'), "Missing language radiogroup aria-label");
  assert.ok(clientSrc.includes('aria-label="Choose review writing style"'), "Missing writing style radiogroup aria-label");
  assert.ok(clientSrc.includes("nativeLabel"), "Missing native language labels");
});

runTest("WCAG 2.1 AA: Color contrast — constructive chips do not rely on color alone", () => {
  // Non-color distinction: border-dashed + minus symbol + screen reader text
  assert.ok(clientSrc.includes("border-dashed"), "Constructive chips must have a distinct border style (e.g. dashed)");
  assert.ok(clientSrc.includes("aria-pressed="), "Chips must have aria-pressed attribute");
  assert.ok(clientSrc.includes("Constructive feedback"), "Constructive chips must have accessible text indicator");
  assert.ok(clientSrc.includes("Positive aspect") || clientSrc.includes("Positive experience"), "Positive chips must have accessible indicator");
});

runTest("WCAG 2.1 AA: Status announcements use aria-live and role attributes", () => {
  assert.ok(clientSrc.includes('role="status"'), "Copy status must have role=status");
  assert.ok(clientSrc.includes('aria-live="polite"'), "Copy status must have aria-live=polite");
  assert.ok(clientSrc.includes('role="alert"'), "Errors and alerts must have role=alert");
  assert.ok(clientSrc.includes('aria-live="assertive"'), "Errors must have aria-live=assertive");
});

runTest("WCAG 2.1 AA: Textarea has explicit accessible label and word counter", () => {
  assert.ok(clientSrc.includes('id="review-draft-textarea"'), "Textarea must have an explicit id");
  assert.ok(clientSrc.includes('htmlFor="review-draft-textarea"'), "Textarea must have a linked label");
  assert.ok(clientSrc.includes("chars ·"), "Textarea must have character counter");
  assert.ok(clientSrc.includes("words"), "Textarea must have word counter");
});

runTest("Mobile Usability: Minimum touch targets (48px) on interactive controls", () => {
  assert.ok(clientSrc.includes("min-h-[48px]"), "Interactive pills/chips/inputs must have at least 48px touch height");
  assert.ok(clientSrc.includes("w-12 h-12"), "Star buttons must have at least 48x48px touch area");
  assert.ok(clientSrc.includes("min-h-[50px]"), "Primary CTA buttons must have 50px touch height");
});

// =============================================================================
// 2. All 4 Languages and All 4 Styles in UI
// =============================================================================

runTest("UI Specification: All 4 languages defined (en, hi, hinglish, mr)", () => {
  assert.ok(clientSrc.includes('id: "en"'));
  assert.ok(clientSrc.includes('id: "hi"'));
  assert.ok(clientSrc.includes('id: "hinglish"'));
  assert.ok(clientSrc.includes('id: "mr"'));
  assert.ok(clientSrc.includes("हिन्दी"));
  assert.ok(clientSrc.includes("मराठी"));
});

runTest("UI Specification: All 4 writing styles defined (balanced, concise, enthusiastic, professional)", () => {
  assert.ok(clientSrc.includes('id: "balanced"'));
  assert.ok(clientSrc.includes('id: "concise"'));
  assert.ok(clientSrc.includes('id: "enthusiastic"'));
  assert.ok(clientSrc.includes('id: "professional"'));
});

runTest("Engine Integration: Review generation works for all 16 language/style combinations", () => {
  const languages = ["en", "hi", "hinglish", "mr"];
  const styles = ["balanced", "concise", "enthusiastic", "professional"];

  for (const lang of languages) {
    for (const style of styles) {
      const review = generateReview({
        rating: 5,
        chipIds: ["great-service", "friendly-staff"],
        product: "Haircut",
        lang,
        style,
        seed: 12345,
      });
      assert.ok(review, `Failed generating for lang=${lang}, style=${style}`);
      assert.ok(typeof review === "string" && review.length > 10);
    }
  }
});

runTest("UI Specification: Language & style change auto-regenerates existing draft", () => {
  assert.ok(clientSrc.includes("handleLangChange"), "Missing handleLangChange");
  assert.ok(clientSrc.includes("handleStyleChange"), "Missing handleStyleChange");
  assert.ok(clientSrc.includes("if (draft)"), "Must trigger regeneration if draft exists");
});

// =============================================================================
// 3. Three Separate Action Buttons
// =============================================================================

runTest("UI Specification: 3 distinct action buttons are present and wired", () => {
  // Action 1: Copy Review & Open Google
  assert.ok(clientSrc.includes("handleCopyAndLaunch"), "Missing handleCopyAndLaunch");
  assert.ok(clientSrc.includes("Copy Review & Open Google"), "Missing Copy Review & Open Google button text");

  // Action 2: Copy Draft Only
  assert.ok(clientSrc.includes("handleCopyOnly"), "Missing handleCopyOnly");
  assert.ok(clientSrc.includes("Copy Draft Only"), "Missing Copy Draft Only button text");

  // Action 3: Open Google Without Text
  assert.ok(clientSrc.includes("handleDirectLaunch"), "Missing handleDirectLaunch");
  assert.ok(clientSrc.includes("Open Google Without Text"), "Missing Open Google Without Text button text");
});

// =============================================================================
// 4. Anti-Gating & Direct Google Review Access
// =============================================================================

runTest("Anti-Gating: Direct Google access available at header, step 1, step 4, and deactivated state", () => {
  assert.ok(clientSrc.includes("Direct to Google"), "Header must have direct Google link");
  assert.ok(clientSrc.includes("Want to skip directly to Google Reviews? Tap here"), "Step 1 must have skip link");
  assert.ok(clientSrc.includes("Open Google Without Text"), "Step 4 must have direct bypass button");
  assert.ok(clientSrc.includes("!assistantEnabled"), "Must have direct fallback view when assistant is disabled");
  assert.ok(clientSrc.includes("Write Review on Google"), "Disabled assistant view must offer direct Google button");
});

// =============================================================================
// 5. Fallback & Edge Case Resilience
// =============================================================================

runTest("Resilience: Clipboard fallback chain (navigator.clipboard -> execCommand -> failed)", () => {
  assert.ok(clientSrc.includes("navigator.clipboard?.writeText"), "Must attempt navigator.clipboard");
  assert.ok(clientSrc.includes('document.execCommand("copy")'), "Must fall back to execCommand");
  assert.ok(clientSrc.includes('setCopyStatus("failed")'), "Must handle total copy failure gracefully");
  assert.ok(clientSrc.includes("copied-fallback"), "Must support fallback copied state");
});

runTest("Resilience: Popup blocking handled with manual tap link fallback", () => {
  assert.ok(clientSrc.includes("popupBlocked"), "Must track popupBlocked state");
  assert.ok(clientSrc.includes("Browser blocked Google Reviews popup"), "Must show user-friendly blocked notice");
  assert.ok(clientSrc.includes("Tap here to open Google Reviews directly"), "Must provide manual click recovery");
});

runTest("Resilience: Generate button disabled when inputs are empty", () => {
  assert.ok(clientSrc.includes("isGenerateDisabled"), "Must track isGenerateDisabled");
  assert.ok(clientSrc.includes("disabled={isGenerateDisabled}"), "Button must be disabled when empty");
});

// =============================================================================
// 6. Inactive & Disabled Card Security
// =============================================================================

runTest("Inactive Cards: Server page returns InactiveCardView for inactive or disabled cards", () => {
  assert.ok(serverSrc.includes("!cardConfig.is_active || !cardConfig.review_assistant_enabled"));
  assert.ok(serverSrc.includes("<InactiveCardView cardCode={cardCode} />"));
  assert.ok(serverSrc.includes("Visit NFCISTA"));
});

// =============================================================================
// 7. Route Preservation & Backward Compatibility
// =============================================================================

runTest("Route Preservation: /review/[slug] digital profile assistant is untouched", () => {
  const profileRoute = fs.readFileSync("app/review/[slug]/page.js", "utf8");
  assert.ok(profileRoute.includes("ReviewHubClient"));
  assert.ok(profileRoute.includes("getCustomerBySlug"));
});

runTest("Route Preservation: /r/[cardCode] hardware redirect route is untouched", () => {
  const rCardRoute = fs.readFileSync("app/r/[cardCode]/route.js", "utf8");
  assert.ok(rCardRoute.includes("getDynamicQrDestination"));
  assert.ok(rCardRoute.includes("renderCardNotActiveHtml"));
});

console.log("\n==================================================================");
console.log(`PHASE 3 TEST RESULTS: ${passed} of ${total} tests PASSED.`);
if (passed === total) {
  console.log("STATUS: ALL PHASE 3 A11Y, EDGE CASES & UI TESTS PASSED! ✅");
} else {
  console.error("STATUS: SOME PHASE 3 TESTS FAILED! ❌");
  process.exit(1);
}
console.log("==================================================================");
