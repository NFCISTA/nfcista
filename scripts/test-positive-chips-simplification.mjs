import assert from "node:assert";
import fs from "node:fs";
import { generateReview } from "../lib/reviewGenerator.js";
import {
  getCategoryChips,
  findChip,
  GENERIC_CHIPS,
  RETAIL_CHIPS,
  RESTAURANT_CHIPS,
  CLINIC_CHIPS,
  SALON_CHIPS,
  FITNESS_CHIPS,
  AUTOMOTIVE_CHIPS,
  SERVICES_CHIPS,
  HOTEL_CHIPS,
} from "../lib/reviewChips.js";

console.log("==================================================================");
console.log("   NFCISTA: POSITIVE CHIPS & GENERATOR SAFEGUARDS SUITE");
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
// 1. Customer-Facing Interface: Only Positive Chips Displayed
// -----------------------------------------------------------------------------
const clientSrc = fs.readFileSync("components/review/StandaloneReviewClient.jsx", "utf8");

runTest("Customer UI: filters category chips to strictly positive chips", () => {
  assert.ok(clientSrc.includes('.filter((c) => c.sentiment !== "negative")'));
});

runTest("Customer UI: removes negative/constructive grouping and renders consistent styling", () => {
  // No negative chip branch in rendered JSX
  assert.ok(!clientSrc.includes("isNegative ?"));
  assert.ok(!clientSrc.includes("border-dashed"));
  assert.ok(!clientSrc.includes("text-rose-700 font-black text-sm leading-none"));
});

runTest("Customer UI: preserves optional Product and Personal Notes inputs", () => {
  assert.ok(clientSrc.includes('id="product-service-input"'));
  assert.ok(clientSrc.includes('id="personal-note-input"'));
});

// -----------------------------------------------------------------------------
// 2. Category Coverage (All 8 Categories + Generic Fallback)
// -----------------------------------------------------------------------------
const ADMIN_CATEGORIES = [
  "retail",
  "restaurant",
  "clinic",
  "salon",
  "fitness",
  "automotive",
  "services",
  "hotel",
  "generic",
];

runTest("Category Coverage: Every business category maps to a valid chip set", () => {
  for (const cat of ADMIN_CATEGORIES) {
    const res = getCategoryChips(cat);
    assert.ok(res.industry, `Missing industry for category ${cat}`);
    assert.ok(Array.isArray(res.chips) && res.chips.length > 0, `Category ${cat} has no chips`);
  }
});

// -----------------------------------------------------------------------------
// 3. Safeguard 1: 1–3 star rating NEVER triggers positive praise or recommendations
// -----------------------------------------------------------------------------
runTest("Safeguard 1: 1-star rating never triggers positive praise or recommendation", () => {
  for (const style of ["balanced", "concise", "enthusiastic", "professional"]) {
    const review = generateReview({
      rating: 1,
      note: "The technician did not arrive on time",
      style,
      recommend: "yes", // Intentionally pass yes to ensure safeguard blocks it
    });
    assert.ok(typeof review === "string");
    assert.ok(!/really great visit|truly wonderful|so pleased|commendable/i.test(review));
    assert.ok(!/would definitely recommend|highly recommended/i.test(review));
    assert.ok(review.includes("The technician did not arrive on time"));
  }
});

runTest("Safeguard 1: 2-star rating never triggers positive praise or recommendation", () => {
  const review = generateReview({
    rating: 2,
    chipIds: ["gen_friendly"], // Even if a positive chip is clicked
    note: "Waited 40 minutes past appointment",
    style: "enthusiastic",
    recommend: "yes",
  });
  assert.ok(!/really great visit|truly wonderful|so pleased/i.test(review));
  assert.ok(!/would definitely recommend|highly recommended/i.test(review));
});

runTest("Safeguard 1: 3-star rating never triggers positive praise or recommendation", () => {
  const review = generateReview({
    rating: 3,
    chipIds: ["gen_friendly"],
    note: "Average experience",
    style: "enthusiastic",
    recommend: "yes",
  });
  assert.ok(!/really great visit|truly wonderful|so pleased/i.test(review));
  assert.ok(!/would definitely recommend|highly recommended/i.test(review));
});

