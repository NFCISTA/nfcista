---
last_mapped_commit: e82e2e9c51609e0007eac1fd5144efee1abce385
last_mapped_at: 2026-10-21
---
# Coding Conventions & Patterns

**Analysis Date:** 2026-10-21

## Code Style & Formatting

- **Module Format:** Modern JavaScript ES Modules (`import`/`export`) across all files (`.js`, `.jsx`, `.mjs`).
- **Path Aliasing:** Use `@/` alias configured in `jsconfig.json` to reference project root modules (e.g., `import { supabase } from "@/lib/supabaseClient"`).
- **Component Definitions:** Functional React components with standard prop destructuring and default values.
- **Client Directives:** Explicit `"use client"` directive placed strictly at line 1 of files utilizing browser state, hooks (`useState`, `useEffect`), or DOM interactions.

## Naming Standards

- **React Components:** PascalCase (e.g., `ProfileQuickActions`, `CustomerGalleryManager`).
- **Functions & Methods:** camelCase (e.g., `getCustomerBySlug`, `formatPrice`, `canUseReviewAssistant`).
- **Constants & Configuration:** UPPER_SNAKE_CASE (e.g., `NFCISTA_BASE_URL`, `STOCK_STATUS_CONFIG`).
- **Database Columns & Tables:** snake_case (e.g., `dynamic_qr_cards`, `review_assistant_enabled`, `created_at`).

## Error Handling & Defensive Patterns

- **Standard API Responses:** JSON endpoints always return structured payload objects:
  - Success: `NextResponse.json({ success: true, ...data })`
  - Client / Validation Errors: `NextResponse.json({ error: "Descriptive message" }, { status: 400 })`
  - Authentication Errors: `NextResponse.json({ error: "Unauthorized: Missing session." }, { status: 401 })`
  - Internal Errors: `NextResponse.json({ error: "Internal server error" }, { status: 500 })`
- **Graceful Fallbacks:**
  - `lib/customers.js` falls back to predefined demo customer profiles (`demo-customer`, `demo-customer-photo`) when testing without active Supabase records.
  - `lib/products.js` falls back to `data/products.js` if Supabase connection fails or is unconfigured.
  - Rate limiting logic fails open on unexpected Redis/in-memory errors to avoid blocking legitimate users.

## Security Conventions

- **Session Security:** Auth tokens are passed via `HttpOnly`, `SameSite=Lax`, `Secure` cookies (`sb-admin-token`, `sb-customer-token`) to prevent XSS exfiltration.
- **Database Safety:** Direct public SQL queries are forbidden; read and write operations use RPC procedures or RLS policies.
- **CSP & Headers:** Hardened Content Security Policy defined in `next.config.mjs` restricting object, frame, and font sources.

---
*Codebase analysis: 2026-10-21*
<!-- refreshed: 2026-10-21 -->
