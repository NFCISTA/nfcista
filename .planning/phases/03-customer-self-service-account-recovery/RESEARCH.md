# Phase 3 Research: Customer Self-Service & Account Recovery

**Phase**: 03 — Customer Self-Service & Account Recovery  
**Research date**: 2026-10-26  
**Scope**: Customer Account & Login Management Enhancement  

---

## 1. Existing Create-Customer Flow (Admin Side)

### Admin Customer Table — `lib/customers.js`
- `getAdminCustomers()`: Fetches `id, full_name, company_name, job_title, profile_slug, is_active, photo_url, banner_url, created_at, auth_user_id, email`
- `getAdminCustomerDetails(id)`: Full row including private contact fields
- `createCustomer(formData)`: Inserts to `public.customers`. Sets `is_active: true` by default. Does **NOT** create a Supabase Auth account.
- `updateCustomer(id, formData)`: Updates profile fields. Does **NOT** touch `auth_user_id`.

### Admin Customer UI — `app/admin/page.js`
- Customer list table shows a **"Portal Login"** column. For each customer:
  - If `auth_user_id` IS set → green pill "✓ Login Created" (clicking opens a view-only modal)
  - If `auth_user_id` IS NOT set → blue "Create Login" button (clicking opens the create-login modal)
- The **Login Modal** (`loginModalCustomer`) handles two states:
  - **No existing login**: Shows a form with email + temporary password fields → calls `POST /api/admin/customers/create-login`
  - **Already linked**: Shows a green "Portal Login Active" card with `/login` URL and a "Done" button

### No resend/reset/disable actions exist in the current admin UI.

---

## 2. Existing Auth Account Creation — `app/api/admin/customers/create-login/route.js`

Full audit of the existing API:

| Step | What happens |
|------|-------------|
| Auth check | `authenticateAdmin(request)` — cookie + Supabase token + `is_admin()` RPC |
| Idempotency | If `customer.auth_user_id` already exists → returns `already_linked`, no duplicate created |
| User creation | `serviceClient.auth.admin.createUser({ email, email_confirm: true, user_metadata: { customer_id, full_name, role: "customer" } })` |
| Linking | `UPDATE public.customers SET auth_user_id = authUserId WHERE id = customer.id` |
| Cleanup on failure | If link fails → `auth.admin.deleteUser(authUserId)` to avoid orphan |
| Password handling | If password provided → sets it; if not → generates a `recovery` type action link via `auth.admin.generateLink` |
| Response | Returns `{ success, status, auth_user_id, email, action_link, has_temporary_password, message }` |

**Critical gaps in the current implementation:**
- No way to **resend** a setup/invitation link for an already-linked customer
- No way to **send a password reset** email from admin
- No way to **disable/enable** a customer's login (Supabase `ban_duration` or `user_metadata.disabled`)
- The action link generated on account creation is only shown once in the UI — not resendable

---

## 3. Existing Customer Login Flow

### `app/login/page.js`
- `supabase.auth.signInWithPassword({ email, password })`
- On success: `await fetch("/api/session", { method: "POST", body: { access_token, expires_in } })` — sets `sb-customer-token` HttpOnly cookie
- Then: `router.replace("/dashboard")`
- **No "Forgot Password" link on the login page**

### `proxy.js` (middleware)
- `/dashboard/*` protected: checks `sb-customer-token` cookie, validates with `supabase.auth.getUser(token)`
- No routes for `/forgot-password`, `/reset-password`, `/auth/callback`

### `lib/customerAuth.js`
- Authenticates via `sb-customer-token` cookie OR `Authorization: Bearer` header
- Verifies with `supabase.auth.getUser(token)`
- Queries `customers WHERE auth_user_id = user.id`

### `app/dashboard/layout.js`
- Client-side session check via `supabase.auth.getSession()`
- Profile fetched once from `/api/customer/profile`, stored in `CustomerContext`
- `onAuthStateChange` watcher handles sign-out → redirect to `/login`

---

## 4. Existing Password Reset Functionality

**None exists for customers.** Summary:
- No `app/forgot-password/` page
- No `app/reset-password/` page  
- No `POST /api/customer/password` API route
- No Supabase `resetPasswordForEmail()` call anywhere in the codebase
- No `app/auth/callback/` route (needed for OAuth/magic link/recovery link handling)
- The login page (`/login`) has no "Forgot password?" link

**What Supabase provides:**
- `supabase.auth.resetPasswordForEmail(email, { redirectTo })` — sends an email with a recovery link
- The recovery link redirects to `redirectTo?token_hash=...&type=recovery`
- The app must have a page at `redirectTo` that calls `supabase.auth.exchangeCodeForSession(token_hash)` then `supabase.auth.updateUser({ password: newPassword })`

---

## 5. Required Database / Auth Schema Changes

### Supabase Auth (no schema changes needed)
- Password reset: handled via `supabase.auth.resetPasswordForEmail()` (client) and `auth.admin.generateLink({ type: "recovery" })` (server admin)
- Disable login: `serviceClient.auth.admin.updateUserById(auth_user_id, { ban_duration: "876600h" })` — permanently bans; `ban_duration: "none"` re-enables
- No custom database columns needed for disable/enable — Supabase `auth.users.banned_until` tracks this

### `public.customers` table (no schema changes needed)
- All required fields (`auth_user_id`, `is_active`, `email`, `profile_slug`) already exist
- `auth_user_id` links to `auth.users.id`

### Supabase Auth Email Templates (configuration only)
- Recovery email template may need updating with NFCISTA branding
- `redirectTo` URL must be whitelisted in Supabase Dashboard > Authentication > URL Configuration

---