// -----------------------------------------------------------------------------
// 4. Safeguard 2: 4–5 star rating alone does not invent unsupported claims
// -----------------------------------------------------------------------------
runTest("Safeguard 2: 4-star rating without chips does not invent claims about staff or quality", () => {
  const review = generateReview({
    rating: 4,
    note: "Finished my routine appointment",
    style: "enthusiastic",
  });
  assert.ok(!/really great visit|truly wonderful|so pleased/i.test(review));
  assert.ok(!/staff was|cleanliness|quality|service was/i.test(review));
  assert.ok(review.includes("Finished my routine appointment"));
  assert.ok(/4-star/i.test(review));
});

runTest("Safeguard 2: 5-star rating without chips does not invent claims about staff or quality", () => {
  const review = generateReview({
    rating: 5,
    note: "Good quick visit",
    style: "professional",
  });
  assert.ok(!/commendable professional standard|high diligence/i.test(review));
  assert.ok(review.includes("Good quick visit"));
  assert.ok(/5-star/i.test(review));
});

// -----------------------------------------------------------------------------
// 5. Safeguard 3: Recommendation wording only when supported
// -----------------------------------------------------------------------------
runTest("Safeguard 3: Positive recommendation added only when supported (4-5 stars + positive chips)", () => {
  const review = generateReview({
    rating: 5,
    chipIds: ["gen_friendly"],
    recommend: "yes",
  });
  assert.ok(/recommend/i.test(review));
});

runTest("Safeguard 3: No recommendation added when rating is null and no chips selected", () => {
  const review = generateReview({
    note: "Checked out the new location",
  });
  assert.ok(!/recommend/i.test(review));
});

// -----------------------------------------------------------------------------
// 6. Safeguard 4: Customer notes preserved exactly as entered
// -----------------------------------------------------------------------------
runTest("Safeguard 4: Freeform customer notes preserved exactly", () => {
  const exactNote = "Billing department explained charges clearly and honored my warranty voucher";
  const review = generateReview({
    rating: 5,
    chipIds: ["gen_friendly"],
    note: exactNote,
  });
  assert.ok(review.includes(exactNote));
});

runTest("Safeguard 4: Freeform notes with complaints preserved without dilution", () => {
  const complaintNote = "The air conditioning was broken and the waiting room was uncomfortable";
  const review = generateReview({
    rating: 2,
    note: complaintNote,
  });
  assert.ok(review.includes(complaintNote));
});

// -----------------------------------------------------------------------------
// 7. Safeguard 5: Neutral wording when no positive chips are selected
// -----------------------------------------------------------------------------
runTest("Safeguard 5: Neutral wording when no positive chips selected", () => {
  const review = generateReview({
    rating: 3,
    product: "Oil change",
    note: "Took about an hour",
    style: "balanced",
  });
  assert.ok(review.includes("oil change"));
  assert.ok(/3[-\s]star/i.test(review));
  assert.ok(review.includes("Took about an hour"));
  assert.ok(!/really great|wonderful|terrible|horrible|recommend/i.test(review));
});

// -----------------------------------------------------------------------------
// 8. Safeguard 6: Backward compatibility of findChip
// -----------------------------------------------------------------------------
runTest("Safeguard 6: findChip continues to resolve existing chip IDs", () => {
  assert.ok(findChip("gen_friendly"), "Must find gen_friendly");
  assert.ok(findChip("gen_quick"), "Must find gen_quick");
  assert.ok(findChip("salon_skilled"), "Must find salon_skilled");
  assert.ok(findChip("rest_delicious"), "Must find rest_delicious");
  assert.ok(findChip("clinic_attentive"), "Must find clinic_attentive");
  assert.ok(findChip("hotel_clean"), "Must find hotel_clean");
});

console.log("\n==================================================================");
console.log(`SAFEGUARDS TEST RESULTS: ${passed} of ${total} tests PASSED.`);
if (passed === total) {
  console.log("STATUS: ALL POSITIVE CHIP & GENERATOR SAFEGUARDS PASSED! ✅");
} else {
  console.error("STATUS: SOME SAFEGUARD TESTS FAILED! ❌");
  process.exit(1);
}
console.log("==================================================================");
