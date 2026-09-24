# NFCISTA DPDP Engineering Audit & Implementation Review

## Date
September 19, 2026

## Scope
Engineering privacy and security review of the NFCISTA Digital Business Card codebase against the technical architecture and principles of **India's Digital Personal Data Protection Act, 2023 (DPDP Act)** and relevant Indian cybersecurity regulations (e.g. CERT-In directions under the Information Technology Act, 2000).

> **CRITICAL LEGAL DISCLAIMER:**
> This document represents an **engineering and technical compliance review**, NOT formal legal advice. Neither this review nor the accompanying code modifications claim that NFCISTA is "DPDP compliant." Official compliance requires formal review, customization, and sign-off by a qualified Indian data privacy lawyer. No statutory requirements, timelines, or legal conclusions are asserted as definitive.

---

## 1. Confirmed Review Findings (A through L)

### Finding A: Verification of Consent Collection in Existing Admin Onboarding
- **Finding:** Customer consent is **NOT currently recorded** in the database or captured through the admin onboarding flow.
- **Evidence:** In `app/admin/page.js` and `lib/customers.js`, the `createCustomer()` and `updateCustomer()` functions write exclusively to `public.customers`. The migration `20260919000000_dpdp_consent_and_rights.sql` defines the `customer_consents` schema, but no application code currently inserts or updates records in this table.
- **Root Cause:** NFCISTA operates under an administrative concierge model where customers order physical NFC cards via WhatsApp or email, and an administrator manually enters their profile details. There is no automated or electronic consent capture mechanism in the admin panel.

### Finding B: Data Principal Identification & Processing Purposes Analysis
Blindly adding consent checkboxes to every form is legally and architecturally incorrect. The review establishes:
1. **Who is the Data Principal?**
   - **Scenario 1 (Individual Professionals / Sole Proprietors):** The customer purchasing the card is the Data Principal whose personal data is printed on the physical card and hosted online.
   - **Scenario 2 (Corporate / Employer Clients):** An organization orders cards for its employees/executives. The individual employee whose name, photograph, mobile number, and title are published is the Data Principal. The employer acts as an intermediary.
2. **Service Necessity vs. Optional Purposes:**
   - **Service Necessity (Fulfilling the Card Service):**
     - Manufacturing the physical NFC card and programming the NFC chip with `https://nfcista.vercel.app/p/[slug]`.
     - Storing shipping/billing information for order delivery.
     - *Note [Requires Qualified Indian Privacy Lawyer Review]:* Under the DPDP Act 2023, processing is governed by Section 4 (Consent) and Section 7 (Certain Legitimate Uses). While commercial contract performance is recognized in many data protection laws (like GDPR Article 6(1)(b)), the DPDP Act specifies distinct statutory legitimate uses. Legal counsel must advise whether publishing an open public digital profile requires explicit consent under Section 6 or fits within a recognized legitimate use under Section 7.
   - **Public Profile Publication (Core Service):**
     - Publishing an individual's personal telephone number, personal WhatsApp, email, physical address, and photograph on an unauthenticated web URL (`/p/[slug]`) where it is accessible to anyone worldwide and downloadable as a vCard (`.vcf`).
     - *Engineering Recommendation:* Because this exposes direct contact channels to the open Internet, **explicit, informed opt-in consent** is the safest engineering baseline.
   - **Optional Purposes (Strictly Require Separate Opt-In):**
     - **Marketing Showcase:** Displaying a customer's business card on NFCISTA's homepage as a "Featured Customer" or in social media promotional material. (Must be optional, unbundled, and unticked by default).
     - **Promotional Communications:** Sending news about future NFC accessories or promotional discounts. (Must be optional and unbundled).

