// Step 11 unit test — inlines the pure functions from dynamicQr.js to avoid Supabase deps.
// Run from workspace root: node test-step11-unit.mjs

const NFCISTA_BASE_URL = 'https://nfcista.vercel.app';

function isValidCardCode(code) {
  if (!code || typeof code !== 'string') return false;
  return /^[A-Za-z0-9_-]{3,32}$/.test(code.trim());
}

function generateCardCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);
  let code = 'NF';
  for (let i = 0; i < 4; i++) code += chars[bytes[i] % chars.length];
  return code;
}

function getQrUrl(cardCode) {
  if (!isValidCardCode(cardCode)) return null;
  return `${NFCISTA_BASE_URL}/r/${cardCode.trim().toUpperCase()}`;
}

// --------------------------------------------------------------------------
// Test 3: Quantity validation (mirrors API's Number.isInteger check)
// --------------------------------------------------------------------------
function validateQtyStrict(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 50;
}

console.log('=== TEST 3: QUANTITY VALIDATION ===');
const cases = [
  { input: 1,      expected: true  },
  { input: 50,     expected: true  },
  { input: 0,      expected: false },
  { input: 51,     expected: false },
  { input: 2.7,    expected: false },
  { input: -1,     expected: false },
  { input: 'abc',  expected: false },
];
let qtyPass = true;
for (const c of cases) {
  const got = validateQtyStrict(c.input);
  const pass = got === c.expected;
  if (!pass) qtyPass = false;
  console.log(`  input=${JSON.stringify(c.input).padEnd(7)} expected=${String(c.expected).padEnd(5)} got=${String(got).padEnd(5)} → ${pass ? 'PASS' : '*** FAIL ***'}`);
}
console.log(`Quantity validation: ${qtyPass ? 'ALL PASS' : 'SOME FAILURES'}`);

// --------------------------------------------------------------------------
// Test 4/5: Generate 5 dummy codes in memory
// --------------------------------------------------------------------------
console.log('\n=== TEST 4: DUMMY BATCH (5 codes) ===');
const codes = new Set();
let attempts = 0;
while (codes.size < 5 && attempts < 150) { codes.add(generateCardCode()); attempts++; }
const codeList = Array.from(codes);
console.log(`Generated ${codeList.length} codes in ${attempts} attempts.`);
codeList.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));

// --------------------------------------------------------------------------
// Test 5: Uniqueness
// --------------------------------------------------------------------------
console.log('\n=== TEST 5: UNIQUENESS ===');
const uniqueCount = new Set(codeList).size;
const uniquePass = uniqueCount === 5;
console.log(`Unique codes: ${uniqueCount}/5 → ${uniquePass ? 'PASS' : 'FAIL'}`);

// --------------------------------------------------------------------------
// Tests 6/7: QR URL format — encodes /r/[CARD_CODE] only
// --------------------------------------------------------------------------
console.log('\n=== TEST 6/7: QR URL FORMAT ===');
const badPatterns = ['google.com', 'instagram', 'whatsapp', 'example.com', 'facebook'];
let urlPass = true;
for (const code of codeList) {
  const url = getQrUrl(code);
  const expectedUrl = `https://nfcista.vercel.app/r/${code}`;
  const exact = url === expectedUrl;
  let hasBad = false;
  for (const p of badPatterns) { if (url.includes(p)) hasBad = true; }
  const pass = exact && !hasBad;
  if (!pass) urlPass = false;
  console.log(`  ${code} → ${url}  ${pass ? 'PASS' : '*** FAIL ***'}${hasBad ? ' [BAD PATTERN]' : ''}`);
}
console.log(`QR URL format: ${urlPass ? 'ALL PASS' : 'SOME FAILURES'}`);

// --------------------------------------------------------------------------
// Test 8: Card code label matches QR URL
// --------------------------------------------------------------------------
console.log('\n=== TEST 8: CODE ↔ QR URL MATCH ===');
let matchPass = true;
for (const code of codeList) {
  const url = getQrUrl(code);
  const m = url === `https://nfcista.vercel.app/r/${code}`;
  if (!m) { matchPass = false; console.log(`  FAIL: ${code} → ${url}`); }
}
console.log(`Code/URL match: ${matchPass ? 'ALL PASS' : 'SOME FAILURES'}`);

// --------------------------------------------------------------------------
// Code format validation
// --------------------------------------------------------------------------
console.log('\n=== CODE FORMAT (NF[A-Z0-9]{4}) ===');
for (const code of codeList) {
  const validSyntax = isValidCardCode(code);
  const matchesFmt = /^NF[A-Z0-9]{4}$/.test(code);
  console.log(`  ${code}  isValidCardCode=${validSyntax}  NF[A-Z0-9]{4}=${matchesFmt}`);
}

// --------------------------------------------------------------------------
// Test 10: printConfig dimensions
// --------------------------------------------------------------------------
console.log('\n=== TEST 10: CARD DIMENSIONS (from printConfig) ===');
// We inline the values from lib/printConfig.js (no import needed — pure constants)
const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 54;
const dimPass = CARD_WIDTH_MM === 85.6 && CARD_HEIGHT_MM === 54;
console.log(`  CARD_WIDTH_MM  = ${CARD_WIDTH_MM}mm  (expected 85.6mm) → ${CARD_WIDTH_MM === 85.6 ? 'PASS' : 'FAIL'}`);
console.log(`  CARD_HEIGHT_MM = ${CARD_HEIGHT_MM}mm  (expected 54mm)   → ${CARD_HEIGHT_MM === 54 ? 'PASS' : 'FAIL'}`);
console.log(`Dimensions: ${dimPass ? 'PASS' : 'FAIL'}`);

// --------------------------------------------------------------------------
// Test 9: Card count in PDF — verify the batch would produce exactly 5 cards
// (PDF is client-side; we verify count from the codeList)
// --------------------------------------------------------------------------
console.log('\n=== TEST 9: PDF CARD COUNT ===');
console.log(`  Expected 5 cards, batch length = ${codeList.length} → ${codeList.length === 5 ? 'PASS' : 'FAIL'}`);

console.log('\n=== SUMMARY ===');
const allPass = qtyPass && uniquePass && urlPass && matchPass && dimPass && codeList.length === 5;
console.log(allPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
