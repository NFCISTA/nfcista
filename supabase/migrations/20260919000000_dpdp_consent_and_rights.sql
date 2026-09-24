-- ==============================================================================
-- Migration: DPDP Act Consent Logging and Data Rights Audit Framework (Reviewed)
-- NFCISTA Digital Business Cards
-- ==============================================================================
-- Purpose:
-- 1. Creates `public.customer_consents` table to log consent grants, purposes,
--    policy versions, and withdrawal timestamps.
-- 2. Enforces strict consistency check constraints:
--    - 'granted' requires withdrawn_at IS NULL
--    - 'withdrawn' requires withdrawn_at IS NOT NULL AND >= granted_at
--    - 'refused' requires withdrawn_at IS NULL
--    - customer_id uses ON DELETE SET NULL with archived_subject_token to preserve
--      consent history upon profile deletion (Option 3 baseline).
--    - profile_slug is omitted from customer_consents to eliminate foreign-key drift
--      (customer_id is the single canonical relational anchor).
-- 3. Creates `public.data_subject_requests` table to record and track Data
--    Principal requests (access, correction, erasure, withdrawal, grievances)
--    with identity verification audit trails and resolution status constraints.
-- 4. Enables strict Row Level Security (RLS) ensuring that only authorized
--    administrators (via public.is_admin()) have access.
-- ==============================================================================

-- 1. Table: customer_consents
-- Note: Designed under Option 3 (ON DELETE SET NULL with detached audit token)
-- as a proposed baseline pending formal business and legal approval.
CREATE TABLE IF NOT EXISTS public.customer_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    archived_subject_token TEXT,
    purpose TEXT NOT NULL CHECK (purpose IN ('public_profile_display', 'marketing_showcase', 'promotional_messages')),
    consent_status TEXT NOT NULL CHECK (consent_status IN ('granted', 'withdrawn', 'refused')),
    policy_version TEXT NOT NULL DEFAULT '2026-09-v1',
    source_form TEXT NOT NULL DEFAULT 'admin_concierge',
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    withdrawn_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Consistency constraint between status and timestamps
    CONSTRAINT chk_consent_status_timestamps CHECK (
        (consent_status = 'granted' AND withdrawn_at IS NULL)
        OR (consent_status = 'withdrawn' AND withdrawn_at IS NOT NULL AND withdrawn_at >= granted_at)
        OR (consent_status = 'refused' AND withdrawn_at IS NULL)
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customer_consents_customer_id ON public.customer_consents(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_consents_token ON public.customer_consents(archived_subject_token);
CREATE INDEX IF NOT EXISTS idx_customer_consents_status ON public.customer_consents(consent_status);
CREATE INDEX IF NOT EXISTS idx_customer_consents_purpose ON public.customer_consents(purpose);

-- Enable RLS
ALTER TABLE public.customer_consents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customer_consents FROM anon;
REVOKE ALL ON public.customer_consents FROM authenticated;

-- Strict Admin-only policy for consents
DROP POLICY IF EXISTS "Admins can manage customer consents" ON public.customer_consents;
CREATE POLICY "Admins can manage customer consents"
    ON public.customer_consents
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_consents TO authenticated;


-- 2. Table: data_subject_requests
CREATE TABLE IF NOT EXISTS public.data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    requester_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    profile_slug TEXT,
    request_type TEXT NOT NULL CHECK (request_type IN ('access', 'correction', 'erasure', 'withdrawal', 'other')),
    details TEXT NOT NULL,
    request_status TEXT NOT NULL DEFAULT 'received' CHECK (request_status IN ('received', 'identity_verified', 'in_progress', 'completed', 'rejected')),
    verification_notes TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Consistency constraint between request_status and resolution timestamp
    CONSTRAINT chk_dsr_resolution_timestamp CHECK (
        (request_status IN ('completed', 'rejected') AND resolved_at IS NOT NULL AND resolved_at >= received_at)
        OR (request_status IN ('received', 'identity_verified', 'in_progress') AND resolved_at IS NULL)
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dsr_email ON public.data_subject_requests(contact_email);
CREATE INDEX IF NOT EXISTS idx_dsr_request_status ON public.data_subject_requests(request_status);
CREATE INDEX IF NOT EXISTS idx_dsr_slug ON public.data_subject_requests(profile_slug);
CREATE INDEX IF NOT EXISTS idx_dsr_customer_id ON public.data_subject_requests(customer_id);

-- Enable RLS
ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.data_subject_requests FROM anon;
REVOKE ALL ON public.data_subject_requests FROM authenticated;

-- Strict Admin-only policy for data requests
DROP POLICY IF EXISTS "Admins can manage data subject requests" ON public.data_subject_requests;
CREATE POLICY "Admins can manage data subject requests"
    ON public.data_subject_requests
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_subject_requests TO authenticated;