## 6. Required Admin UI Changes — `app/admin/page.js`

The Login Modal currently shows only two states. Needs **three new actions**:

| New Action | Trigger | API Call |
|-----------|---------|----------|
| **Resend Setup Link** | Customer has `auth_user_id` but hasn't logged in yet (or admin requests resend) | `POST /api/admin/customers/resend-setup` |
| **Send Password Reset** | Customer has `auth_user_id` and is active | `POST /api/admin/customers/send-password-reset` |
| **Disable Login** | Customer has `auth_user_id` and is enabled | `POST /api/admin/customers/toggle-login` `{ action: "disable" }` |
| **Enable Login** | Customer has `auth_user_id` and is disabled | `POST /api/admin/customers/toggle-login` `{ action: "enable" }` |

**Login Status Display improvements:**
- Currently: only shows "✓ Login Created" or "Create Login"
- Needed: "✓ Active Login", "⚠ Login Disabled", "📧 Setup Pending" based on actual Auth state
- Need to fetch auth user status (banned_until, last_sign_in_at, email_confirmed_at) when admin opens login modal

---

## 7. Required Customer UI Changes

### New pages required:
1. `app/forgot-password/page.js` — Email entry form → calls `supabase.auth.resetPasswordForEmail()`
2. `app/reset-password/page.js` — New password entry form → handles the `?token_hash=` from recovery email → calls `supabase.auth.exchangeCodeForSession()` + `supabase.auth.updateUser({ password })`

### Existing pages to modify:
3. `app/login/page.js` — Add "Forgot your password?" link pointing to `/forgot-password`
4. `app/dashboard/profile/page.js` — Add "Change Password" section → calls `supabase.auth.updateUser({ password })` for logged-in customers

### `proxy.js` — New routes to allow unauthenticated access:
- `/forgot-password` — must be accessible without session (add rate limiting)
- `/reset-password` — must be accessible without session (no rate limiting needed, token-protected)

### Supabase Auth configuration:
- Whitelist `https://nfcista.vercel.app/reset-password` as a redirect URL

---

## 8. New API Routes Required

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `app/api/admin/customers/resend-setup/route.js` | POST | Admin | Generates a new recovery action link for an already-linked customer and returns it to admin |
| `app/api/admin/customers/send-password-reset/route.js` | POST | Admin | Triggers `auth.admin.generateLink({ type: "recovery" })` for the customer's email |
| `app/api/admin/customers/toggle-login/route.js` | POST | Admin | Enables or disables customer's Supabase Auth account via `auth.admin.updateUserById` |
| `app/api/admin/customers/login-status/route.js` | GET | Admin | Fetches auth user details (last_sign_in_at, email_confirmed_at, banned_until) for admin modal |

No new customer-facing API routes needed — password reset is handled via Supabase Auth client SDK.

---

## 9. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| Admin must never see customer passwords | All passwords handled by Supabase Auth only. Action links shown once, not stored |
| Recovery link replay attack | Supabase action links are single-use, expire after configured TTL |
| `/reset-password` page token validation | Must call `supabase.auth.exchangeCodeForSession(token_hash)` before accepting the new password — client validates with Supabase, not with our code |
| Logged-in customer changing password | Must call `supabase.auth.updateUser({ password })` — requires active valid session (Supabase validates) |
| Password change requires re-authentication | Supabase handles this — `updateUser` only works with a valid session |
| Login disable | Uses Supabase `ban_duration` — does not delete auth account or profile data |
| New pages must NOT expose auth state | `/forgot-password` and `/reset-password` must not show whether an email is registered (anti-enumeration) |
| Rate limiting on forgot-password | Must add IP rate limiting in `proxy.js` for `/forgot-password` |
| Token in URL | Supabase uses `token_hash` (not raw JWT) in recovery URLs — safe for URL usage |

---

## 10. Safe Implementation Order

### Wave 1 — Admin "Already Linked" Login Modal Enhancement
- Add `GET /api/admin/customers/login-status` API
- Enhance the Login Modal to fetch and display real auth status (last sign-in, email confirmed, banned)
- Add "Resend Setup Link" action (returns link for admin to share manually)
- Add "Send Password Reset" action (sends reset email via admin API)
- Add "Disable Login" / "Enable Login" toggle

### Wave 2 — Customer Forgot Password & Reset Password Pages
- Add `app/forgot-password/page.js` (email entry → `supabase.auth.resetPasswordForEmail`)  
- Add `app/reset-password/page.js` (token exchange + new password entry)
- Update `app/login/page.js` to add "Forgot password?" link
- Update `proxy.js` matcher to allow `/forgot-password` and `/reset-password` (with rate limiting)
- Whitelist redirect URL in Supabase dashboard

### Wave 3 — Customer Change Password (authenticated)
- Add "Change Password" section to `app/dashboard/profile/page.js`
- Call `supabase.auth.updateUser({ password: newPassword })` client-side
- Show success/error feedback

### Do NOT change
- `lib/customerAuth.js`
- `app/api/customer/profile/route.js` (GET handler)
- `app/p/[slug]/page.js`
- `app/review/[slug]/page.js`  
- `app/r/[cardCode]/page.js`
- `lib/dynamicQr.js`
- Database schema

---

## Existing Tests to Preserve / Extend

| Script | What it covers | Regression risk |
|--------|---------------|----------------|
| `scripts/test-portfolio-isolation.mjs` | Gallery ops don't touch `is_active`/`profile_slug` | None — no portfolio changes |
| `scripts/test-session-separation.mjs` | Admin/customer cookie isolation | New admin routes must use admin-only cookie |
| `scripts/test-admin-restriction.mjs` | Admin email restriction | No changes to admin auth |