### Finding C & D: `customer_consents` Schema Consistency & Timestamp Constraints
- **Previous Gap:** The initial draft of `customer_consents` lacked database-level check constraints to prevent contradictory states (e.g., `consent_status = 'granted'` while `withdrawn_at IS NOT NULL`, or `consent_status = 'withdrawn'` while `withdrawn_at IS NULL`).
- **Resolution:** Added a strict PostgreSQL CHECK constraint in `supabase/migrations/20260919000000_dpdp_consent_and_rights.sql`:
  ```sql
  CONSTRAINT chk_consent_status_timestamps CHECK (
      (consent_status = 'granted' AND withdrawn_at IS NULL)
      OR (consent_status = 'withdrawn' AND withdrawn_at IS NOT NULL AND withdrawn_at >= granted_at)
      OR (consent_status = 'refused' AND withdrawn_at IS NULL)
  )
  ```
  Similarly, added a resolution constraint on `data_subject_requests`:
  ```sql
  CONSTRAINT chk_dsr_resolution_timestamp CHECK (
      (status IN ('completed', 'rejected') AND resolved_at IS NOT NULL AND resolved_at >= received_at)
      OR (status IN ('received', 'identity_verified', 'in_progress') AND resolved_at IS NULL)
  )
  ```

### Finding E: `customer_id` NOT NULL vs. Nullable in `customer_consents`
- **Analysis:**
  - If `customer_id` is nullable, orphaned consent records can exist with no corresponding profile record.
  - In NFCISTA's architecture, consent to publish a profile is intrinsically tied to a customer record in `public.customers`.
  - If prospective consent (e.g. pre-onboarding consent) is ever needed before an account is provisioned, it would be tracked against an order inquiry or pre-sales contract ticket, not a profile consent table.
- **Resolution:** Enforced `customer_id UUID NOT NULL REFERENCES public.customers(id)` in `customer_consents`. *(See Section 8 for review on `ON DELETE CASCADE` vs `RESTRICT`)*.

### Finding F: Preventing Drift Between `profile_slug` and `customer_id`
- **Analysis:** In the original draft, `customer_consents` had both `customer_id` and `profile_slug`. Because `profile_slug` is mutable in `customers`, this created a data-integrity flaw where `customer_id` could refer to Customer A while `profile_slug` referred to Customer B.
- **Resolution:** **Removed `profile_slug` from `customer_consents`**. `customer_id` serves as the single canonical foreign key. The profile slug can be retrieved via a standard JOIN with `public.customers` whenever needed.

### Finding G: Data Minimisation in `/privacy/data-request/page.js`
- **Analysis:** The initial draft requested Full Name, Contact Email, Contact Phone, and Profile Slug all at once.
- **Resolution:** Updated `app/privacy/data-request/page.js` to enforce data minimisation:
  - **Required:** Full Name, Registered Contact Email, Request Type, Specific Details, and Verification Acknowledgment.
  - **Optional:** Phone Number and Profile Slug are explicitly marked as optional helper fields.

### Finding H: Preserving Manual Identity Verification (No Anonymous Automated Deletion)
- **Confirmed Safeguard:** The application **strictly preserves manual identity verification**.
- **Reasoning:** Allowing any visitor to trigger automated deletion of an NFC profile via an unauthenticated form would create a critical denial-of-service/tampering vulnerability (IDOR). Malicious actors could erase competitor cards or harass cardholders. All rights requests must be verified by an administrator matching records on file.

### Finding I: Privacy & Security of `mailto:` URLs Containing Personal Data
- **Security Assessment of `mailto:` Query Parameters:**
  - Embedding a user's full name, email, phone, and detailed grievance narrative into a `mailto:?subject=...&body=...` URL presents privacy risks:
    1. The entire narrative is exposed in browser URL history.
    2. OS-level URL handlers and process execution command lines can capture the URL in system logs.
    3. Intermediate browser extensions or proxy monitors can log the query string.
