import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  CLOSING_SUGGESTIONS,
  getClosingSuggestions,
  applyClosingLine,
  removeClosingLine,
} from "../lib/reviewClosingLines.js";

console.log("=== NFCISTA Standalone Review Assistant: Closing Lines Test Suite ===\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    process.exitCode = 1;
  }
}

// ── 1. Dictionary Structure & Language Coverage ─────────────────────────────
test("High-tier suggestions (ratings 4-5) contain all 4 languages", () => {
  const high = CLOSING_SUGGESTIONS.high;
  assert.ok(Array.isArray(high), "high suggestions array exists");
  assert.ok(high.length >= 5, "at least 5 high-tier suggestions defined");

  for (const item of high) {
    assert.ok(item.id, `item has id`);
    assert.ok(item.text.en, `item ${item.id} has English text`);
    assert.ok(item.text.hi, `item ${item.id} has Hindi text`);
    assert.ok(item.text.hinglish, `item ${item.id} has Hinglish text`);
    assert.ok(item.text.mr, `item ${item.id} has Marathi text`);
  }
});

test("Low-tier suggestions (ratings 1-3) contain all 4 languages", () => {
  const low = CLOSING_SUGGESTIONS.low;
  assert.ok(Array.isArray(low), "low suggestions array exists");
  assert.ok(low.length >= 4, "at least 4 low-tier suggestions defined");

  for (const item of low) {
    assert.ok(item.id, `item has id`);
    assert.ok(item.text.en, `item ${item.id} has English text`);
    assert.ok(item.text.hi, `item ${item.id} has Hindi text`);
    assert.ok(item.text.hinglish, `item ${item.id} has Hinglish text`);
    assert.ok(item.text.mr, `item ${item.id} has Marathi text`);
  }
});

// ── 2. Rating Safeguards ────────────────────────────────────────────────────
test("Low-tier suggestions (ratings 1-3) never contain praise, return promises, or recommendations", () => {
  const forbiddenRegex = /\b(recommend|pleasant|happy|delighted|love|loved|great|excellent|fantastic|wonderful|shandar|badhiya|khush|prasanna|punha bhet|phir aao|phir aayenge|revisit|again soon)\b/i;

  for (const item of CLOSING_SUGGESTIONS.low) {
    for (const [lang, text] of Object.entries(item.text)) {
      assert.ok(
        !forbiddenRegex.test(text),
        `Low-tier suggestion [${item.id}][${lang}] contains forbidden positive wording: "${text}"`
      );
    }
  }
});

// ── 3. Gender Neutrality in Hinglish ─────────────────────────────────────────
test("All Hinglish closing suggestions are strictly gender-neutral", () => {
  const genderedRegex = /\b(aaya|aayi|karunga|karungi|aaunga|aaungi|gaya|gayi|raha|rahi|tha|thi)\b/i;

  const allItems = [...CLOSING_SUGGESTIONS.high, ...CLOSING_SUGGESTIONS.low];
  for (const item of allItems) {
    const text = item.text.hinglish;
    assert.ok(
      !genderedRegex.test(text),
      `Hinglish suggestion [${item.id}] contains gendered marker: "${text}"`
    );
  }
});

// ── 4. getClosingSuggestions Functionality ──────────────────────────────────
test("getClosingSuggestions returns high-tier suggestions for 4-5 stars and low-tier for 1-3 stars", () => {
  const high5 = getClosingSuggestions({ rating: 5, lang: "en" });
  assert.ok(high5.length > 0);
  assert.ok(high5.some((s) => s.id === "high_pleasant"));

  const high4 = getClosingSuggestions({ rating: 4, lang: "hi" });
  assert.ok(high4.length > 0);
  assert.ok(high4.some((s) => s.id === "high_pleasant"));

  const low3 = getClosingSuggestions({ rating: 3, lang: "en" });
  assert.ok(low3.length > 0);
  assert.ok(low3.some((s) => s.id === "low_overall_experience"));
  assert.ok(!low3.some((s) => s.id === "high_pleasant"));

  const low1 = getClosingSuggestions({ rating: 1, lang: "hinglish" });
  assert.ok(low1.length > 0);
  assert.ok(low1.some((s) => s.id === "low_share_honestly"));
});

