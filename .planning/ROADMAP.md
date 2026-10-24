# Roadmap: NFCISTA

## Overview

NFCISTA is evolving from an existing Next.js 16 + Supabase digital business card application into an enterprise-grade, secure, and scalable product platform. The roadmap is structured in 5 focused, vertical MVP phases: establishing the core regulatory baseline (DPDP consent collection) while maintaining production stability, unlocking review assistant and enquiry lead workflows, empowering customer self-service and password recovery, delivering scan and profile engagement analytics, and standardizing automated testing and compliance operations.

## Phases

- [ ] **Phase 1: Foundation Baseline & Regulatory Consent** - Maintain 100% stable production routing and wire DPDP consent recording into admin onboarding
- [ ] **Phase 2: Review Assistant & Lead Enquiry Operations** - Unify customer lead capture and launch the customer review generation hub
- [ ] **Phase 3: Customer Self-Service & Account Recovery** - Implement cardholder password reset, account recovery, and dashboard media management
- [ ] **Phase 4: Card & Profile Analytics** - Track dynamic QR scan events, profile interactions, and expose metrics in dashboards
- [ ] **Phase 5: Platform Reliability, Automated Testing & Compliance** - Standardize test execution (`npm test`) and data subject rights request workflows

## Phase Details

### Phase 1: Foundation Baseline & Regulatory Consent
**Goal**: Solidify the existing production baseline, ensuring dynamic QR redirects, public profile rendering, and admin onboarding comply with DPDP consent recording without breaking changes.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-05, QR-01, QR-02, QR-03, QR-04, PROF-01, PROF-02, PROF-03, PROF-04, SEC-03
**Success Criteria** (what must be TRUE):
  1. Existing dynamic QR redirects (`/r/[cardCode]`) and public customer profiles (`/p/[slug]`) resolve with zero regressions.
  2. Admin onboarding flow explicitly captures customer DPDP consent and creates corresponding records in `public.customer_consents`.
  3. Dynamic QR code batch generator, vector print PDF builder, and camera scanning remain 100% functional.
**Plans**: 2 plans

Plans:
- [ ] 01-01: Audit and verify core redirects, profile rendering, and dynamic QR tools
- [ ] 01-02: Wire DPDP consent capture and storage into admin customer onboarding

### Phase 2: Review Assistant & Lead Enquiry Operations
**Goal**: Enhance cardholder value by enabling direct customer lead capture and giving businesses a local, zero-cost Google Review generation hub.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: ADMIN-03, ADMIN-04, PROF-05, REV-01, REV-02, REV-03
**Success Criteria** (what must be TRUE):
  1. Profile visitors can submit an enquiry lead with real-time UI feedback and backend rate limiting.
  2. Admin dashboard includes an enquiries inbox to review, filter, and track inbound business leads.
  3. Admin can toggle the Review Assistant per business, and customers can generate multilingual review drafts and jump to Google Reviews.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Admin enquiries inbox and status tracking interface
- [ ] 02-02: Review Assistant admin configuration toggle and public hub integration

### Phase 3: Customer Self-Service & Account Recovery
**Goal**: Provide cardholders with a complete self-service account portal featuring secure password resets and independent media asset management.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. Cardholders can request a password reset email and establish new credentials through a dedicated recovery screen.
  2. Authenticated customers can update their bio, profile photo, and banner image directly from their dashboard.
  3. Customer gallery manager supports uploading, deleting, and reordering showcase items with proper RLS isolation.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Password reset, email recovery flow, and customer session verification
- [ ] 03-02: Self-service profile details, banner upload, and gallery manager hardening

### Phase 4: Card & Profile Analytics
**Goal**: Measure card usage and engagement by logging scan interactions and presenting actionable metrics to admins and cardholders.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: ANLYT-01, ANLYT-02, ANLYT-03
**Success Criteria** (what must be TRUE):
  1. Dynamic QR redirects log scan events (timestamp, device type, referrer) asynchronously with zero user-perceptible redirect delay.
  2. Admin dashboard displays total scans, unique visits, and top-performing cards.
  3. Customer dashboard presents personal scan activity and monthly engagement counts.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Scan event telemetry logging and database tracking schema
- [ ] 04-02: Analytics dashboards for admin console and customer self-service

### Phase 5: Platform Reliability, Automated Testing & Compliance
**Goal**: Standardize continuous testing and operational compliance tooling to ensure lasting platform stability and data principal rights management.
**Mode:** mvp
**Depends on**: Phase 1, Phase 2, Phase 3, Phase 4
**Requirements**: SEC-01, SEC-02
**Success Criteria** (what must be TRUE):
  1. A single unified `npm test` command executes unit math, API authorization, and route security tests.
  2. Admin console provides an interface to review, process, and record DPDP data subject requests (access, correction, erasure).
  3. All critical routes adhere to strict Content Security Policy and IP rate-limiting rules.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Test harness unification under `npm test` covering unit and API routes
- [ ] 05-02: DPDP Data Subject Request (DSR) management admin dashboard

---
*Roadmap defined: 2026-10-24*
*Last updated: 2026-10-24 after initialization*
