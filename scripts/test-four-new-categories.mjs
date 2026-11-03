import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  PERFUME_CHIPS,
  BAGS_FOOTWEAR_CHIPS,
  OPTICAL_CHIPS,
  CLOTHING_CHIPS,
  RETAIL_CHIPS,
  CLINIC_CHIPS,
  getCategoryChips,
  findChip
} from "../lib/reviewChips.js";
import { generateReview } from "../lib/reviewGenerator.js";

console.log("------------------------------------------------------------");
console.log("TEST SUITE: Four New Business Categories (NFCISTA)");
console.log("------------------------------------------------------------\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// 1. CATEGORY RESOLUTION & PRECEDENCE
test("1. All four category IDs resolve to their dedicated chip collections", () => {
  const perfume = getCategoryChips("perfume");
  assert.equal(perfume.industry, "perfume");
  assert.equal(perfume.chips, PERFUME_CHIPS);

  const bags = getCategoryChips("bags_footwear");
  assert.equal(bags.industry, "bags_footwear");
  assert.equal(bags.chips, BAGS_FOOTWEAR_CHIPS);

  const optical = getCategoryChips("optical");
  assert.equal(optical.industry, "optical");
  assert.equal(optical.chips, OPTICAL_CHIPS);

  const clothing = getCategoryChips("clothing");
  assert.equal(clothing.industry, "clothing");
  assert.equal(clothing.chips, CLOTHING_CHIPS);
});

test("2. Exact display names map directly to dedicated categories without falling to retail", () => {
  assert.equal(getCategoryChips("Perfume Shop").industry, "perfume");
  assert.equal(getCategoryChips("Bags & Footwear").industry, "bags_footwear");
  assert.equal(getCategoryChips("Optical Store").industry, "optical");
  assert.equal(getCategoryChips("Clothing Store").industry, "clothing");
});

test("3. Precedence check: 'Fashion Clothing Store' resolves to retail, while 'Clothing Store' resolves to clothing", () => {
  const legacyStore = getCategoryChips("Fashion Clothing Store");
  assert.equal(legacyStore.industry, "retail", "Fashion Clothing Store must map to retail per test 5.4");
  assert.equal(legacyStore.chips, RETAIL_CHIPS);

  const pureClothing = getCategoryChips("Clothing Store");
  assert.equal(pureClothing.industry, "clothing", "Clothing Store must map to dedicated clothing");
  assert.equal(pureClothing.chips, CLOTHING_CHIPS);

  const clothingId = getCategoryChips("clothing");
  assert.equal(clothingId.industry, "clothing");
  assert.equal(clothingId.chips, CLOTHING_CHIPS);
});

// 2. CHIP AUDIT & VARIANT INTEGRITY
test("4. Each new category has 16 chips with at least 14 positive and 2 constructive chips", () => {
  const newSets = [
    { name: "Perfume", chips: PERFUME_CHIPS },
    { name: "Bags & Footwear", chips: BAGS_FOOTWEAR_CHIPS },
    { name: "Optical", chips: OPTICAL_CHIPS },
    { name: "Clothing", chips: CLOTHING_CHIPS }
  ];

  for (const { name, chips } of newSets) {
    assert.equal(chips.length, 16, `${name} must have exactly 16 chips`);
    const positive = chips.filter((c) => c.sentiment !== "negative");
    const constructive = chips.filter((c) => c.sentiment === "negative");
    assert(positive.length >= 14, `${name} must have >= 14 positive chips (found ${positive.length})`);
    assert.equal(constructive.length, 2, `${name} must have 2 constructive chips for parity`);
  }
});

test("5. All 64 new chips have unique IDs and resolve via findChip()", () => {
  const allNewChips = [
    ...PERFUME_CHIPS,
    ...BAGS_FOOTWEAR_CHIPS,
    ...OPTICAL_CHIPS,
    ...CLOTHING_CHIPS
  ];

  const seenIds = new Set();
  for (const chip of allNewChips) {
    assert(!seenIds.has(chip.id), `Duplicate chip ID found: ${chip.id}`);
    seenIds.add(chip.id);

    const resolved = findChip(chip.id);
    assert.equal(resolved, chip, `findChip(${chip.id}) must return the chip object`);
  }
  assert.equal(seenIds.size, 64);
});

test("6. All 64 new chips provide 4 variants for en, hi, hinglish, hindi, and mr", () => {
  const allNewChips = [
    ...PERFUME_CHIPS,
    ...BAGS_FOOTWEAR_CHIPS,
    ...OPTICAL_CHIPS,
    ...CLOTHING_CHIPS
  ];

  for (const chip of allNewChips) {
    assert(Array.isArray(chip.phrases_en) && chip.phrases_en.length >= 4, `Missing EN phrases for ${chip.id}`);
    assert(Array.isArray(chip.phrases_hi) && chip.phrases_hi.length >= 4, `Missing HI phrases for ${chip.id}`);
    assert(Array.isArray(chip.phrases_hinglish) && chip.phrases_hinglish.length >= 4, `Missing Hinglish phrases for ${chip.id}`);
    assert(Array.isArray(chip.phrases_hindi) && chip.phrases_hindi.length >= 4, `Missing Hindi Devanagari phrases for ${chip.id}`);
    assert(Array.isArray(chip.phrases_mr) && chip.phrases_mr.length >= 4, `Missing Marathi phrases for ${chip.id}`);
  }
});

test("7. 100% Gender-neutral Hinglish across all 64 new chips", () => {
  const genderRegex = /\b(aaya|aayi|karunga|karungi|aaunga|aaungi|gaya|gayi|raha|rahi|tha|thi)\b/i;
  const allNewChips = [
    ...PERFUME_CHIPS,
    ...BAGS_FOOTWEAR_CHIPS,
    ...OPTICAL_CHIPS,
    ...CLOTHING_CHIPS
  ];

  for (const chip of allNewChips) {
    for (const phrase of [...chip.phrases_hi, ...chip.phrases_hinglish]) {
      assert(
        !genderRegex.test(phrase),
        `Gendered Hinglish word found in chip ${chip.id}: "${phrase}"`
      );
    }
  }
});

// 3. GENERATOR INTEGRATION & DRAFTS
test("8. Generates natural drafts for Perfume category across all 4 styles", () => {
  const styles = ["concise", "balanced", "enthusiastic", "professional"];
  for (const style of styles) {
    const draft = generateReview({
      rating: 5,
      chipIds: ["perf_choose_fragrance", "perf_notes_explained"],
      product: "Royal Oud",
      style,
      lang: "en",
      seed: 42
    });
    assert(draft && draft.length > 20);
    assert(draft.toLowerCase().includes("royal oud"));
  }
});

test("9. Generates natural drafts for Bags & Footwear category across all 4 languages", () => {
  const languages = ["en", "hi", "hinglish", "mr"];
  for (const lang of languages) {
    const draft = generateReview({
      rating: 5,
      chipIds: ["bag_comfort_options", "bag_sturdy_quality"],
      product: "Leather Tote Bag",
      style: "balanced",
      lang,
      seed: 50
    });
    assert(draft && draft.length > 15);
  }
});

test("10. Generates natural drafts for Optical Store with rating safeguards", () => {
  // Low rating: must not include praise
  const lowDraft = generateReview({
    rating: 2,
    chipIds: ["opt_delayed_collection"],
    note: "Lens was delayed by 3 days.",
    style: "enthusiastic",
    lang: "en",
    seed: 10
  });
  assert(!/wonderful|loved|great experience|delighted|recommend/i.test(lowDraft));
  assert(lowDraft.includes("Lens was delayed by 3 days."));

  // 5-star rating with chips
  const highDraft = generateReview({
    rating: 5,
    chipIds: ["opt_frame_selection", "opt_fitting_adjusted"],
    style: "professional",
    lang: "en",
    seed: 20
  });
  assert(highDraft && highDraft.length > 30);
});

test("11. Generates natural drafts for Clothing Store with product lowercasing", () => {
  const draft = generateReview({
    rating: 5,
    chipIds: ["cloth_clothing_variety", "cloth_fabric_explained"],
    product: "ETHNIC KURTA SET",
    style: "balanced",
    lang: "en"
  });
  assert(draft.includes("ethnic kurta set"), "Product must be lowercased inside sentence");
});

// 4. ADMIN SELECTION & UI VERIFICATION
test("12. Admin review cards page contains all four new categories in dropdown", () => {
  const adminPagePath = path.resolve("app/admin/review-cards/page.js");
  const adminCode = fs.readFileSync(adminPagePath, "utf-8");

  assert(adminCode.includes('{ value: "perfume", label: "Perfume Shop" }'));
  assert(adminCode.includes('{ value: "bags_footwear", label: "Bags & Footwear" }'));
  assert(adminCode.includes('{ value: "optical", label: "Optical Store" }'));
  assert(adminCode.includes('{ value: "clothing", label: "Clothing Store" }'));
});

test("13. StandaloneReviewClient maps all four new categories to display names", () => {
  const clientPath = path.resolve("components/review/StandaloneReviewClient.jsx");
  const clientCode = fs.readFileSync(clientPath, "utf-8");

  assert(clientCode.includes('perfume: "Perfume Shop"'));
  assert(clientCode.includes('bags_footwear: "Bags & Footwear"'));
  assert(clientCode.includes('optical: "Optical Store"'));
  assert(clientCode.includes('clothing: "Clothing Store"'));
  assert(clientCode.includes("getCategoryLabel(industry, category)"));
});

// 5. BACKWARD COMPATIBILITY
test("14. Legacy categories and chip IDs remain 100% functional", () => {
  const legacyIds = [
    "gen_friendly",
    "salon_skilled",
    "rest_delicious",
    "clinic_clean",
    "retail_variety",
    "fit_equipment",
    "auto_mechanic",
    "serv_expert",
    "hotel_clean"
  ];

  for (const id of legacyIds) {
    const chip = findChip(id);
    assert(chip, `Legacy chip ${id} must resolve via findChip()`);
  }
});

test("15. Route files and customer journey remain intact", () => {
  assert(fs.existsSync(path.resolve("app/review/[slug]/page.js")), "/review/[slug] must exist");
  assert(fs.existsSync(path.resolve("app/r/[cardCode]/route.js")), "/r/[cardCode] must exist");
  assert(fs.existsSync(path.resolve("app/review/c/[cardCode]/page.js")), "/review/c/[cardCode] must exist");
});

console.log(`\n------------------------------------------------------------`);
console.log(`Results: ${passed}/${total} tests passed!`);
console.log(`------------------------------------------------------------\n`);
