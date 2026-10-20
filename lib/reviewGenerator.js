/**
 * NFCISTA Pure Template-Based Review Generator
 *
 * Runs 100% locally in browser memory.
 * - Zero external API calls (no OpenAI, no Gemini, no LLMs).
 * - Zero client storage or browser global dependencies.
 * - Zero network calls or database dependencies.
 * - Pure function: deterministic for the same seed, no side effects.
 *
 * @param {object} params
 * @param {number|null} [params.rating]     - Star rating (1–5) or null
 * @param {string[]}    [params.chipIds]    - Array of selected chip IDs
 * @param {string}      [params.product]    - Optional product/service text
 * @param {string}      [params.note]       - Optional customer freeform note
 * @param {string}      [params.recommend]  - "yes" | "no" | "maybe" | null
 * @param {string}      [params.lang]       - "en" | "hi" (defaults to "en")
 * @param {number}      [params.seed]       - Seed number for deterministic variation
 * @returns {string|null} Generated review text, or null if insufficient input
 */

import { findChip } from "./reviewChips.js";

/**
 * Deterministically pick an element from an array using seed and offset.
 */
function pickVariant(variants, seed, offset = 0) {
  if (!Array.isArray(variants) || variants.length === 0) return "";
  const s = Math.abs(Math.floor(Number(seed) || 0) + offset * 7919);
  return variants[s % variants.length];
}

/**
 * Ensures a sentence ends with standard punctuation.
 */
