/**
 * NFCISTA Core Baseline Verification Script
 * Validates Phase 1 requirements:
 * - Dynamic QR validation, extraction, batch bounds & print config
 * - Customer profile fallbacks, slug normalization & URL sanitization
 * - Product catalog slug generation, pricing & status configurations
 * - Security headers (CSP, permissions policy) & rate limiting
 */

import fs from 'fs';
import path from 'path';

// Load .env.local if present
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length > 0) {
      const val = rest.join('=').replace(/^["']|["']$/g, '').trim();
      process.env[key.trim()] = val;
    }
  }
}

const { isValidCardCode, extractCardCodeFromQr, generateCardCode, getQrUrl } = await import('../lib/dynamicQr.js');
const {
  CARD_WIDTH_MM,
  CARD_HEIGHT_MM,
  CARD_GAP_MM,
  PAGE_MARGIN_MM,
  PDF_PAGE_FORMAT,
  QR_SHEET_COLS,
  QR_SHEET_ROWS,
  QR_SHEET_PAGE_FORMAT,
} = await import('../lib/printConfig.js');
const {
  getCustomerBySlug,
  isValidHttpUrl,
  isValidHttpsUrl,
  getSafeExternalHttpsUrl,
  getSafeTwitterUrl,
  getSafeGoogleDriveUrl,
} = await import('../lib/customers.js');
const { generateSlug, formatPrice, STOCK_STATUS_CONFIG } = await import('../lib/products.js');
const { checkRateLimit, getClientIp } = await import('../lib/rateLimit.js');

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedAssertions++;
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
  }
}

console.log('====================================================');
console.log('NFCISTA PHASE 1: CORE BASELINE VERIFICATION');
console.log('====================================================\n');

// --------------------------------------------------------------------------
// 1. DYNAMIC QR & HARDWARE VERIFICATION
// --------------------------------------------------------------------------
console.log('--- 1. Dynamic QR & Hardware Linking ---');

// Card code syntax validation
assert(isValidCardCode('NF8K29') === true, 'isValidCardCode accepts standard alphanumeric code');
assert(isValidCardCode('NF_TEST-1') === true, 'isValidCardCode accepts underscore and hyphens');
assert(isValidCardCode('AB') === false, 'isValidCardCode rejects codes shorter than 3 chars');
assert(isValidCardCode('') === false, 'isValidCardCode rejects empty string');
assert(isValidCardCode(null) === false, 'isValidCardCode rejects null');
assert(isValidCardCode('NF@!#$') === false, 'isValidCardCode rejects special characters');

// QR extraction logic
const validQrUrl = 'https://nfcista.vercel.app/r/NF8K29';
const extracted = extractCardCodeFromQr(validQrUrl);
assert(extracted.valid === true && extracted.cardCode === 'NF8K29', 'extractCardCodeFromQr extracts code from production URL');

const lowerQrUrl = 'https://nfcista.vercel.app/r/nf8k29';
const extractedLower = extractCardCodeFromQr(lowerQrUrl);
assert(extractedLower.valid === true && extractedLower.cardCode === 'NF8K29', 'extractCardCodeFromQr normalizes to uppercase');

const foreignUrl = 'https://evil-attacker.example.com/r/NF8K29';
const extractedForeign = extractCardCodeFromQr(foreignUrl);
assert(extractedForeign.valid === false, 'extractCardCodeFromQr rejects foreign third-party domains');

const rawNonUrl = 'JUST-SOME-TEXT';
const extractedNonUrl = extractCardCodeFromQr(rawNonUrl);
assert(extractedNonUrl.valid === false, 'extractCardCodeFromQr rejects non-URL text');

// Quantity bounds: integer between 1 and 50
function validateBatchQty(qty) {
  const n = Number(qty);
  return Number.isInteger(n) && n >= 1 && n <= 50;
}
assert(validateBatchQty(1) === true, 'Batch quantity 1 is valid');
assert(validateBatchQty(50) === true, 'Batch quantity 50 is valid');
assert(validateBatchQty(0) === false, 'Batch quantity 0 is rejected');
assert(validateBatchQty(51) === false, 'Batch quantity 51 is rejected');
assert(validateBatchQty(10.5) === false, 'Batch quantity decimal is rejected');

// Print config geometry: standard CR80 credit card dimensions
assert(CARD_WIDTH_MM === 85.6, 'CARD_WIDTH_MM conforms to standard 85.6mm');
assert(CARD_HEIGHT_MM === 54, 'CARD_HEIGHT_MM conforms to standard 54mm');
assert(PDF_PAGE_FORMAT === 'a4' && QR_SHEET_PAGE_FORMAT === 'a4', 'PDF formats target A4 paper standard');
assert(QR_SHEET_COLS === 4 && QR_SHEET_ROWS === 5, 'QR-only sheet uses 4x5 grid (20 items per page)');

// --------------------------------------------------------------------------
// 2. PUBLIC PROFILE & PRODUCT CATALOG VERIFICATION
// --------------------------------------------------------------------------
console.log('\n--- 2. Public Profile & Product Catalog Data Layer ---');

// Fallback demo profiles
const demoCustomer = await getCustomerBySlug('demo-customer');
assert(demoCustomer !== null && demoCustomer.full_name === 'Test Customer', 'getCustomerBySlug returns fallback demo customer');
assert(demoCustomer && demoCustomer.phone && demoCustomer.email, 'demo-customer fallback includes contact information');

const demoPhotoCustomer = await getCustomerBySlug('demo-customer-photo');
assert(demoPhotoCustomer !== null && typeof demoPhotoCustomer.photo_url === 'string', 'demo-customer-photo includes valid photo URL');