- **Safer Architectures Evaluated:**
  - **Implemented Safe Client Architecture (Option 1):**
    - The client form validates input and provides a single-click **"Copy Request to Clipboard"** button.
    - The "Open Email Client" button uses a **minimal URL** (`mailto:hellonfcista@gmail.com?subject=[DPDP%20Data%20Request]%20...`) containing **zero personal data or narrative** in the query string.
    - The user pastes the pre-formatted request directly into the body of their email, ensuring zero URI leakage and establishing that the request originates from their real email account.
  - **Alternative Backend Architecture (Option 2 - Documented for Future Use):**
    - Create a public `INSERT`-only RLS policy on `public.data_subject_requests` allowing the anon Supabase client to insert incoming requests with status `'received'`.
    - Deny `SELECT`, `UPDATE`, and `DELETE` to anonymous users so that requesters cannot read any other requests.
    - Requires CAPTCHA/rate-limiting at the edge to prevent spam ticket flooding.
  - **Alternative Serverless Architecture (Option 3 - Documented for Future Use):**
    - A Next.js server route (`/api/privacy/data-request`) that accepts the form submission via POST, validates server-side, applies IP rate-limiting, and writes to an administrative queue.

### Finding J: Review of Proposed Retention Periods
- **Status:** The previously drafted timelines (12-month inactive retention, 30-day warning period, 7-business-day erasure target) are **PROPOSALS ONLY**.
- **Correction:** These periods have **NOT** been hardcoded or implemented as automated deletion jobs. They are explicitly designated in this audit as **unapproved business and legal proposals** requiring formal approval from NFCISTA business owners and legal counsel.

### Finding K: Review of Statements Sounding Like Legal Conclusions
- All legal interpretations in documentation, the Privacy Notice, and Terms of Service have been checked and marked with prominent advisories stating that formal legal review by an Indian privacy lawyer is required before production reliance.

### Finding L: Compliance Claims
- **Strict Rule Maintained:** No claim is made that NFCISTA is "DPDP compliant."

---

## 2. Architecture & Personal Data Inventory

| Data Field | Where Collected | Where Stored | Who Can Access It | Purpose | Public / Private | Retention Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Full Name** | Admin Form (`/admin`) | `public.customers.full_name` | Public via RPC; Admin | Cardholder identity | **Public** | Indefinite until admin deletes | Mandatory field |
| **Job Title** | Admin Form (`/admin`) | `public.customers.job_title` | Public via RPC; Admin | Professional role | **Public** | Indefinite until admin deletes | Optional |
| **Company Name** | Admin Form (`/admin`) | `public.customers.company_name` | Public via RPC; Admin | Business identity | **Public** | Indefinite until admin deletes | Optional |
| **Category** | Admin Form (`/admin`) | `public.customers.category` | Public via RPC; Admin | Industry classification | **Public** | Indefinite until admin deletes | Optional |
| **Description / Bio** | Admin Form (`/admin`) | `public.customers.description` | Public via RPC; Admin | Profile summary | **Public** | Indefinite until admin deletes | Optional |
| **Phone Number** | Admin Form (`/admin`) | `public.customers.phone` | Public via RPC; Admin | Direct call & vCard | **Public** | Indefinite until admin deletes | Optional |
| **WhatsApp Number** | Admin Form (`/admin`) | `public.customers.whatsapp` | Public via RPC; Admin | WhatsApp messaging | **Public** | Indefinite until admin deletes | Optional |
| **Email Address** | Admin Form (`/admin`) | `public.customers.email` | Public via RPC; Admin | Email contact & vCard | **Public** | Indefinite until admin deletes | Optional |
| **Physical Address** | Admin Form (`/admin`) | `public.customers.address` | Public via RPC; Admin | Maps location | **Public** | Indefinite until admin deletes | Optional |
| **Instagram Handle** | Admin Form (`/admin`) | `public.customers.instagram` | Public via RPC; Admin | Social profile link | **Public** | Indefinite until admin deletes | Optional |
| **Website URL** | Admin Form (`/admin`) | `public.customers.website` | Public via RPC; Admin | External link | **Public** | Indefinite until admin deletes | Optional |
| **Google Review URL** | Admin Form (`/admin`) | `public.customers.google_review_url` | Public via RPC; Admin | Business reviews | **Public** | Indefinite until admin deletes | Optional |
| **Profile Photo** | Admin Form (`/admin`) | Storage: `profile-photos` | Public URL via CDN; Admin | Visual avatar | **Public** | Replaced on edit; removed on delete | Max 5MB; JPG/PNG/WebP |
| **Profile Slug** | Admin Form (`/admin`) | `public.customers.profile_slug` | Public via URL; Admin | Unique routing path | **Public** | Immutable unless re-encoded | `^[a-z0-9-_]+$` |
| **Active Status Flag**| Admin Form (`/admin`) | `public.customers.is_active` | Public (200 vs 404); Admin | Profile accessibility | **Public state** | Immediate effect on RPC | Inactive = 0 rows |
| **Admin Email** | Admin Login (`/admin/login`) | `auth.users`, `admin_users` | Authenticated Admins | Dashboard auth & RBAC | **Private** | Managed by Supabase Auth | Hidden from public |
| **Admin Password Hash** | Admin Login | Supabase Auth internal | Supabase Auth engine | Password authentication | **Private** | Managed by Supabase Auth | Never visible in code |
| **Session JWT Token** | Client Browser | LocalStorage / Session | Logged-in admin browser | Admin session state | **Private** | Supabase JWT expiry | Hidden from public |
| **Server Logs** | Vercel & Supabase | Cloud infrastructure | DevOps / Cloud platform | Reliability, diagnostics | **Private infrastructure** | Vendor standard retention | IP address & user-agent |
| **Analytics Trackers**| N/A | None | N/A | N/A | N/A | **Zero collected** | 0 trackers installed |

