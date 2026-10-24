# Requirements: NFCISTA

**Defined:** 2026-10-24
**Core Value:** Every NFC card and QR code reliably reaches a live, accurate digital profile — and the business owner can always update that profile without reprinting anything.

## v1 Requirements

Requirements for active roadmap milestones. Each maps directly to roadmap phases.

### Administration & Concierge Onboarding (ADMIN)

- [ ] **ADMIN-01**: Admin can create and update customer profiles with contact, social, and business details via CMS
- [ ] **ADMIN-02**: Admin can capture and record explicit DPDP-compliant customer consent during onboarding
- [ ] **ADMIN-03**: Admin can view and manage inbound customer lead enquiries from a centralized dashboard
- [ ] **ADMIN-04**: Admin can toggle and configure the Review Assistant feature per customer profile
- [ ] **ADMIN-05**: Admin can manage the hardware product catalog (pricing, inventory status, product images)

### Dynamic QR & Hardware Linking (QR)

- [ ] **QR-01**: Dynamic QR redirect (`/r/[cardCode]`) routes visitors to the customer's designated destination without URL breakage
- [ ] **QR-02**: Admin can batch-generate dynamic QR cards with configurable quantity limits (1–50)
- [ ] **QR-03**: Admin can generate print-ready vector PDF sheets for batch card manufacturing
- [ ] **QR-04**: Admin can activate and reassign unallocated QR cards using browser camera scanning

### Public Digital Business Profile (PROF)

- [ ] **PROF-01**: Visitor can view a fast, mobile-first public profile at `/p/[slug]` with deduplicated server rendering
- [ ] **PROF-02**: Visitor can download a generated vCard (`.vcf`) directly into native mobile contacts
- [ ] **PROF-03**: Visitor can trigger one-tap actions for WhatsApp, phone calling, email, and Google Maps directions
- [ ] **PROF-04**: Visitor can browse customer image gallery showcases and view enlarged portfolio media
- [ ] **PROF-05**: Visitor can submit an enquiry form that securely logs a lead for the profile owner

### Review Assistant (REV)

- [ ] **REV-01**: Eligible businesses can share a dedicated Review Assistant destination link with customers
- [ ] **REV-02**: Customers can generate review drafts deterministically in Hindi or English using sentiment chips
- [ ] **REV-03**: Customers can copy generated review text and jump directly to the business's Google Review URL

### Customer Self-Service & Account Recovery (AUTH)

- [ ] **AUTH-01**: Customers can log in securely using password or magic link with HttpOnly session cookies
- [ ] **AUTH-02**: Customers can request a password reset email link and complete account recovery
- [ ] **AUTH-03**: Customers can update their bio, profile photo, banner image, and contact links via dashboard
- [ ] **AUTH-04**: Customers can upload, delete, and reorder images in their business portfolio gallery

### Card & Profile Analytics (ANLYT)

- [ ] **ANLYT-01**: Platform logs scan events on dynamic QR redirects (timestamp, card code, referrer, user agent)
- [ ] **ANLYT-02**: Admin can view total and unique scan metrics per card and customer profile
- [ ] **ANLYT-03**: Customer dashboard displays monthly scan and profile engagement metrics

### Platform Security, Quality & Compliance (SEC)

- [ ] **SEC-01**: Codebase includes a standardized test suite executable via `npm test` covering unit and API routes
- [ ] **SEC-02**: DPDP data subject requests (access, correction, erasure) have functional admin management views
- [ ] **SEC-03**: Strict CSP headers and IP rate limiting are continuously enforced across public and auth endpoints

## v2 Requirements

Deferred to subsequent commercial growth milestones.

### Subscriptions & SaaS Monetization (BILL)

- **BILL-01**: Customers can subscribe to recurring Pro tiers using Razorpay (UPI, cards, netbanking)
- **BILL-02**: Platform automatically gates premium features (custom domains, advanced analytics, multi-card) based on active billing status
- **BILL-03**: Customers can view billing invoices, receipts, and manage renewal status

### Enterprise & Team Management (TEAM)

- **TEAM-01**: Corporate accounts can manage multiple employee cards under a single organization
- **TEAM-02**: Organization admin can bulk-import employee rosters via CSV

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile apps (iOS / Android) | Responsive web app and PWA capabilities meet all requirements without app store friction |
| Real-time chat / messaging | Core value is contact discovery and handoff; WhatsApp integration handles direct communication |
| Third-party LLM APIs for reviews | Local template engine eliminates API costs, guarantees privacy, and delivers instant generation |
| Multi-admin role hierarchy | Single admin / concierge model is sufficient for current operational scale |
| User card layout custom CSS editor | Pre-tested standardized mobile layouts prevent broken cards and maintain brand quality |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ADMIN-01 | Phase 1 | Complete (Existing) |
| ADMIN-02 | Phase 1 | Pending |
| ADMIN-03 | Phase 2 | Pending |
| ADMIN-04 | Phase 2 | Pending |
| ADMIN-05 | Phase 1 | Complete (Existing) |
| QR-01 | Phase 1 | Complete (Existing) |
| QR-02 | Phase 1 | Complete (Existing) |
| QR-03 | Phase 1 | Complete (Existing) |
| QR-04 | Phase 1 | Complete (Existing) |
| PROF-01 | Phase 1 | Complete (Existing) |
| PROF-02 | Phase 1 | Complete (Existing) |
| PROF-03 | Phase 1 | Complete (Existing) |
| PROF-04 | Phase 1 | Complete (Existing) |
| PROF-05 | Phase 2 | Complete (Existing) |
| REV-01 | Phase 2 | Complete (Existing) |
| REV-02 | Phase 2 | Complete (Existing) |
| REV-03 | Phase 2 | Complete (Existing) |
| AUTH-01 | Phase 3 | Complete (Existing) |
| AUTH-02 | Phase 3 | Pending |
| AUTH-03 | Phase 3 | Pending |
| AUTH-04 | Phase 3 | Complete (Existing) |
| ANLYT-01 | Phase 4 | Pending |
| ANLYT-02 | Phase 4 | Pending |
| ANLYT-03 | Phase 4 | Pending |
| SEC-01 | Phase 5 | Pending |
| SEC-02 | Phase 5 | Pending |
| SEC-03 | Phase 1 | Complete (Existing) |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0 ✅

---
*Requirements defined: 2026-10-24*
*Last updated: 2026-10-24 after initial project definition*
