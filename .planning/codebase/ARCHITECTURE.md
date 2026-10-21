---
last_mapped_commit: e82e2e9c51609e0007eac1fd5144efee1abce385
last_mapped_at: 2026-10-21
---
# Architecture Patterns

**Analysis Date:** 2026-10-21

## System Overview

NFCISTA is a digital-first physical NFC card platform designed for professionals, retail businesses, and corporate teams. The application integrates physical NFC cards and printed QR codes with personalized digital cards, product marketing pages, and an administrative control plane.

```
                      +-----------------------------+
                      |       Client Browser        |
                      +--------------+--------------+
                                     |
               HTTPS / Next.js 16 Proxy (`proxy.js`)
          (Session Validation + IP Sliding Window Rate Limit)
                                     |
       +-----------------------------+-----------------------------+
       |                             |                             |
+------v------+               +------v------+               +------v------+
| Marketing & |               | Customer &  |               |  Admin CMS  |
| Public Card |               |  Dashboard  |               | & Hardware  |
| (/p/[slug], |               | (/dashboard |               | (/admin/*)  |
|  /products) |               |   /profile) |               |             |
+------+------+               +------+------+               +------+------+
       |                             |                             |
       +-----------------------------+-----------------------------+
                                     |
                          Data Access Layer (`lib/`)
                                     |
                                     v
                       +---------------------------+
                       |     Supabase Backend      |
                       | - PostgreSQL with RLS     |
                       | - RPC Stored Functions    |
                       | - Object Storage Buckets  |
                       | - GoTrue Auth System      |
                       +---------------------------+
```

## Architectural Patterns

### 1. Hybrid Rendering Architecture

- **Next.js 16 App Router:** Employs React Server Components (RSC) for initial page renders and static page layouts, alongside interactive Client Components (`"use client"`) for rich interactive widgets (e.g. `components/profile/ProfileGallery.jsx`, `components/review/ReviewHubClient.jsx`).
- **Metadata Generation:** `generateMetadata()` is used across dynamic routes (`/p/[slug]`) paired with React's `cache()` in `lib/customers.js` to deduplicate database RPC calls between metadata resolution and page component rendering.
- **On-Demand Cache Revalidation:** When an administrator or customer updates profile data, `app/api/admin/revalidate/route.js` and `lib/revalidateProfile.js` trigger `revalidatePath()` to clear cached profile pages instantly.

### 2. Layered Separation of Concerns

- **Routing & Edge Proxying:** `proxy.js` intercepts incoming HTTP requests to enforce route protection on `/admin/*` and apply rate limits on public customer profiles `/p/[slug]` and login attempts.
- **Presentation Layer (`components/`, `app/`):** Divided into domain-specific modules:
  - `components/home/`: Public marketing landing sections (hero, features, card showcase, FAQ).
  - `components/profile/`: Customer digital business card components (avatar, quick actions, gallery, QR modal, enquiry modal).
  - `components/admin/`: Administrative tools for managing customers, products, and dynamic QR cards.
  - `components/dashboard/`: Customer self-service dashboard controls.
- **Service & Domain Layer (`lib/`):** Pure utility and business logic isolated from UI rendering:
  - `lib/customers.js`: Customer retrieval, validation, and update functions.
  - `lib/dynamicQr.js`: QR code extraction, validation, and destination routing.
  - `lib/reviewGenerator.js`: Pure deterministic template-based customer review composer.
  - `lib/rateLimit.js`: In-memory sliding-window IP rate limiter.
- **Persistence & Security Layer (`supabase/`):** All database interactions rely on PostgreSQL Row Level Security (RLS) policies and security-definer RPC functions to protect against unauthorized reads, bulk enumeration, and SQL injection.

### 3. Pure Client-Side Computation

- **Local Review Assistant:** `lib/reviewGenerator.js` runs 100% locally in browser memory without third-party LLM calls, ensuring zero API fees, privacy for customer input, and instantaneous review generation in Hindi and English.
- **Client-Side vCard Generation:** `components/SaveContactButton.js` dynamically generates a `.vcf` file locally in the browser to download contact details directly into the phone's address book without server overhead.

---
*Codebase analysis: 2026-10-21*
<!-- refreshed: 2026-10-21 -->