---

## 3. Statutory Clarifications: CERT-In vs. DPDP Act vs. GDPR

| Regime | Governing Law | Authority | Mandatory Timeline | Applicability to NFCISTA |
| :--- | :--- | :--- | :--- | :--- |
| **DPDP Act, 2023**<br>*(Section 8(6))* | Digital Personal Data Protection Act, 2023 | Data Protection Board of India (DPBI) | *"In such form and manner as may be prescribed"* by Central Government rules. | Applies to personal data breaches of Indian Data Principals. **No fixed 72-hour statutory deadline exists in the Act.** Exact timelines await final notification of DPDP Rules. |
| **CERT-In Directions**<br>*(Section 70B)* | Information Technology Act, 2000 | Indian Computer Emergency Response Team | **Within 6 hours** of noticing qualifying cybersecurity incidents. | Applies to cybersecurity attacks (e.g. server compromise, unauthorized access to database infrastructure, ransomware). |
| **GDPR (EU)**<br>*(Article 33)* | General Data Protection Regulation | European Data Protection Authorities | **Within 72 hours** of becoming aware of a breach. | **Does not apply to domestic Indian processing.** Conflating DPDP Act reporting with the 72-hour GDPR window is an inaccurate legal assumption. |

---

## 4. Recommended Engineering Changes (Roadmap)

1. **Admin Onboarding Consent Capture (`app/admin/page.js`):**
   - Add an explicit audit section in the Add/Edit Customer modal:
     - Checkbox: *"Customer Consent Verified for Public Profile Display"*.
     - Dropdown: *Consent Source* (`WhatsApp Confirmation`, `Signed Order Form`, `Direct Email`, `Verbal Agreement`).
     - Notes field for recording verification details.
   - When saving a customer, invoke a helper in `lib/customers.js` to write an audit row into `public.customer_consents`.
2. **Automated Request Intake via Supabase RLS (Optional Future Phase):**
   - If an email-based workflow becomes cumbersome as volume scales, enable an anonymous `INSERT`-only policy on `public.data_subject_requests`.
3. **Public RPC Rate Limiting:**
   - Configure edge rate limiting in Next.js middleware or Vercel Web Application Firewall to mitigate automated scraping of profile slugs.

---

## 5. Items Requiring Qualified Indian Privacy Lawyer Review

The following items are flagged for legal review:
1. **Notice & Consent Requirements under DPDP Act Sections 5 & 6:**
   - Reviewing the exact wording of the draft Privacy Notice (`app/privacy/page.js`).
   - Advising whether publishing contact data on an open public profile requires Section 6 consent or falls under any Section 7 legitimate use.
