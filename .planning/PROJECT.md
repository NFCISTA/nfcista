# NFCISTA

## What This Is

NFCISTA is a SaaS-style platform for creating and managing NFC smart business cards and digital business profiles. Businesses and professionals receive a physical NFC card or printed QR code that links to a personalized digital profile hosted at a unique URL. The platform is built with Next.js 16 and Supabase, serving both a customer-facing public profile experience and an admin-controlled management console.

## Core Value

Every NFC card and QR code reliably reaches a live, accurate digital profile — and the business owner can always update that profile without reprinting anything.

## Business Context

- **Customer**: Small businesses, freelancers, and professionals who want a modern, tap-to-share digital business card
- **Revenue model**: One-time NFC card/QR product sales (physical), with future subscription tiers for advanced digital features (analytics, review assistant, more cards)
- **Success metric**: Active customer profiles with at least one scan per month
- **Strategy notes**: WhatsApp-first sales and onboarding; admin concierge model for profile creation

## Requirements

### Validated

<!-- Inferred from existing codebase -->

- ✅ Admin can create and manage customer profiles from a dashboard — existing
- ✅ Each customer has a unique digital profile URL (`/p/[slug]`) with full contact info, social links, and quick-action buttons — existing
- ✅ Admin can generate and assign Dynamic QR codes linked to customer profiles (codes like NF8K29 redirect to a destination URL updatable without reprinting) — existing
- ✅ Admin can batch-print QR code sheets as PDFs — existing
- ✅ Admin can scan existing QR codes with a camera to look up or activate cards — existing
- ✅ Customer profiles support Google Review URL, Instagram, WhatsApp, phone, email, website, Facebook, LinkedIn, Twitter (X), and Google Drive links — existing
- ✅ Customers can optionally log in to a self-service dashboard and update their own profile, photo, and gallery — existing
- ✅ Admin can upload and manage a product catalog with images and pricing — existing
- ✅ Public product landing pages exist for each NFC card type — existing
- ✅ Customer profiles include a photo, bio, and image gallery — existing
- ✅ Public enquiry form lets visitors contact the profile owner — existing
- ✅ Review Assistant generates local, template-based review text for customers (Hindi + English) — existing
- ✅ Admin and customer sessions are separately authenticated via Supabase Auth and HttpOnly cookies — existing
- ✅ IP-based rate limiting is applied to login and profile public routes — existing
- ✅ Security headers (CSP, X-Frame-Options, Permissions-Policy) are configured — existing
- ✅ DPDP Act 2023 (India) compliance schema and data subject rights framework is present in the database — existing

### Active

- [ ] Customer password reset and account recovery flow is functional end-to-end
- [ ] Card/profile analytics (scan count, last-seen, geographic or referrer data) are tracked and visible to admin
- [ ] Subscription/payment layer supports tiered SaaS plans
- [ ] Admin can view and manage customer enquiries centrally
- [ ] Review Assistant is gated behind a per-customer entitlement flag (already exists, needs admin toggle UI)
- [ ] Customer self-service banner image upload and update is stable and tested
- [ ] Test coverage for all critical API routes and business logic is standardized under a single test runner
- [ ] DPDP compliance — active consent collection is wired into the admin onboarding flow
- [ ] Admin can configure per-customer Review Assistant destinations and settings

### Out of Scope

- Native mobile app — web-first; PWA enhancements are acceptable but no React Native
- Real-time chat or messaging — out of scope for v1/v2; not core to card value
- Third-party LLM calls in Review Assistant — intentionally local to avoid cost and privacy risks
- Multi-tenant admin accounts (multiple admins) — single-admin concierge model for now
- Marketplace for card designs — deferred; design customization is physical/manual today

## Context

**Codebase:** Next.js 16 App Router (React 19), Supabase (PostgreSQL, Auth, Storage), Tailwind CSS 3, deployed on Vercel. See `.planning/codebase/` for detailed maps.

**Production state:** The application is live and serving real customers. Changes must not break existing NFC card redirects (`/r/[cardCode]`), public profile pages (`/p/[slug]`), or the admin dashboard. Backward compatibility with all database schemas is required.

**DPDP compliance:** The platform processes personal data of Indian data principals. The `customer_consents` and `data_subject_requests` schema exists but consent collection is not yet wired into admin onboarding. This is a regulatory gap that needs to be closed.

**Sales model:** Orders come via WhatsApp and email; admin manually creates profiles. No automated signup flow for customers exists — they receive a login invite after their card is created.

**Testing:** Custom Node.js `.mjs` scripts for unit and integration tests. No centralized test runner (`npm test`) or coverage reporting yet.

**Review Assistant:** Fully local, zero API cost, multilingual (Hindi/English). Gated by `review_assistant_enabled` flag per customer. Admin toggle UI for this flag is needed.

## Constraints

- **Tech stack**: Next.js 16 + Supabase + Tailwind + Vercel — no stack changes
- **Compatibility**: All existing NFC card URLs (`/r/[cardCode]`) and profile URLs (`/p/[slug]`) must remain stable; no breaking URL changes
- **Security**: DPDP Act 2023 compliance is a hard legal constraint for Indian data principals; cookie-based HttpOnly session auth must be preserved
- **Database**: All schema changes must be additive migrations only — no destructive changes to existing tables or RLS policies
- **Payments**: Razorpay preferred for Indian market when subscription/billing is introduced
- **Solo operation**: Single developer / solo admin model; complexity should be minimized

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Admin concierge model (no self-signup) | WhatsApp-first sales; admin controls quality of profiles | ✅ Good |
| Local review generation (no LLM API) | Zero cost, zero privacy risk, works offline | ✅ Good |
| HttpOnly cookie auth (not localStorage tokens) | XSS protection for both admin and customer sessions | ✅ Good |
| Supabase RPC for public profile reads | Prevents enumeration, enforces RLS at DB level | ✅ Good |
| Dynamic QR codes with redirect layer (`/r/[cardCode]`) | Allows destination updates without reprinting physical cards | ✅ Good |
| Vercel deployment (serverless) | Zero-ops hosting; works well with Next.js 16 | ✅ Good |
| Razorpay for future payments | Indian market standard; INR support, UPI integration | ⏳ Pending |
| DPDP consent collection in admin onboarding | Legal requirement; must wire schema to UI | ⏳ Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-24 after initialization*
