/**
 * DPDP Act 2023 Consent Recording Verification Script
 * Validates Phase 1 Plan 02:
 * - customer_consents schema constraint definitions
 * - recordConsentForCustomer payload compliance and structured error returns
 * - chk_consent_status_timestamps constraint logic verification
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, name, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${name}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${name} ${details ? `(${details})` : ''}`);
  }
}

console.log('====================================================');
console.log('NFCISTA: DPDP CONSENT RECORDING VERIFICATION');
console.log('====================================================\n');

// --------------------------------------------------------------------------
// 1. SCHEMA MIGRATION VALIDATION
// --------------------------------------------------------------------------
console.log('--- 1. Schema Migration & Constraints ---');

const migrationPath = path.resolve('supabase/migrations/20260919000000_dpdp_consent_and_rights.sql');
assert(fs.existsSync(migrationPath), 'DPDP migration file exists');

const migrationSql = fs.readFileSync(migrationPath, 'utf8');

assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.customer_consents'), 'Defines public.customer_consents table');
assert(migrationSql.includes('chk_consent_status_timestamps'), 'Defines chk_consent_status_timestamps constraint');
assert(migrationSql.includes("purpose IN ('public_profile_display', 'marketing_showcase', 'promotional_messages')"), 'Enforces valid statutory purposes');
assert(migrationSql.includes("consent_status IN ('granted', 'withdrawn', 'refused')"), 'Enforces valid consent statuses');
assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.data_subject_requests'), 'Defines public.data_subject_requests table');

// --------------------------------------------------------------------------
// 2. CHECK CONSTRAINT LOGIC VERIFICATION
// --------------------------------------------------------------------------
console.log('\n--- 2. Constraint Rule Verification ---');

/**
 * Evaluates the exact SQL CHECK constraint:
 * CONSTRAINT chk_consent_status_timestamps CHECK (
 *     (consent_status = 'granted' AND withdrawn_at IS NULL)
 *     OR (consent_status = 'withdrawn' AND withdrawn_at IS NOT NULL AND withdrawn_at >= granted_at)
 *     OR (consent_status = 'refused' AND withdrawn_at IS NULL)
 * )
 */
function validateConsentConstraint(status, grantedAt, withdrawnAt) {
  if (status === 'granted' && withdrawnAt === null) return true;
  if (status === 'withdrawn' && withdrawnAt !== null && new Date(withdrawnAt) >= new Date(grantedAt)) return true;
  if (status === 'refused' && withdrawnAt === null) return true;
  return false;
}

const now = new Date().toISOString();
const later = new Date(Date.now() + 60000).toISOString();
const earlier = new Date(Date.now() - 60000).toISOString();

assert(validateConsentConstraint('granted', now, null) === true, 'granted with null withdrawn_at is valid');
assert(validateConsentConstraint('granted', now, later) === false, 'granted with non-null withdrawn_at is rejected');
assert(validateConsentConstraint('withdrawn', now, later) === true, 'withdrawn with later withdrawn_at is valid');
assert(validateConsentConstraint('withdrawn', now, earlier) === false, 'withdrawn with earlier withdrawn_at is rejected');
assert(validateConsentConstraint('withdrawn', now, null) === false, 'withdrawn with null withdrawn_at is rejected');
assert(validateConsentConstraint('refused', now, null) === true, 'refused with null withdrawn_at is valid');
assert(validateConsentConstraint('refused', now, later) === false, 'refused with non-null withdrawn_at is rejected');

// --------------------------------------------------------------------------
// 3. APPLICATION CODE INTEGRATION (lib/customers.js)
// --------------------------------------------------------------------------
console.log('\n--- 3. Function & Payload Verification ---');

const { recordConsentForCustomer } = await import('../lib/customers.js');

assert(typeof recordConsentForCustomer === 'function', 'recordConsentForCustomer is exported as function');

// Null safety check
const nullResult = await recordConsentForCustomer(null);
assert(nullResult.success === false && nullResult.recorded === false, 'Rejects null customerId safely');

// Empty string safety check
const emptyResult = await recordConsentForCustomer('');
assert(emptyResult.success === false && emptyResult.recorded === false, 'Rejects empty customerId safely');

// Invocation with dummy customer ID (non-destructive; fails-open safely)
const dummyResult = await recordConsentForCustomer('00000000-0000-0000-0000-000000000000');
assert(typeof dummyResult === 'object' && dummyResult !== null, 'Returns structured response object');
assert('success' in dummyResult && 'recorded' in dummyResult, 'Response includes success and recorded booleans');

// Verify admin page integration
const adminPageContent = fs.readFileSync(path.resolve('app/admin/page.js'), 'utf8');
assert(adminPageContent.includes('recordConsentForCustomer'), 'app/admin/page.js imports and invokes recordConsentForCustomer');
assert(adminPageContent.includes('consentConfirmed'), 'app/admin/page.js enforces consentConfirmed state');
assert(adminPageContent.includes('[Required to Publish]:'), 'app/admin/page.js displays customer approval label');

console.log('\n====================================================');
console.log(`TOTAL ASSERTIONS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✓ ALL DPDP CONSENT RECORDING CHECKS PASSED.');
  process.exit(0);
}
