---
last_mapped_commit: e82e2e9c51609e0007eac1fd5144efee1abce385
last_mapped_at: 2026-10-21
---
# Testing Patterns & Frameworks

**Analysis Date:** 2026-10-21

## Testing Approach

The project utilizes an automated script-driven verification architecture running directly on Node.js without heavy test runner overhead. Verification is divided into pure unit tests and live integration/security verification suites.

## Test Types & Organisation

### 1. Pure Unit Tests (Isolated from Database)

- Located in root and `scripts/`:
  - `test-step11-unit.mjs` - Dynamic QR code validation, formatting, and batch quantity bounds
  - `test-step11a-unit.mjs` - Card code extraction from QR URLs and domain whitelisting
  - `scripts/test-rate-limit-unit.js` - Sliding-window rate limiter math, IP isolation, and window resets
  - `scripts/test-photo-upload-unit.mjs` - File type verification, size thresholds, and image format sanitization
  - `scripts/test-review-generator.mjs` - Deterministic review text generation across seed variants and languages

### 2. Integration & RLS Security Tests

- Located in `scripts/`:
  - `scripts/test-gallery-security.js` - Validates customer gallery RLS policies and cross-customer write isolation
  - `scripts/test-admin-restriction.mjs` - Verifies that admin endpoints reject non-admin authenticated users
  - `scripts/test-session-separation.mjs` - Validates separation between admin and customer auth cookies
  - `scripts/test-banner-permissions.mjs` - Verifies customer banner upload and edit permissions
  - `scripts/test-enquiry-feature.mjs` - Tests public enquiry submission and customer inbox filtering

### 3. Production Verification Scripts

- Scripts designed to audit live production deployments:
  - `scripts/verify-prod-full.mjs` - Full end-to-end verification of production API routes
  - `scripts/check-vercel-deploy.mjs` - Verifies Vercel deployment status and healthy responses

## How to Run Tests

```bash

# Run unit tests

node test-step11-unit.mjs
node test-step11a-unit.mjs
node scripts/test-rate-limit-unit.js
node scripts/test-review-generator.mjs

# Run integration tests against configured Supabase

node scripts/test-session-separation.mjs
node scripts/test-admin-restriction.mjs
```

---
*Codebase analysis: 2026-10-21*
<!-- refreshed: 2026-10-21 -->