function punctuate(sentence) {
  const trimmed = (sentence || "").trim();
  if (!trimmed) return "";
  if (/[.!?]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
}

// ─── Product introductory phrases ───────────────────────────────────────────

const PRODUCT_PHRASES_EN = [
  (p) => `Visited for their ${p}.`,
  (p) => `Came in for ${p}.`,
  (p) => `Had their ${p}.`,
  (p) => `Tried their ${p}.`,
];

const PRODUCT_PHRASES_HI = [
  (p) => `${p} ke liye visit kiya.`,
  (p) => `${p} service li.`,
  (p) => `${p} ke liye yahan aana hua.`,
  (p) => `${p} try kiya.`,
];

// ─── Rating remarks ─────────────────────────────────────────────────────────

const RATING_REMARKS_EN = {
  5: [
    "Definitely a 5-star experience.",
    "Deserves a full 5-star rating.",
    "5-star experience all the way.",
  ],
  4: [
    "Overall a solid 4-star experience.",
    "Worth a well-deserved 4 stars.",
    "A very good 4-star visit.",
  ],
  3: [
    "A fair 3-star experience overall.",
    "Decent 3-star visit with room for improvement.",
    "Giving 3 stars.",
  ],
  2: [
    "A 2-star experience with several areas to improve.",
    "Found it to be a 2-star visit.",
    "Giving 2 stars.",
  ],
  1: [
    "A disappointing 1-star experience.",
    "Only 1 star due to the issues faced.",
    "Expected much better — 1 star.",
  ],
};

const RATING_REMARKS_HI = {
  5: [
    "Poore 5 star rating banta hai.",
    "5 star experience mila.",
    "Bilkul 5 star rating ke layak laga.",
  ],
  4: [
    "Overall 4 star experience mila.",
    "4 star rating banta hai.",
    "Achha 4 star experience laga.",
  ],
  3: [
    "Overall 3 star experience laga.",
    "3 star rating theek lagti hai.",
    "Decent 3 star visit laga.",
  ],
  2: [
    "Experience 2 star level ka laga.",
    "Sudhar ki zaroorat hai — 2 star rating banta hai.",
    "2 star experience mila.",
  ],
  1: [
    "Disappointing 1 star experience mila.",
    "Umeed se kaafi kam laga — 1 star rating banta hai.",
    "Kaafi issues mile, 1 star laga.",
  ],
};

// ─── Recommendation phrases ─────────────────────────────────────────────────

const RECOMMEND_PHRASES_EN = {
  yes: [
    "Would definitely recommend.",
    "Happy to recommend to others.",
    "Highly recommended.",
  ],
  no: [
    "Would not recommend based on this visit.",
    "Cannot recommend at this time.",
    "Do not recommend based on this experience.",
  ],
  maybe: [
    "Mixed feelings on recommending.",
    "Decent overall, though experiences may vary.",
  ],
};

const RECOMMEND_PHRASES_HI = {
  yes: [
    "Zaroor recommend karne layak hai.",
    "Auron ko bhi recommend kiya ja sakta hai.",
    "Recommend karne jaisa laga.",
  ],
  no: [
    "Filhal recommend karna mushkil lagta hai.",
    "Is visit ke hisaab se recommend karna theek nahi lagta.",
    "Abhi ke liye recommend nahi kiya ja sakta.",
  ],
  maybe: [
    "Thoda mixed experience laga.",
    "Experience theek laga par mixed views hain.",
  ],
};

// ─── Main Generator ─────────────────────────────────────────────────────────

export function generateReview({
  rating = null,
  chipIds = [],
  product = "",
  note = "",
  recommend = "",
  lang = "en",
  seed = 0,
} = {}) {
  const isHi = String(lang).toLowerCase() === "hi";
  const numSeed = Number(seed) || 0;

  const validChips = Array.isArray(chipIds)
    ? chipIds.map((id) => findChip(id)).filter(Boolean)
    : [];

  const cleanNote = typeof note === "string" ? note.trim() : "";
  const cleanProduct = typeof product === "string" ? product.trim() : "";
  const cleanRecommend = typeof recommend === "string" ? recommend.trim().toLowerCase() : "";
  const numRating = Number.isInteger(Number(rating)) && Number(rating) >= 1 && Number(rating) <= 5
    ? Number(rating)
    : null;

  // 1. Minimum input check:
  // Must have at least one useful piece of feedback:
  // chips OR note OR (recommend && rating) OR (rating && validChips.length)
  // Product alone is NOT sufficient feedback to generate a review.
  const hasUsefulInput =
    validChips.length > 0 ||
    cleanNote.length > 0 ||
    (numRating !== null && (cleanRecommend.length > 0 || cleanProduct.length > 0)) ||
    cleanRecommend.length > 0;

  if (!hasUsefulInput) {
    return null;
  }

  const sentences = [];
  let offsetCounter = 0;

  // 2. Product sentence (if provided)
  // Product is strictly lowercased ONLY when inserted into the sentence
  if (cleanProduct) {
    const lowerProduct = cleanProduct.toLowerCase();
    const productTemplates = isHi ? PRODUCT_PHRASES_HI : PRODUCT_PHRASES_EN;
    const fn = pickVariant(productTemplates, numSeed, offsetCounter++);
    if (typeof fn === "function") {
      sentences.push(punctuate(fn(lowerProduct)));
    }
  }

  // 3. Chip phrases (in customer selection order)
  validChips.forEach((chip) => {
    const variants = isHi ? chip.phrases_hi : chip.phrases_en;
    const phrase = pickVariant(variants, numSeed, offsetCounter++);
    if (phrase) {
      sentences.push(punctuate(phrase));
    }
  });

  // 4. Rating remark (if provided)
  if (numRating !== null) {
    const remarkDict = isHi ? RATING_REMARKS_HI : RATING_REMARKS_EN;
    const variants = remarkDict[numRating] || [];
    const remark = pickVariant(variants, numSeed, offsetCounter++);
    if (remark) {
      sentences.push(punctuate(remark));
    }
  }

  // 5. Customer's genuine note (unmodified meaning, punctuation ensured)
  if (cleanNote) {
    sentences.push(punctuate(cleanNote));
  }

  // 6. Recommendation remark (if selected)
  if (cleanRecommend) {
    const normRec =
      cleanRecommend === "yes" || cleanRecommend === "definitely" || cleanRecommend === "true"
        ? "yes"
        : cleanRecommend === "no" || cleanRecommend === "false"
        ? "no"
        : "maybe";

    const recDict = isHi ? RECOMMEND_PHRASES_HI : RECOMMEND_PHRASES_EN;
    const variants = recDict[normRec] || [];
    const recText = pickVariant(variants, numSeed, offsetCounter++);
    if (recText) {
      sentences.push(punctuate(recText));
    }
  }

  if (sentences.length === 0) {
    return null;
  }

  return sentences.join(" ");
}