test("getClosingSuggestions applies deterministic seed-based rotation without losing items", () => {
  const seedA = getClosingSuggestions({ rating: 5, lang: "en", seed: 101 });
  const seedB = getClosingSuggestions({ rating: 5, lang: "en", seed: 202 });

  assert.equal(seedA.length, seedB.length);
  const idsA = new Set(seedA.map((s) => s.id));
  const idsB = new Set(seedB.map((s) => s.id));
  assert.deepEqual(idsA, idsB);
});

// ── 5. applyClosingLine & removeClosingLine Pure Functions ──────────────────
test("applyClosingLine appends sentence cleanly when draft has no closing line", () => {
  const baseDraft = "Great selection of frames and helpful staff.";
  const closing = "I'd gladly recommend them.";
  const result = applyClosingLine(baseDraft, closing);

  assert.equal(result, "Great selection of frames and helpful staff. I'd gladly recommend them.");
});

test("applyClosingLine adds period to draft if missing before appending", () => {
  const baseDraft = "Great selection of frames and helpful staff";
  const closing = "I'd gladly recommend them.";
  const result = applyClosingLine(baseDraft, closing);

  assert.equal(result, "Great selection of frames and helpful staff. I'd gladly recommend them.");
});

test("applyClosingLine cleanly swaps previous closing line without duplicating", () => {
  const initialDraft = "Great selection of frames and helpful staff.";
  const firstClosing = "I'd gladly recommend them.";
  const withFirst = applyClosingLine(initialDraft, firstClosing);

  const secondClosing = "Overall, I had a pleasant experience.";
  const withSecond = applyClosingLine(withFirst, secondClosing, firstClosing);

  assert.equal(withSecond, "Great selection of frames and helpful staff. Overall, I had a pleasant experience.");
  assert.ok(!withSecond.includes(firstClosing), "previous closing was removed");
});

test("applyClosingLine avoids duplicate if draft already ends with target line", () => {
  const draft = "Friendly staff. Overall, I had a pleasant experience.";
  const closing = "Overall, I had a pleasant experience.";
  const result = applyClosingLine(draft, closing);

  assert.equal(result, draft);
});

test("removeClosingLine removes closing line cleanly from draft", () => {
  const initialDraft = "Great selection of frames. I'd gladly recommend them.";
  const closing = "I'd gladly recommend them.";
  const result = removeClosingLine(initialDraft, closing);

  assert.equal(result, "Great selection of frames.");
});

// ── 6. UI Integration & Accessibility Verification ──────────────────────────
test("StandaloneReviewClient.jsx includes closing line section, options, and accessibility attributes", () => {
  const uiFile = path.resolve("components/review/StandaloneReviewClient.jsx");
  const code = fs.readFileSync(uiFile, "utf-8");

  assert.ok(code.includes("How would you like to end your review?"), "heading present");
  assert.ok(code.includes("No closing line"), "no closing line option present");
  assert.ok(code.includes("Edit in text"), "edit in text action present");
  assert.ok(code.includes("Remove"), "remove action present");
  assert.ok(code.includes("role=\"group\""), "group role present");
  assert.ok(code.includes("aria-label=\"How would you like to end your review?\""), "aria label present");
  assert.ok(code.includes("aria-pressed="), "aria-pressed attribute present");
  assert.ok(code.includes("getClosingSuggestions"), "getClosingSuggestions imported and used");
  assert.ok(code.includes("applyClosingLine"), "applyClosingLine used");
  assert.ok(code.includes("removeClosingLine"), "removeClosingLine used");
});

console.log(`\nClosing Lines Test Results: ${passed} / ${total} passed.\n`);
if (passed !== total) {
  process.exit(1);
}
