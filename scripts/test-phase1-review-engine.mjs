import assert from "node:assert";
import { generateReview } from "../lib/reviewGenerator.js";
import {
  findChip,
  getCategoryChips,
  GENERIC_CHIPS,
  SALON_CHIPS,
  RESTAURANT_CHIPS,
  CLINIC_CHIPS,
  RETAIL_CHIPS,
  FITNESS_CHIPS,
  AUTOMOTIVE_CHIPS,
  SERVICES_CHIPS,
  HOTEL_CHIPS,
} from "../lib/reviewChips.js";

console.log("==================================================================");
console.log("   NFCISTA: PHASE 1 MULTILINGUAL & MULTI-STYLE ENGINE VERIFICATION");
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
// 1. Validation & Fallbacks
// -----------------------------------------------------------------------------
runTest("Empty inputs return null", () => {
  assert.strictEqual(generateReview({}), null);
  assert.strictEqual(generateReview({ rating: null, chipIds: [] }), null);
  assert.strictEqual(generateReview({ product: "Coffee" }), null); // product alone
});

runTest("Invalid language code falls back to 'en' gracefully", () => {
  const result = generateReview({
    chipIds: ["gen_friendly"],
    lang: " klingon ",
    seed: 42,
  });
  assert.ok(typeof result === "string" && result.length > 0);
  assert.ok(/staff/i.test(result));
});

runTest("Invalid style code falls back to 'balanced' gracefully", () => {
  const result = generateReview({
    chipIds: ["gen_friendly"],
    style: "super_ultra_long",
    seed: 42,
  });
  assert.ok(typeof result === "string" && result.length > 0);
  assert.ok(/staff/i.test(result));
});

// -----------------------------------------------------------------------------
// 2. Multilingual Generation: English, Hindi, Hinglish, Marathi
// -----------------------------------------------------------------------------
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

runTest("English generation (en): produces clear English text", () => {
  const result = generateReview({
    rating: 5,
    chipIds: ["gen_friendly", "gen_quick"],
    lang: "en",
    seed: 100,
  });
  assert.ok(typeof result === "string" && result.length > 0);
  assert.ok(!DEVANAGARI_REGEX.test(result), "English should not contain Devanagari characters");
  assert.ok(result.endsWith("."));
});

runTest("Hindi generation (hi): produces authentic Devanagari Hindi text", () => {
  const result = generateReview({
    rating: 5,
    chipIds: ["gen_friendly", "gen_quick"],
    lang: "hi",
    seed: 100,
  });
  assert.ok(typeof result === "string" && result.length > 0);
  assert.ok(DEVANAGARI_REGEX.test(result), "Hindi must contain Devanagari characters");
  assert.ok(result.endsWith("।") || result.endsWith("."));
});

runTest("Hinglish generation (hinglish): produces Romanized gender-neutral Hindi", () => {
  const result = generateReview({
    rating: 5,
    chipIds: ["gen_friendly", "gen_quick"],
    lang: "hinglish",
    seed: 100,
  });
  assert.ok(typeof result === "string" && result.length > 0);
  assert.ok(!DEVANAGARI_REGEX.test(result), "Hinglish should be Roman script");
  assert.ok(result.includes("mila") || result.includes("lagi") || result.includes("hua"));
});

runTest("Marathi generation (mr): produces authentic Devanagari Marathi text", () => {
  const result = generateReview({
    rating: 5,
    chipIds: ["gen_friendly", "gen_quick"],
    lang: "mr",
    seed: 100,
  });
  assert.ok(typeof result === "string" && result.length > 0);
  assert.ok(DEVANAGARI_REGEX.test(result), "Marathi must contain Devanagari characters");
  assert.ok(result.includes("आढळला") || result.includes("मिळाली") || result.includes("वाटली") || result.includes("झाले"));
});

// -----------------------------------------------------------------------------
// 3. Natural Writing Styles: concise, balanced, enthusiastic, professional
// -----------------------------------------------------------------------------
runTest("Style: concise produces tight, focused output", () => {
  const concise = generateReview({
    rating: 5,
    chipIds: ["gen_friendly", "gen_quick", "gen_clean"],
    style: "concise",
    lang: "en",
    seed: 42,
  });
  const balanced = generateReview({
    rating: 5,
    chipIds: ["gen_friendly", "gen_quick", "gen_clean"],
    style: "balanced",
    lang: "en",
    seed: 42,
  });
  assert.ok(typeof concise === "string" && typeof balanced === "string");
  // Concise limits chips to keep it punchy
  assert.ok(concise.length <= balanced.length, "Concise review should be more succinct than balanced");
});

runTest("Style: enthusiastic adds warm appreciation for positive experience", () => {
  const enthusiastic = generateReview({
    rating: 5,
    chipIds: ["gen_friendly"],
    style: "enthusiastic",
    lang: "en",
    seed: 42,
  });
  assert.ok(typeof enthusiastic === "string");
  assert.ok(
    /wonderful|great|pleased|loved|really/i.test(enthusiastic),
    "Enthusiastic style should contain warm/enthusiastic phrasing"
  );
});

runTest("Style: professional adds measured, formal tone", () => {
  const professional = generateReview({
    rating: 5,
    chipIds: ["serv_expert"],
    style: "professional",
    lang: "en",
    seed: 42,
  });
  assert.ok(typeof professional === "string");
  assert.ok(
    /standard|professionalism|diligence|commendable|expert/i.test(professional),
    "Professional style should contain formal vocabulary"
  );
});