const invalidCustomer = await getCustomerBySlug('nonexistent-slug-xyz-999');
assert(invalidCustomer === null, 'getCustomerBySlug returns null for unknown slugs');

// URL sanitization helpers
assert(isValidHttpUrl('https://example.com') === true, 'isValidHttpUrl accepts valid HTTPS URL');
assert(isValidHttpUrl('http://example.com') === true, 'isValidHttpUrl accepts valid HTTP URL');
assert(isValidHttpUrl('javascript:alert(1)') === false, 'isValidHttpUrl rejects javascript: scheme');
assert(isValidHttpsUrl('https://secure.com') === true, 'isValidHttpsUrl accepts HTTPS');
assert(isValidHttpsUrl('http://insecure.com') === false, 'isValidHttpsUrl rejects unencrypted HTTP');

assert(getSafeTwitterUrl('elonmusk') === 'https://x.com/elonmusk', 'getSafeTwitterUrl formats handle to x.com URL');
assert(getSafeTwitterUrl('@jack') === 'https://x.com/jack', 'getSafeTwitterUrl handles leading @ sign');

assert(getSafeGoogleDriveUrl('https://drive.google.com/drive/folders/12345') === 'https://drive.google.com/drive/folders/12345', 'getSafeGoogleDriveUrl allows official drive URLs');
assert(getSafeGoogleDriveUrl('https://phishing.example.com/drive') === null, 'getSafeGoogleDriveUrl blocks unauthorized domains');

// Product catalog utilities
assert(generateSlug('Google Review NFC Card') === 'google-review-nfc-card', 'generateSlug creates URL-friendly slug');
assert(generateSlug('WhatsApp  NFC  Stand!!!') === 'whatsapp-nfc-stand', 'generateSlug strips special characters and collapses spaces');

assert(formatPrice(999) === '₹999', 'formatPrice formats INR number with ₹');
assert(formatPrice(1499.50) === '₹1,499.5', 'formatPrice applies en-IN thousand separators');
assert(formatPrice(null) === null, 'formatPrice returns null for null input');

assert(STOCK_STATUS_CONFIG.in_stock && STOCK_STATUS_CONFIG.in_stock.label === 'In Stock', 'STOCK_STATUS_CONFIG defines in_stock');
assert(STOCK_STATUS_CONFIG.coming_soon && STOCK_STATUS_CONFIG.coming_soon.label === 'Coming Soon', 'STOCK_STATUS_CONFIG defines coming_soon');
assert(STOCK_STATUS_CONFIG.out_of_stock && STOCK_STATUS_CONFIG.out_of_stock.label === 'Out of Stock', 'STOCK_STATUS_CONFIG defines out_of_stock');

// --------------------------------------------------------------------------
// 3. SECURITY HEADERS & RATE LIMITING VERIFICATION
// --------------------------------------------------------------------------
console.log('\n--- 3. Security Headers & Proxy Configuration ---');

// Check next.config.mjs Content Security Policy
const nextConfigContent = fs.readFileSync(path.resolve('next.config.mjs'), 'utf8');
assert(nextConfigContent.includes("default-src 'self'"), "next.config.mjs CSP enforces default-src 'self'");
assert(nextConfigContent.includes("frame-ancestors 'none'"), "next.config.mjs CSP enforces frame-ancestors 'none'");
assert(nextConfigContent.includes("X-Frame-Options") && nextConfigContent.includes("DENY"), "next.config.mjs enforces X-Frame-Options: DENY");
assert(nextConfigContent.includes("X-Content-Type-Options") && nextConfigContent.includes("nosniff"), "next.config.mjs enforces X-Content-Type-Options: nosniff");
assert(nextConfigContent.includes("/admin/qr-scan") && nextConfigContent.includes("camera=(self)"), "next.config.mjs grants camera permission specifically to /admin/qr-scan");

// Rate limit logic verification
const testIp = `test-ip-${Date.now()}`;
const limitOptions = { limit: 3, windowMs: 5000 };

const r1 = await checkRateLimit(testIp, limitOptions);
const r2 = await checkRateLimit(testIp, limitOptions);
const r3 = await checkRateLimit(testIp, limitOptions);
const r4 = await checkRateLimit(testIp, limitOptions);

assert(r1.success === true && r1.remaining === 2, 'checkRateLimit: first request succeeds with remaining 2');
assert(r2.success === true && r2.remaining === 1, 'checkRateLimit: second request succeeds with remaining 1');
assert(r3.success === true && r3.remaining === 0, 'checkRateLimit: third request succeeds with remaining 0');
assert(r4.success === false && r4.remaining === 0, 'checkRateLimit: fourth request is rate limited (success: false)');

// Client IP parsing verification
const mockReqWithRealIp = {
  headers: new Headers({ 'x-real-ip': '203.0.113.195', 'x-forwarded-for': '198.51.100.1, 203.0.113.195' }),
};
assert(getClientIp(mockReqWithRealIp) === '203.0.113.195', 'getClientIp prioritizes x-real-ip');

console.log('\n====================================================');
console.log(`TOTAL ASSERTIONS: ${passedAssertions + failedAssertions}`);
console.log(`PASSED: ${passedAssertions}`);
console.log(`FAILED: ${failedAssertions}`);
console.log('====================================================');

if (failedAssertions > 0) {
  process.exit(1);
} else {
  console.log('✓ ALL BASELINE CORE CHECKS PASSED SUCCESSFULLY.');
  process.exit(0);
}
