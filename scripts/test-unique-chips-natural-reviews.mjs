import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  RESTAURANT_CHIPS,
  SALON_CHIPS,
  RETAIL_CHIPS,
  CLINIC_CHIPS,
  FITNESS_CHIPS,
  AUTOMOTIVE_CHIPS,
  SERVICES_CHIPS,
  HOTEL_CHIPS,
  GENERIC_CHIPS,
  getCategoryChips,
  findChip
} from "../lib/reviewChips.js";
import { generateReview } from "../lib/reviewGenerator.js";

const ALL_CATEGORY_MAP = {
  restaurant: RESTAURANT_CHIPS,
  salon: SALON_CHIPS,
  retail: RETAIL_CHIPS,
  clinic: CLINIC_CHIPS,
  fitness: FITNESS_CHIPS,
  automotive: AUTOMOTIVE_CHIPS,
  services: SERVICES_CHIPS,
  hotel: HOTEL_CHIPS,
  generic: GENERIC_CHIPS
};

const ALL_CHIPS = Object.values(ALL_CATEGORY_MAP).flat();

console.log("------------------------------------------------------------");
console.log("TEST SUITE: Unique Chips & Natural Human-Written Reviews");
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

// 1. CHIP COLLECTION AUDIT & UNIQUE COVERAGE
test("1. All 9 categories have 14+ positive chips (12-18 range) and 16-17 total chips", () => {
  const categoryKeys = Object.keys(ALL_CATEGORY_MAP);
  assert.equal(categoryKeys.length, 9, "Must contain all 9 categories");

  for (const cat of categoryKeys) {
    const res = getCategoryChips(cat);
    assert(res && Array.isArray(res.chips), `getCategoryChips(${cat}) must return { industry, chips }`);
    const positiveChips = res.chips.filter((c) => c.sentiment !== "negative");
    assert(
      positiveChips.length >= 14,
      `Category ${cat} should have >= 14 positive chips (found ${positiveChips.length})`
    );
    assert(
      res.chips.length >= 16 && res.chips.length <= 18,
      `Category ${cat} should have 16-18 total chips (found ${res.chips.length})`
    );
  }
});

test("2. Zero duplicate chip IDs across all chips", () => {
  const allIds = new Set();
  for (const chip of ALL_CHIPS) {
    assert(!allIds.has(chip.id), `Duplicate chip ID detected: ${chip.id}`);
    allIds.add(chip.id);
  }
  assert.equal(allIds.size, ALL_CHIPS.length);
  assert(ALL_CHIPS.length >= 140, `Expected at least 140 chips, got ${ALL_CHIPS.length}`);
});

test("3. All chips have 4 variants for en, hi, hinglish, mr and valid structure", () => {
  for (const chip of ALL_CHIPS) {
    assert(chip.id && typeof chip.id === "string", `Missing id for chip`);
    assert(chip.label && typeof chip.label === "string", `Missing label for chip ${chip.id}`);
    assert(chip.sentiment && typeof chip.sentiment === "string", `Missing sentiment for chip ${chip.id}`);
    assert(
      Array.isArray(chip.phrases_en) && chip.phrases_en.length >= 4,
      `Chip ${chip.id} must have >= 4 English phrases`
    );
    assert(
      Array.isArray(chip.phrases_hi) && chip.phrases_hi.length >= 4,
      `Chip ${chip.id} must have >= 4 Hindi phrases`
    );
    assert(
      Array.isArray(chip.phrases_hinglish) && chip.phrases_hinglish.length >= 4,
      `Chip ${chip.id} must have >= 4 Hinglish phrases`
    );
    assert(
      Array.isArray(chip.phrases_mr) && chip.phrases_mr.length >= 4,
      `Chip ${chip.id} must have >= 4 Marathi phrases`
    );
  }
});

test("4. 100% Hinglish gender-neutral phrases across all chips", () => {
  const genderRegex = /\b(aaya|aayi|karunga|karungi|aaunga|aaungi|gaya|gayi|raha|rahi|tha|thi)\b/i;
  for (const chip of ALL_CHIPS) {
    for (const phrase of chip.phrases_hinglish) {
      assert(
        !genderRegex.test(phrase),
        `Chip ${chip.id} contains gendered Hinglish word in: "${phrase}"`
      );
    }
  }
});

test("5. Category specificity: distinct chip sets per category with no generic duplication", () => {
  const restChips = new Set(getCategoryChips("restaurant").chips.map((c) => c.id));
  const clinicChips = new Set(getCategoryChips("clinic").chips.map((c) => c.id));
  const autoChips = new Set(getCategoryChips("automotive").chips.map((c) => c.id));

  // Category specific IDs should not bleed across domains
  assert(restChips.has("rest_fresh"));
  assert(!clinicChips.has("rest_fresh"));
  assert(clinicChips.has("clinic_clean"));
  assert(!autoChips.has("clinic_clean"));
  assert(autoChips.has("auto_genuine"));
  assert(!restChips.has("auto_genuine"));
});

// 2. GENERATOR NATURAL CONVERSATIONAL QUALITY & CONNECTORS
test("6. Multiple selected chips are smoothly connected with natural conjunctions", () => {
  const chipIds = ["rest_fresh", "rest_ambiance"];
  const draft = generateReview({
    rating: 5,
    chipIds,
    style: "balanced",
    lang: "en"
  });

  assert(draft && draft.length > 20, "Draft should be generated");
  assert(!draft.includes("Fresh Food,"), "Should not be raw chip label dump");
  const hasSentenceBreakOrConnector =
    draft.includes(". ") || draft.includes(" and ") || draft.includes(" Also, ");
  assert(hasSentenceBreakOrConnector, "Draft should have smooth natural flow or sentence breaks");
});

