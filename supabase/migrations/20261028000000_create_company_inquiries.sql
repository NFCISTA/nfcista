-- ==============================================================================
-- Migration: Create Company Inquiries Table (Homepage B2B Quote Requests)
-- ==============================================================================
-- Stores homepage sales inquiries and custom branding quote requests.
-- Strictly isolated from public.customer_enquiries (which is for customer leads).
--
-- Security Architecture:
-- - Row Level Security (RLS) is ENABLED.
-- - Public anon users may ONLY INSERT valid inquiries.
-- - Public anon and non-admin authenticated users CANNOT SELECT, UPDATE, or DELETE records.
-- - Inquiries can only be reviewed by administrators (via public.is_admin() or service-role).
-- ==============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.company_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    shop_name TEXT,
    phone TEXT NOT NULL,
    product_interest TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    source TEXT NOT NULL DEFAULT 'homepage_quote',
    ip_hash TEXT
);

-- Performance Index for chronological review
CREATE INDEX IF NOT EXISTS idx_company_inquiries_created
ON public.company_inquiries (created_at DESC);

-- Enable RLS
ALTER TABLE public.company_inquiries ENABLE ROW LEVEL SECURITY;

-- 1. Insert Policy: Allow public visitors to submit an inquiry
DROP POLICY IF EXISTS "Allow anonymous insert of company inquiries" ON public.company_inquiries;
CREATE POLICY "Allow anonymous insert of company inquiries"
ON public.company_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Admin Policy: Allow verified admins full management access
DROP POLICY IF EXISTS "Allow admins full access to company inquiries" ON public.company_inquiries;
CREATE POLICY "Allow admins full access to company inquiries"
ON public.company_inquiries
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

COMMIT;
