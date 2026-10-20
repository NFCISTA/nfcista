/**
 * Test Suite: Pure Template-Based Review Generator & Chips
 *
 * Verifies:
 * 1. Pure function & zero browser/server dependencies (no fetch, supabase, window, localStorage)
 * 2. Empty input & product-alone rule (returns null)
 * 3. English generation with chips, product, note, recommendation, rating
 * 4. Hinglish generation with strict gender-neutrality (NO aaya/aayi, tha/thi, karunga/karungi, raha/rahi, gaya/gayi)
 * 5. Product lowercasing in generated sentence
 * 6. Industry chip mapping (salon, restaurant, clinic, retail, generic) & negative chips present in all sets
 * 7. Deterministic seed output & regeneration with new seed
 * 8. canUseReviewAssistant entitlement helper
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateReview } from "../lib/reviewGenerator.js";
import {
  findChip,
  getCategoryChips,
  GENERIC_CHIPS,
  SALON_CHIPS,
  RESTAURANT_CHIPS,
  CLINIC_CHIPS,
  RETAIL_CHIPS,
} from "../lib/reviewChips.js";
import { canUseReviewAssistant } from "../lib/reviewAssistant.js";

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
  return fs.readFileSync(path.join(rootDir, relPath), "utf-8");
}

async function runTests() {
  console.log("=== NFCISTA TEMPLATE REVIEW GENERATOR COMPREHENSIVE TEST SUITE ===");

  // ============================================================================
  // SECTION 1 — PURITY & INDEPENDENCE (ZERO DEPENDENCIES)
  // ============================================================================
  section("1. Purity & Independence");

  const genSrc = readSrc("lib/reviewGenerator.js");
  const chipsSrc = readSrc("lib/reviewChips.js");
  const assistSrc = readSrc("lib/reviewAssistant.js");

  // Check no fetch / API / Supabase
  if (!genSrc.includes("fetch(") && !chipsSrc.includes("fetch(") && !assistSrc.includes("fetch(")) {
    pass("1.1: Zero fetch calls across generator, chips, and assistant helper");
  } else {
    fail("1.1: Found fetch call in generator modules");
  }

  if (!genSrc.includes("supabase") && !chipsSrc.includes("supabase") && !assistSrc.includes("supabase")) {
    pass("1.2: Zero Supabase dependencies in generator modules");
  } else {
    fail("1.2: Found Supabase import in generator modules");
  }

  if (
    !genSrc.includes("localStorage") &&
    !genSrc.includes("window.") &&
    !genSrc.includes("document.") &&
    !genSrc.includes("navigator.")
  ) {
    pass("1.3: Zero browser globals in reviewGenerator.js (runs anywhere)");
  } else {
    fail("1.3: Found browser global references in reviewGenerator.js");
  }

  // ============================================================================
  // SECTION 2 — EMPTY INPUT & PRODUCT-ALONE BEHAVIOR
  // ============================================================================
  section("2. Empty Input & Validation Rules");

  // 2.1: Empty object returns null
  if (generateReview({}) === null) {
    pass("2.1: Empty input object returns null");
  } else {
    fail("2.1: Empty input object did not return null");
  }

  // 2.2: Product alone returns null (matches empty input rule)
  if (generateReview({ product: "Haircut" }) === null) {
    pass("2.2: Product alone without any feedback returns null");
  } else {
    fail("2.2: Product alone should return null");
  }

  // 2.3: Product with uppercase alone returns null
  if (generateReview({ product: "FULL BODY MASSAGE" }) === null) {
    pass("2.3: Product alone (uppercase) returns null");
  } else {
    fail("2.3: Product alone (uppercase) should return null");
  }

  // 2.4: Rating alone without any chips, note, product, or recommend returns null
  if (generateReview({ rating: 5 }) === null) {
    pass("2.4: Rating alone without any feedback detail returns null");
  } else {
    fail("2.4: Rating alone should return null to require actual experience detail");
  }

  // ============================================================================
  // SECTION 3 — GENERATION WITH VALID INPUTS
  // ============================================================================
  section("3. Generation with Valid Inputs");

  // 3.1: Chip input alone generates string
  const chipOnlyResult = generateReview({ chipIds: ["gen_clean"] });
  if (typeof chipOnlyResult === "string" && chipOnlyResult.length > 0) {
    pass("3.1: Chip input alone generates a non-empty string");
  } else {
    fail("3.1: Chip input alone did not generate a string");
  }

  // 3.2: Note input alone generates string
  const noteOnlyResult = generateReview({ note: "Great service and very satisfied" });
  if (typeof noteOnlyResult === "string" && noteOnlyResult.includes("Great service and very satisfied")) {
    pass("3.2: Note input alone generates a valid string containing the note");
  } else {
    fail("3.2: Note input alone did not generate expected string");
  }

  // 3.3: Product + Chip generates string with lowercased product
  const prodChipResult = generateReview({
    product: "Haircut",
    chipIds: ["salon_skilled"],
    lang: "en",
    seed: 42,
  });
  if (
    typeof prodChipResult === "string" &&
    prodChipResult.includes("haircut") &&
    !prodChipResult.includes("Haircut")
  ) {
    pass("3.3: Product name 'Haircut' is lowercased to 'haircut' in generated sentence");
  } else {
    fail("3.3: Product name was not lowercased in output", prodChipResult);
  }

  // 3.4: ALL CAPS product is properly lowercased
  const capsResult = generateReview({
    product: "FULL BODY MASSAGE",
    chipIds: ["gen_clean"],
    lang: "en",
  });
  if (
    typeof capsResult === "string" &&
    capsResult.includes("full body massage") &&
    !capsResult.includes("FULL BODY MASSAGE")
  ) {
    pass("3.4: ALL CAPS product 'FULL BODY MASSAGE' is lowercased to 'full body massage'");
  } else {
    fail("3.4: All-caps product was not lowercased", capsResult);
  }

  // 3.5: Recommendation insertion
  const recYesResult = generateReview({
    chipIds: ["gen_friendly"],
    recommend: "yes",
    lang: "en",
  });
  if (typeof recYesResult === "string" && /recommend/i.test(recYesResult)) {
    pass("3.5: Positive recommendation phrase is included in generated text");
  } else {
    fail("3.5: Positive recommendation phrase missing");
  }

  const recNoResult = generateReview({
    chipIds: ["gen_wait"],
    recommend: "no",
    lang: "en",
  });
  if (typeof recNoResult === "string" && /(not recommend|cannot recommend|do not recommend)/i.test(recNoResult)) {
    pass("3.6: Negative recommendation phrase is included in generated text");
  } else {
    fail("3.6: Negative recommendation phrase missing");
  }

  // ============================================================================
  // SECTION 4 — GENDER-NEUTRAL HINGLISH VERIFICATION
  // ============================================================================
  section("4. Gender-Neutral Hinglish Verification");

  // Gendered word patterns that must NOT appear in any Hinglish output:
  const forbiddenPattern = /\b(aaya|aayi|karunga|karungi|aaunga|aaungi|gaya|gayi|raha|rahi|tha|thi)\b/i;

  // 4.1: Test Hinglish output across multiple seeds and inputs
  let genderedFound = false;
  let sampleHinglish = "";

  const allChipIds = [
    ...GENERIC_CHIPS,
    ...SALON_CHIPS,
    ...RESTAURANT_CHIPS,
    ...CLINIC_CHIPS,
    ...RETAIL_CHIPS,
  ].map((c) => c.id);

  // Test individual chips in Hinglish
  for (const chipId of allChipIds) {
    for (let s = 0; s < 10; s++) {
      const output = generateReview({
        chipIds: [chipId],
        product: "Service",
        note: "Kaam achha laga",
        recommend: s % 2 === 0 ? "yes" : "no",
        rating: (s % 5) + 1,
        lang: "hi",
        seed: s * 137,
      });

      if (output && forbiddenPattern.test(output)) {
        genderedFound = true;
        const match = output.match(forbiddenPattern);
        fail(`4.1: Gendered word '${match[0]}' found in Hinglish output: "${output}"`);
        break;
      }
      if (!sampleHinglish) sampleHinglish = output;
    }
    if (genderedFound) break;
  }

  if (!genderedFound) {
    pass("4.1: Zero gendered Hinglish words across all chip sets, ratings, products, and seeds");
  }

  // 4.2: Inspect all phrases in lib/reviewChips.js directly
  let chipPhraseGendered = false;
  const allChips = [
    ...GENERIC_CHIPS,
    ...SALON_CHIPS,
    ...RESTAURANT_CHIPS,
    ...CLINIC_CHIPS,
    ...RETAIL_CHIPS,
  ];

  for (const chip of allChips) {
    for (const phrase of chip.phrases_hi) {
      if (forbiddenPattern.test(phrase)) {
        chipPhraseGendered = true;
        const match = phrase.match(forbiddenPattern);
        fail(`4.2: Gendered word '${match[0]}' in chip '${chip.id}' phrase: "${phrase}"`);
      }
    }
  }

  if (!chipPhraseGendered) {
    pass("4.2: All chip phrases_hi in reviewChips.js are 100% gender-neutral");
  }

  // ============================================================================
  // SECTION 5 — INDUSTRY CHIP MAPPING & NEGATIVE CHIPS
  // ============================================================================
  section("5. Industry Chip Mapping & Negative Chips");

  // 5.1: Category mapping checks
  const salonMap = getCategoryChips("Hair Salon & Spa");
  if (salonMap.industry === "salon" && salonMap.chips === SALON_CHIPS) {
    pass("5.1: 'Hair Salon & Spa' maps to salon chips");
  } else {
    fail("5.1: Salon category mapping failed");
  }

  const restMap = getCategoryChips("Italian Restaurant & Cafe");
  if (restMap.industry === "restaurant" && restMap.chips === RESTAURANT_CHIPS) {
    pass("5.2: 'Italian Restaurant & Cafe' maps to restaurant chips");
  } else {
    fail("5.2: Restaurant category mapping failed");
  }

  const clinicMap = getCategoryChips("Dental Clinic & Orthodontics");
  if (clinicMap.industry === "clinic" && clinicMap.chips === CLINIC_CHIPS) {
    pass("5.3: 'Dental Clinic & Orthodontics' maps to clinic chips");
  } else {
    fail("5.3: Clinic category mapping failed");
  }

  const retailMap = getCategoryChips("Fashion Clothing Store");
  if (retailMap.industry === "retail" && retailMap.chips === RETAIL_CHIPS) {
    pass("5.4: 'Fashion Clothing Store' maps to retail chips");
  } else {
    fail("5.4: Retail category mapping failed");
  }

  const genericMap = getCategoryChips("Digital Marketing Agency");
  if (genericMap.industry === "generic" && genericMap.chips === GENERIC_CHIPS) {
    pass("5.5: Unrecognized category maps to generic chips");
  } else {
    fail("5.5: Generic category fallback failed");
  }

  // 5.6: Negative chips available in EVERY industry set
  const industries = [
    { name: "Generic", chips: GENERIC_CHIPS },
    { name: "Salon", chips: SALON_CHIPS },
    { name: "Restaurant", chips: RESTAURANT_CHIPS },
    { name: "Clinic", chips: CLINIC_CHIPS },
    { name: "Retail", chips: RETAIL_CHIPS },
  ];

  let allHaveNegatives = true;
  for (const ind of industries) {
    const negs = ind.chips.filter((c) => c.sentiment === "negative");
    if (negs.length === 0) {
      allHaveNegatives = false;
      fail(`5.6: Industry '${ind.name}' is missing negative chips`);
    }
  }

  if (allHaveNegatives) {
    pass("5.6: Every industry chip set contains negative chips (negative feedback always supported)");
  }

  // 5.7: Negative chips produce valid negative reviews
  const negResult = generateReview({
    rating: 1,
    chipIds: ["gen_wait", "gen_staff_improve"],
    lang: "en",
  });
  if (typeof negResult === "string" && negResult.length > 0) {
    pass("5.7: Negative chips generate valid constructive negative review");
  } else {
    fail("5.7: Negative chips failed to generate review");
  }

  // ============================================================================
  // SECTION 6 — DETERMINISTIC SEED & REGENERATION
  // ============================================================================
  section("6. Deterministic Seed & Regeneration");

  const inputConfig = {
    rating: 5,
    chipIds: ["gen_friendly", "gen_quality"],
    product: "Consulting",
    lang: "en",
    seed: 123456,
  };

  const run1 = generateReview(inputConfig);
  const run2 = generateReview(inputConfig);

  if (run1 === run2) {
    pass("6.1: Deterministic output: calling generateReview with same seed produces identical text");
  } else {
    fail("6.1: Generator output was not deterministic for the same seed");
  }

  // Different seed produces different phrasing
  const runDifferent = generateReview({ ...inputConfig, seed: 9999999 });
  if (typeof runDifferent === "string" && runDifferent.length > 0) {
    pass("6.2: Regeneration with a new seed generates valid review draft");
  } else {
    fail("6.2: Regeneration failed");
  }

  // ============================================================================
  // SECTION 7 — canUseReviewAssistant HELPER
  // ============================================================================
  section("7. canUseReviewAssistant Helper");

  if (canUseReviewAssistant({ review_assistant_enabled: true, is_active: true }) === true) {
    pass("7.1: Returns true when review_assistant_enabled is true and active");
  } else {
    fail("7.1: Expected true for enabled customer");
  }

  if (canUseReviewAssistant({ review_assistant_enabled: false, is_active: true }) === false) {
    pass("7.2: Returns false when review_assistant_enabled is false");
  } else {
    fail("7.2: Expected false when disabled");
  }

  if (canUseReviewAssistant({ review_assistant_enabled: true, is_active: false }) === false) {
    pass("7.3: Returns false when customer is inactive even if feature is toggled on");
  } else {
    fail("7.3: Expected false for inactive customer");
  }

  if (canUseReviewAssistant(null) === false && canUseReviewAssistant({}) === false) {
    pass("7.4: Returns false for null or empty object");
  } else {
    fail("7.4: Expected false for invalid inputs");
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
    console.log(`\n✅ ALL ${totalTests} TESTS PASSED.`);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