2. **Terms of Service (`app/terms/page.js`):**
   - Enforceability of customer representations and warranties regarding accuracy of submitted data and authorization to use business trademarks/logos.
   - Limitation of liability provisions under the Indian Contract Act, 1872 and Consumer Protection Act, 2019.
3. **Identity Verification Standard for Rights Requests:**
   - Establishing the legally acceptable standard for verifying identity under forthcoming DPDP Rules without inadvertently collecting excessive new personal data (e.g. avoiding unnecessary Aadhaar collection).
4. **Data Retention & Inactive Profile Purging:**
   - Determining legal retention limits for inactive customer profiles vs. commercial tax invoice records under Indian commercial law.

---

## 6. Unresolved Business & Legal Decisions

1. **Retention Schedule Approval:** Business owners and legal counsel must formally approve the retention window for inactive profiles before any automated deletion job is implemented.
2. **Corporate Client Cards:** For B2B orders where an employer orders cards for its workforce, legal counsel must advise whether NFCISTA should provide a B2B Data Processing Addendum (DPA) requiring the employer to warrant employee consent.
3. **Official Grievance Officer Designation:** Formal appointment of a named individual or role as the Grievance Redressal Officer under the DPDP Act once administrative rules are notified.

---

## 7. Production Readiness Checklist

- [x] RLS verified blocking unauthorized direct queries on `customers` and `admin_users`.
- [x] Controlled public RPC returns only intended public fields for active profiles.
- [x] Privacy Notice created at `/privacy` with legal review banner.
- [x] Terms of Service created at `/terms` with data protection section.
- [x] Data Rights Request form created at `/privacy/data-request` with data minimisation and zero URL query leakage.
- [x] Grievance contact (`hellonfcista@gmail.com`) published in footer and notices.
- [x] DPDP consent and data rights migration schema updated with strict status/timestamp and relational constraints.
- [x] Breach response runbook created at `BREACH_RUNBOOK.md` distinguishing DPDP Section 8(6), CERT-In 6-hour, and GDPR 72-hour rules.
- [x] Build verified (`npm run build` exits code 0).
- [ ] Qualified Indian data privacy lawyer review of legal notices.
- [ ] Formal business and legal decision on inactive profile retention timeline.
- [ ] Formal business and privacy-lawyer approval of Option 3 consent deletion design (`ON DELETE SET NULL` + detached token) (Section 8).
- [ ] Execute migration `20260919000000_dpdp_consent_and_rights.sql` in Supabase SQL Editor (only after business/legal approval).

---

## 8. Final Migration-Readiness Review (Pre-Execution Audit)

### A. Deep-Dive: `customer_consents` Deletion Behavior & Architecture Selection
- **Proposed Engineering Baseline (Option 3):**
  The migration file `supabase/migrations/20260919000000_dpdp_consent_and_rights.sql` has been prepared with **Option 3**:
  ```sql
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  archived_subject_token TEXT,
  ```
- **Context & Design Trade-Offs (For Business & Legal Review):**
  - *Option 1 (`ON DELETE CASCADE`):* Wipes out all consent logs when a customer is deleted. Simple, but destroys historical evidence that past processing was authorized while the profile was active.
  - *Option 2 (`ON DELETE RESTRICT`):* Blocks hard deletion. Requires redesigning the application for soft-deletion/anonymization, which would be disruptive to existing admin CRUD flows.
  - *Option 3 (`ON DELETE SET NULL` + Detached Audit Token):* When a customer requests erasure and is deleted, their personal details (name, phone, photo, email, address) are permanently purged from `public.customers`. The foreign key `customer_id` is set to `NULL`, while the detached token, purpose, timestamps, and policy version remain preserved.