test("7. Different chip selections produce meaningfully different drafts", () => {
  const draft1 = generateReview({
    rating: 5,
    chipIds: ["rest_fresh"],
    style: "balanced",
    lang: "en",
    seed: 42
  });

  const draft2 = generateReview({
    rating: 5,
    chipIds: ["rest_flavour_balance", "rest_menu_variety"],
    style: "balanced",
    lang: "en",
    seed: 42
  });

  assert.notEqual(draft1, draft2, "Different chips must generate distinct drafts");
});

test("8. Rating alone without chips or note returns null to require actual experience detail", () => {
  const draft = generateReview({
    rating: 5,
    chipIds: [],
    style: "balanced",
    lang: "en"
  });

  assert.equal(draft, null, "Generator should return null when rating alone is given without feedback");
});

test("9. 1-3 star ratings NEVER produce positive praise or recommendations", () => {
  const lowRatings = [1, 2, 3];
  const styles = ["concise", "balanced", "enthusiastic", "professional"];
  const languages = ["en", "hi", "hinglish", "mr"];

  for (const rating of lowRatings) {
    for (const style of styles) {
      for (const lang of languages) {
        const draft = generateReview({
          rating,
          chipIds: ["rest_fresh"], // Even if a positive chip ID is provided
          note: "Need improvement in timing.",
          style,
          lang
        });

        assert(
          !/recommend|recommended|loved it|must visit|wonderful|outstanding|fantastic|badiya|sifaris|shandar/i.test(
            draft
          ),
          `Low rating (${rating} star, ${style}, ${lang}) leaked praise: "${draft}"`
        );
      }
    }
  }
});

test("10. Customer personal note is preserved verbatim with Unicode & punctuation", () => {
  const note = "Special thanks to Amit bhai for fixing the AC promptly! 👌 Great job.";
  const draft = generateReview({
    rating: 5,
    chipIds: ["serv_prompt_service"],
    note,
    style: "balanced",
    lang: "en"
  });

  assert(draft.includes(note), "Customer note must be preserved verbatim in draft");
});

test("11. Product/service name is integrated naturally", () => {
  const draft = generateReview({
    rating: 5,
    product: "Handcrafted Leather Wallet",
    chipIds: ["retail_variety"],
    style: "balanced",
    lang: "en"
  });

  assert(
    draft.toLowerCase().includes("handcrafted leather wallet"),
    "Product name must appear naturally in draft"
  );
});

test("12. All 4 writing styles produce distinct tone and structure", () => {
  const params = {
    rating: 5,
    chipIds: ["hotel_clean", "hotel_hospitality"],
    lang: "en",
    seed: 100
  };

  const concise = generateReview({ ...params, style: "concise" });
  const balanced = generateReview({ ...params, style: "balanced" });
  const enthusiastic = generateReview({ ...params, style: "enthusiastic" });
  const professional = generateReview({ ...params, style: "professional" });

  assert(concise && balanced && enthusiastic && professional, "All styles must produce text");
  assert(concise.length < balanced.length || concise.split(".").length <= balanced.split(".").length);
  assert(enthusiastic.includes("!") || /great|loved|delighted/i.test(enthusiastic));
  assert(professional.includes("professional") || professional.includes("standard") || /appreciate|consistently|level of service/i.test(professional));
});

// 3. UI CODE AUDIT (StandaloneReviewClient.jsx)
test("13. StandaloneReviewClient contains progressive disclosure for chips (8 visible + expand button)", () => {
  const clientPath = path.resolve("components/review/StandaloneReviewClient.jsx");
  const code = fs.readFileSync(clientPath, "utf-8");

  assert(
    code.includes("showAllChips"),
    "StandaloneReviewClient must manage showAllChips state"
  );
  assert(
    code.includes("idx < 8"),
    "StandaloneReviewClient must cap initial visible chips to 8"
  );
  assert(
    code.includes("Show more experiences") || code.includes("more experiences"),
    "StandaloneReviewClient must show expand toggle button"
  );
  assert(
    code.includes("Show fewer"),
    "StandaloneReviewClient must support collapsing expanded chips"
  );
});

test("14. StandaloneReviewClient contains friendly note placeholder and ownership notice", () => {
  const clientPath = path.resolve("components/review/StandaloneReviewClient.jsx");
  const code = fs.readFileSync(clientPath, "utf-8");

  const expectedPlaceholder = "Anything specific you would like to mention about your experience?";
  assert(
    code.includes(expectedPlaceholder),
    `StandaloneReviewClient must use friendly note placeholder: "${expectedPlaceholder}"`
  );

  const expectedNotice = "Your experience, your words. Please review and edit this draft so it accurately reflects your visit before posting.";
  assert(
    code.includes("Your experience, your words") && code.includes("Please review and edit this draft"),
    `StandaloneReviewClient must display customer ownership notice: "${expectedNotice}"`
  );
});

test("15. findChip backward-compatibility for all existing and legacy IDs", () => {
  const existingIds = [
    "gen_friendly",
    "gen_clean",
    "salon_skilled",
    "salon_hygienic",
    "rest_delicious",
    "rest_fresh",
    "clinic_clean",
    "retail_quality",
    "fit_clean",
    "auto_genuine",
    "serv_expert",
    "hotel_clean"
  ];

  for (const id of existingIds) {
    const chip = findChip(id);
    assert(chip, `Chip ID ${id} must resolve via findChip()`);
  }
});

console.log(`\n------------------------------------------------------------`);
console.log(`Results: ${passed}/${total} tests passed!`);
console.log(`------------------------------------------------------------\n`);
