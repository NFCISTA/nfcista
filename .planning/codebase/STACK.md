---
last_mapped_commit: e82e2e9c51609e0007eac1fd5144efee1abce385
last_mapped_at: 2026-10-21
---
# Technology Stack

**Analysis Date:** 2026-10-21

## Languages

**Primary:**
- JavaScript (ES2022+ / Node ESM & JSX) - Used across all application logic, API route handlers, React components, and utility libraries (`app/**/*.js`, `components/**/*.jsx`, `lib/**/*.js`).

**Secondary:**
- SQL (PostgreSQL Dialect) - Used for database schemas, constraints, Row Level Security (RLS) policies, and database functions (`supabase/migrations/*.sql`).
- CSS (Tailwind CSS 3 directives) - Global styling and design system configuration (`app/globals.css`, `tailwind.config.js`).

## Runtime

**Environment:**
- Node.js: `>=18.17.0` (Targeting Node 20.x runtime on Vercel deployment)
- Next.js: `16.3.8` (App Router architecture with Next.js 16 conventions)

**Package Manager:**
- npm: `10.x`
- Lockfile: `package-lock.json` present and committed

## Frameworks & Libraries

**Core Frameworks:**
- Next.js `16.3.8` - Server-side rendering, API route handlers, static generation, image optimization, edge proxying
- React `19.0.0` & React DOM `19.0.0` - Component architecture, React Server Components (RSC), Client Components (`"use client"`), `cache()` utilities

**Styling & UI:**
- Tailwind CSS `^3.4.1` - Utility-first styling with custom typography and color schemes
- PostCSS `^8` & Autoprefixer `^10.0.1` - CSS vendor prefixing and post-processing
- Lucide React `^0.400.0` - Icon set used across customer profiles, admin dashboards, and navigation

**QR Code & Document Generation:**
- `qrcode` `^1.5.4` & `qrcode.react` `^4.2.0` - Client-side dynamic QR canvas rendering
- `html5-qrcode` `^2.3.8` - Browser-based camera QR code scanner in admin tools (`app/admin/qr-scan/page.js`)
- `jspdf` `^4.2.1` - Vector PDF generation for batch printing QR cards (`app/admin/qr-print/page.js`)

**Backend & Data Client:**
- `@supabase/supabase-js` `^2.116.0` - Client for Supabase PostgreSQL database, storage buckets, and auth

## Configuration Files

- `next.config.mjs` - Security headers (CSP, X-Frame-Options, Permissions-Policy, HSTS), remote image patterns for Supabase storage
- `tailwind.config.js` - Color palettes, font families, responsive breakpoints, content purge paths
- `postcss.config.js` - PostCSS plugin pipeline configuration
- `jsconfig.json` - Module path aliasing (`@/*` pointing to project root)
- `proxy.js` - Next.js 16 proxy / middleware handling server-side route gating and IP rate limiting

---
*Codebase analysis: 2026-10-21*
<!-- refreshed: 2026-10-21 -->
