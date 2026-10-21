---
last_mapped_commit: e82e2e9c51609e0007eac1fd5144efee1abce385
last_mapped_at: 2026-10-21
---
# External Integrations

**Analysis Date:** 2026-10-21

## Cloud Infrastructure & Hosting

- **Hosting Platform:** Vercel (Next.js serverless functions, static asset edge caching, domain routing `nfcista.vercel.app`)
- **Base Domain:** Configured via `lib/siteConfig.js` (`NFCISTA_BASE_URL = "https://nfcista.vercel.app"`)

## Database & Backend: Supabase

- **Service:** Supabase (Managed PostgreSQL 15+, Auth, Storage, Edge Functions)
- **Configuration:** Initialized in `lib/supabaseClient.js` using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Database Tables:**
  - `public.customers` - Customer business profiles, contact metadata, social handles, banner URLs, review URLs, activation flags
  - `public.customer_consents` - DPDP 2023 compliance consent records with strict timestamp constraints
  - `public.data_subject_requests` - DPDP 2023 data principal rights tracking (access, rectification, erasure, grievance)
  - `public.dynamic_qr_cards` - Dynamic QR code card registry, batch tracking, scan metrics, target customer links
  - `public.gallery_images` - Showcase and portfolio photo items associated with customer profiles
  - `public.products` - NFC hardware products catalog, pricing, availability badges, display order
  - `public.customer_enquiries` - Inbound lead enquiries captured via customer digital cards
- **Database Functions & RPCs:**
  - `get_customer_by_slug(slug_input)` - Secure lookup returning non-sensitive customer profile data
  - `get_dynamic_qr_destination(card_code_input)` - Dynamic destination resolver for NFC/QR scans
  - `is_admin()` - Auth check evaluating if current session belongs to an authorized administrator
  - `submit_enquiry(...)` - Safe unauthenticated lead submission with server validation
- **Storage Buckets:**
  - `profile-photos` - Public customer avatars (`lib/customerAuth.js`, `app/api/customer/photo/route.js`)
  - `gallery-images` - Customer portfolio imagery (`lib/gallery.js`, `app/api/customer/gallery/upload/route.js`)
  - `products` - Product catalog marketing assets (`lib/products.js`, `app/api/admin/products/upload/route.js`)

## Authentication Providers

- **Admin Authentication:**
  - Supabase Auth session token stored in `sb-admin-token` HttpOnly cookie or Authorization Bearer header
  - Server-side validation via `lib/adminAuth.js` and gated in `proxy.js`
- **Customer Self-Service Authentication:**
  - Supabase Auth session token stored in `sb-customer-token` HttpOnly cookie
  - Managed via `lib/customerAuth.js` and used for customer dashboard updates (`/dashboard/*`)

## Third-Party Communication & Links

- **WhatsApp API:**
  - Direct order placement via `components/products/WhatsAppOrderButton.jsx` (`https://wa.me/...`)
  - Contact action button on customer profiles (`components/ActionButtons.jsx`)
- **Google Maps & Google Reviews:**
  - Customer review redirect and Review Assistant hub integration (`components/review/ReviewHubClient.jsx`, `lib/reviewGenerator.js`)
- **Social Networks & Storage Links:**
  - Profiles support external links for Instagram, LinkedIn, Facebook, Twitter (X), and Google Drive (`supabase/migrations/20261017000000_add_facebook_linkedin_to_customers.sql`, `supabase/migrations/20261019000000_add_twitter_drive_to_customers.sql`)

---
*Codebase analysis: 2026-10-21*
<!-- refreshed: 2026-10-21 -->
