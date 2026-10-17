// Step 11 test script — run from the nfc-card workspace:
// node --input-type=module < scripts/test-step11.mjs
// OR place in the workspace root as test-step11.mjs and run: node test-step11.mjs

import { generateCardCode, getQrUrl, isValidCardCode } from './lib/dynamicQr.js';

// --- Test 3: Quantity validation ---
function validateQtyStrict(v) {
  const n = Number(v);
  const valid = Number.isInteger(n) && n >= 1 && n <= 50;
  return { input: v, valid };
}

console.log('=== QUANTITY VALIDATION ===');
const cases = [
  { input: 1,     expected: true  },
  { input: 50,    expected: true  },
  { input: 0,     expected: false },
  { input: 51,    expected: false },
  { input: 2.7,   expected: false },
  { input: -1,    expected: false },
  { input: 'abc', expected: false },
];
for (const c of cases) {
  const r = validateQtyStrict(c.input);
  const pass = r.valid === c.expected;
  console.log(`  input=${JSON.stringify(c.input).padEnd(7)} expected=${String(c.expected).padEnd(5)} got=${String(r.valid).padEnd(5)} → ${pass ? 'PASS' : 'FAIL'}`);
}

// --- Test 4/5: Generate 5 dummy codes ---
console.log('\n=== DUMMY BATCH (5 codes) ===');
const codes = new Set();
let attempts = 0;
while (codes.size < 5 && attempts < 150) { codes.add(generateCardCode()); attempts++; }
const codeList = Array.from(codes);
console.log(`Generated ${codeList.length} codes in ${attempts} attempts.`);

// --- Test 5: uniqueness ---
console.log('\n=== UNIQUENESS ===');
const unique = new Set(codeList).size === codeList.length;
console.log(`All ${codeList.length} codes unique: ${unique ? 'PASS' : 'FAIL'}`);

// --- Test 6/7: QR URL format ---
console.log('\n=== QR URL FORMAT + CONTENT ===');
const badPatterns = ['google', 'instagram', 'whatsapp', 'example.com', 'facebook'];
let urlFail = false;
for (const code of codeList) {
  const url = getQrUrl(code);
  const hasSuffix = url.endsWith(`/r/${code}`);
  const hasBase = url.startsWith('https://nfcista.vercel.app/r/');
  let containsBad = false;
  for (const p of badPatterns) {
    if (url.includes(p)) { containsBad = true; urlFail = true; }
  }
  const pass = hasSuffix && hasBase && !containsBad;
  if (!pass) urlFail = true;
  console.log(`  ${code} → ${url}  ${pass ? 'PASS' : 'FAIL'}${containsBad ? ' [CONTAINS BAD PATTERN]' : ''}`);
}
if (!urlFail) console.log('All QR URLs pass: encode /r/[CARD_CODE] only.');

// --- Test 8: card code ↔ QR URL match ---
console.log('\n=== CARD CODE ↔ QR URL MATCH ===');
let mismatch = false;
for (const code of codeList) {
  const url = getQrUrl(code);
  const match = url.endsWith(`/r/${code}`);
  if (!match) { mismatch = true; console.log(`  FAIL: ${code} vs ${url}`); }
}
console.log(mismatch ? 'FAIL' : 'PASS — every card code matches its QR URL.');

// --- Code format ---
console.log('\n=== CODE FORMAT ===');
for (const code of codeList) {
  const valid = isValidCardCode(code);
  const matchesFmt = /^NF[A-Z0-9]{4}$/.test(code);
  console.log(`  ${code}  isValid=${valid}  format=${matchesFmt ? 'NF[A-Z0-9]{4} ✓' : 'MISMATCH'}`);
}

console.log('\n=== printConfig constants ===');