runTest("Integrity: negative feedback is never falsified into positive praise", () => {
  const negReview = generateReview({
    rating: 2,
    chipIds: ["gen_wait"],
    style: "enthusiastic",
    lang: "en",
    seed: 42,
  });
  assert.ok(typeof negReview === "string");
  // Enthusiastic must NOT add "loved the experience" when rating is 2 and only negative chip is selected
  assert.ok(!/really great visit|truly wonderful/i.test(negReview));
  assert.ok(/wait/i.test(negReview));
});

// -----------------------------------------------------------------------------
// 4. Admin Category Coverage (All 8 Categories)
// -----------------------------------------------------------------------------
const EXPECTED_CATEGORIES = [
  { input: "retail", expectedIndustry: "retail", chipSet: RETAIL_CHIPS },
  { input: "Retail & Shopping", expectedIndustry: "retail", chipSet: RETAIL_CHIPS },
  { input: "restaurant", expectedIndustry: "restaurant", chipSet: RESTAURANT_CHIPS },
  { input: "Restaurant & Cafe", expectedIndustry: "restaurant", chipSet: RESTAURANT_CHIPS },
  { input: "clinic", expectedIndustry: "clinic", chipSet: CLINIC_CHIPS },
  { input: "Healthcare & Clinic", expectedIndustry: "clinic", chipSet: CLINIC_CHIPS },
  { input: "salon", expectedIndustry: "salon", chipSet: SALON_CHIPS },
  { input: "Salon, Spa & Beauty", expectedIndustry: "salon", chipSet: SALON_CHIPS },
  { input: "fitness", expectedIndustry: "fitness", chipSet: FITNESS_CHIPS },
  { input: "Gym & Fitness", expectedIndustry: "fitness", chipSet: FITNESS_CHIPS },
  { input: "automotive", expectedIndustry: "automotive", chipSet: AUTOMOTIVE_CHIPS },
  { input: "Automotive & Repair", expectedIndustry: "automotive", chipSet: AUTOMOTIVE_CHIPS },
  { input: "services", expectedIndustry: "services", chipSet: SERVICES_CHIPS },
  { input: "Professional Services", expectedIndustry: "services", chipSet: SERVICES_CHIPS },
  { input: "hotel", expectedIndustry: "hotel", chipSet: HOTEL_CHIPS },
  { input: "Hospitality & Hotel", expectedIndustry: "hotel", chipSet: HOTEL_CHIPS },
];

runTest("All 8 admin categories map to dedicated chip sets", () => {
  for (const { input, expectedIndustry, chipSet } of EXPECTED_CATEGORIES) {
    const res = getCategoryChips(input);
    assert.strictEqual(
      res.industry,
      expectedIndustry,
      `Category '${input}' should map to '${expectedIndustry}'`
    );
    assert.strictEqual(
      res.chips,
      chipSet,
      `Category '${input}' should return its specific chip set`
    );
  }
});

runTest("Every category chip set contains both positive and negative chips", () => {
  const allSets = [
    GENERIC_CHIPS,
    SALON_CHIPS,
    RESTAURANT_CHIPS,
    CLINIC_CHIPS,
    RETAIL_CHIPS,
    FITNESS_CHIPS,
    AUTOMOTIVE_CHIPS,
    SERVICES_CHIPS,
    HOTEL_CHIPS,
  ];

  for (const set of allSets) {
    const hasPositive = set.some((c) => c.sentiment === "positive");
    const hasNegative = set.some((c) => c.sentiment === "negative");
    assert.ok(hasPositive, "Chip set must contain positive chips");
    assert.ok(hasNegative, "Chip set must contain negative chips (Anti-gating requirement)");
  }
});

runTest("Every chip in all 9 sets provides phrases in all 4 languages", () => {
  const allSets = [
    GENERIC_CHIPS,
    SALON_CHIPS,
    RESTAURANT_CHIPS,
    CLINIC_CHIPS,
    RETAIL_CHIPS,
    FITNESS_CHIPS,
    AUTOMOTIVE_CHIPS,
    SERVICES_CHIPS,
    HOTEL_CHIPS,
  ];

  for (const set of allSets) {
    for (const chip of set) {
      assert.ok(Array.isArray(chip.phrases_en) && chip.phrases_en.length >= 2, `Chip ${chip.id} missing English phrases`);
      assert.ok(Array.isArray(chip.phrases_hindi) && chip.phrases_hindi.length >= 2, `Chip ${chip.id} missing Hindi phrases`);
      assert.ok(Array.isArray(chip.phrases_hinglish) && chip.phrases_hinglish.length >= 2, `Chip ${chip.id} missing Hinglish phrases`);
      assert.ok(Array.isArray(chip.phrases_mr) && chip.phrases_mr.length >= 2, `Chip ${chip.id} missing Marathi phrases`);
    }
  }
});

runTest("Deterministic Seed: Same seed produces identical output in all languages", () => {
  for (const lang of ["en", "hi", "hinglish", "mr"]) {
    const p1 = generateReview({ chipIds: ["gen_friendly"], seed: 98765, lang });
    const p2 = generateReview({ chipIds: ["gen_friendly"], seed: 98765, lang });
    assert.strictEqual(p1, p2, `Seed reproducibility failed for lang ${lang}`);
  }
});

console.log("\n==================================================================");
console.log(`TEST RESULTS: ${passed} of ${total} tests PASSED.`);
if (passed === total) {
  console.log("STATUS: ALL PHASE 1 MULTILINGUAL & MULTI-STYLE TESTS PASSED! ✅");
} else {
  console.error("STATUS: SOME TESTS FAILED! ❌");
  process.exit(1);
}
console.log("==================================================================");