- **Important Notes & Legal Distinctions:**
  - *No statutory requirement invented:* It is **not** asserted that preserving historical consent records after erasure is a mandatory statutory requirement under the DPDP Act. Rather, it represents an engineering risk-mitigation baseline to prevent evidentiary blind spots.
  - *Business + Privacy Lawyer Decision:* The choice between completely destroying consent history (`CASCADE`) versus retaining a detached/anonymized ledger (`SET NULL` with detached token) is fundamentally a **business and legal policy decision**. Option 3 is prepared as the recommended engineering baseline for counsel to review.
  - *Zero personal data remains:* Once the customer row is deleted, `customer_consents` contains no name, phone, email, address, or photo. Only regulatory metadata remains.
  - *No automation:* No automated deletion or retention purge scripts have been implemented.
  - *No admin integration yet:* The admin interface (`/admin`) has not yet been connected to insert or modify records in `customer_consents`.

### B. Deep-Dive: `data_subject_requests` History Preservation & Frontend Verification
- **Request History Preservation:**
  - `customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL` ensures that deleting a customer does **NOT** delete their rights request history.
  - The request record remains intact with status `'completed'`, timestamp, request type (`erasure`), and verification notes.
- **Frontend Verification:**
  - Confirmed: `app/privacy/data-request/page.js` does **NOT** automatically write to the database. It renders a clean formatted text template for clipboard copy and a clean `mailto:` link. Unverified public visitors cannot flood the database with unverified requests or trigger deletions.

### C. Structural & Security Review of Migration Elements
- **Duplicate Blocks:** None.
- **Destructive Operations:** None (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DROP POLICY IF EXISTS`). No `DROP TABLE`, `DROP COLUMN`, or data truncation.
- **RLS & Access Control:** Strict. Both tables enable RLS, revoke direct access from `anon` and `authenticated`, and enforce `USING (public.is_admin()) WITH CHECK (public.is_admin())`.
- **Production Compatibility:** References existing `public.customers(id)` and `public.is_admin()`. Does not modify existing customer rows, does not expose data, and does not require service-role keys in browser code.

### D. Operation-by-Operation Classification

| SQL Operation Block | Target Object | Operation Type | Classification | Notes / Decision |
| :--- | :--- | :--- | :--- | :--- |
| `CREATE TABLE customer_consents` (Option 3) | `public.customer_consents` | Table Creation | **READY FOR REVIEW** | Prepared with `ON DELETE SET NULL` and `archived_subject_token`. Awaiting business/legal approval. |
| `CREATE INDEX idx_customer_consents_*` | `customer_consents` | Indexing | **SAFE TO RUN** | Standard performance indexes on `customer_id`, `token`, `status`, `purpose`. |
| `ALTER TABLE customer_consents ENABLE RLS` | `customer_consents` | Security | **SAFE TO RUN** | Enforces row security before any records are inserted. |
| `REVOKE ALL ... FROM anon, authenticated` | `customer_consents` | Access Control | **SAFE TO RUN** | Blocks all direct table access by default. |
| `CREATE POLICY Admins can manage consents` | `customer_consents` | RLS Policy | **SAFE TO RUN** | Restricts CRUD strictly to `public.is_admin()`. |
| `GRANT ... TO authenticated` | `customer_consents` | Privileges | **SAFE TO RUN** | Authenticated users can only operate within the RLS policy. |
| `CREATE TABLE data_subject_requests` | `public.data_subject_requests`| Table Creation | **SAFE TO RUN** | Clean schema, `ON DELETE SET NULL`, resolution timestamp constraint. |
| `CREATE INDEX idx_dsr_*` | `data_subject_requests` | Indexing | **SAFE TO RUN** | Indexes on `email`, `status`, `slug`, `customer_id`. |
| `ALTER TABLE data_subject_requests ENABLE RLS` | `data_subject_requests` | Security | **SAFE TO RUN** | Enforces row security. |
| `REVOKE ALL ... FROM anon, authenticated` | `data_subject_requests` | Access Control | **SAFE TO RUN** | Blocks all direct table access by default. |
| `CREATE POLICY Admins can manage DSR` | `data_subject_requests` | RLS Policy | **SAFE TO RUN** | Restricts CRUD strictly to `public.is_admin()`. |
| `GRANT ... TO authenticated` | `data_subject_requests` | Privileges | **SAFE TO RUN** | Access controlled by RLS. |
