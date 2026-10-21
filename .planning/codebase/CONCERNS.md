---
last_mapped_commit: e82e2e9c51609e0007eac1fd5144efee1abce385
last_mapped_at: 2026-10-21
---
# Technical Debt & Codebase Concerns

**Analysis Date:** 2026-10-21

## 1. Regulatory & Compliance (DPDP Act 2023)

- **Consent Recording Gap:** As analyzed in `DPDP_PROGRESS.md`, while the PostgreSQL schema migration `supabase/migrations/20260919000000_dpdp_consent_and_rights.sql` introduced `customer_consents` and `data_subject_requests`, administrative customer onboarding currently creates records directly in `customers` without creating corresponding consent records. Electronic opt-in workflows for publishing personal direct contact information must be bridged into onboarding.
- **Data Breach Incident Reporting:** As outlined in `BREACH_RUNBOOK.md`, the platform requires clear CERT-In / DPDP breach handling procedures and periodic simulated audit drills.

## 2. Test Architecture Standardization

- **Lack of Unified Test Runner:** Tests are executed via individual standalone `.js` and `.mjs` Node scripts rather than a standard test runner (like Vitest or Jest). While fast and zero-config, there is no centralized test runner command (`npm test`) or code coverage reporting.

## 3. Storage & Media Management

- **Storage Bucket Sync:** Customer photo uploads, gallery images, and product images reside in separate Supabase storage buckets (`profile-photos`, `gallery-images`, `products`). Deletion of database customer rows or gallery items does not automatically clean up orphan image files from storage buckets unless an explicit webhook or cascade trigger is configured.
- **Image Size Limits:** Large uncompressed mobile camera uploads can increase bandwidth consumption. Client-side compression or image optimization pipeline before upload is recommended.

## 4. Next.js 16 Transition & Deprecations

- **`proxy.js` vs Middleware:** Next.js 16 experimental proxy conventions are in use (`proxy.js`). Upgrades to future Next.js minor versions should be tracked to ensure continuous compatibility with standard middleware signatures.
- **CSP Maintenance:** The strict CSP in `next.config.mjs` must be updated whenever new external domains (analytics, payment gateways, review platforms) are integrated.

---
*Codebase analysis: 2026-10-21*
<!-- refreshed: 2026-10-21 -->
