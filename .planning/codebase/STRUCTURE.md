---
last_mapped_commit: e82e2e9c51609e0007eac1fd5144efee1abce385
last_mapped_at: 2026-10-21
---
# Codebase Structure

**Analysis Date:** 2026-10-21

## Directory Layout

```
.
├── app/                          # Next.js 16 App Router pages and API route handlers
│   ├── admin/                    # Admin portal pages (login, dashboard, gallery, qr tools)
│   ├── api/                      # RESTful API route endpoints
│   │   ├── admin/                # Admin-authenticated backend operations
│   │   ├── customer/             # Customer-authenticated self-service endpoints
│   │   ├── enquiry/              # Public lead enquiry submission endpoint
│   │   ├── review-assistant/     # Review helper API endpoint
│   │   └── session/              # Client session state resolution
│   ├── dashboard/                # Customer self-service dashboard pages
│   ├── dev/                      # Developer utilities and test harnesses
│   ├── login/                    # Customer authentication login view
│   ├── privacy/                  # DPDP privacy notice and data subject request forms
│   ├── products/                 # Public product catalog and landing pages
│   ├── terms/                    # Terms and conditions page
│   ├── globals.css               # Global CSS styling with Tailwind directives
│   ├── layout.js                 # Root layout with site metadata and global shell
│   └── page.js                   # NFCISTA marketing homepage
├── components/                   # Reusable React UI component library
│   ├── admin/                    # Admin portal specific UI widgets
│   ├── dashboard/                # Customer dashboard UI widgets
│   ├── home/                     # Marketing homepage sectional components
│   ├── products/                 # Product detail and listing cards
│   ├── profile/                  # Digital business card interactive components
│   ├── qr/                       # Dynamic QR rendering components
│   └── review/                   # Review Assistant interactive hub components
├── data/                         # Static fallback and seed data
│   ├── products.js               # Default fallback catalog items
│   └── profile.js                # Default demo customer profile mock
├── lib/                          # Core business logic, SDK wrappers, and domain services
│   ├── adminAuth.js              # Admin authentication verification
│   ├── customerAuth.js           # Customer authentication verification
│   ├── customers.js              # Customer profile CRUD and data retrieval
│   ├── dynamicQr.js              # Dynamic QR card validation and routing
│   ├── gallery.js                # Customer image gallery helper logic
│   ├── printConfig.js            # Vector print layout sizing and constants
│   ├── products.js               # Product catalog queries and formatting
│   ├── rateLimit.js              # Sliding-window IP rate limiter
│   ├── revalidateProfile.js      # On-demand cache revalidation
│   ├── reviewAssistant.js        # Review feature entitlements
│   ├── reviewChips.js            # Review sentiment chips and phrases
│   ├── reviewGenerator.js        # Deterministic multilingual review generator
│   ├── siteConfig.js             # Base domain configuration
│   └── supabaseClient.js         # Supabase client singleton
├── public/                       # Static public assets (images, logos, product renders)
├── scripts/                      # Verification, database migration, and test scripts
└── supabase/                     # Supabase database migrations and schema definitions
    └── migrations/               # Numbered SQL migration files
```

## Key Locations & Entry Points

- **Marketing Landing Page:** `app/page.js`
- **Customer Digital Business Card:** `app/p/[slug]/page.js` (or routed dynamically)
- **Dynamic QR Code Redirect:** `app/r/[cardCode]/route.js` (or dynamic destination resolver)
- **Admin Management Console:** `app/admin/page.js`
- **Customer Self-Service Dashboard:** `app/dashboard/page.js`
- **Global Proxy / Route Guard:** `proxy.js`
- **Database Schema & Migrations:** `supabase/migrations/`

## Naming Conventions

- **Next.js Pages & Routes:** `page.js`, `layout.js`, `route.js` following App Router standard
- **React Components:** PascalCase with `.jsx` or `.js` extension (e.g., `components/profile/ProfileAvatar.jsx`, `components/home/Hero.jsx`)
- **Backend Utilities & Libraries:** camelCase with `.js` extension (e.g., `lib/dynamicQr.js`, `lib/supabaseClient.js`)
- **Database Migrations:** Timestamped prefixed SQL files (e.g., `supabase/migrations/20261021000000_add_review_assistant.sql`)
- **Test Scripts:** Prefixed runner scripts with `.js` or `.mjs` (e.g., `test-step11-unit.mjs`, `scripts/test-banner-feature.mjs`)

---
*Codebase analysis: 2026-10-21*
<!-- refreshed: 2026-10-21 -->
