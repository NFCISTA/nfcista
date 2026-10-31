-- ==============================================================================
-- Migration: Fix Company Inquiries Permissions & Add submit_company_inquiry RPC
-- ==============================================================================
-- Purpose:
-- 1. Ensure public.company_inquiries table exists with required schema & constraints.
-- 2. Grant explicit table-level INSERT permissions to anon & authenticated roles.
-- 3. Configure Row Level Security (RLS) properly:
--    - Public anon and authenticated visitors may INSERT valid quote requests.
--    - Verified admins (via public.is_admin()) have full management access.
--    - Anonymous visitors CANNOT SELECT, scrape, UPDATE, or DELETE any records.
-- 4. Create an atomic SECURITY DEFINER RPC function: submit_company_inquiry(...)
--    which safely inserts and returns the confirmation status and inquiry ID
--    without triggering PostgREST RETURNING/SELECT RLS permission errors.
-- ==============================================================================

BEGIN;

-- 1. Ensure table exists with complete schema
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

-- Index for chronological admin portal queries
CREATE INDEX IF NOT EXISTS idx_company_inquiries_created
ON public.company_inquiries (created_at DESC);

-- 2. Grant table-level permissions to Supabase roles
GRANT ALL ON TABLE public.company_inquiries TO service_role;
GRANT INSERT ON TABLE public.company_inquiries TO anon, authenticated;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.company_inquiries ENABLE ROW LEVEL SECURITY;

-- Insert policy for public visitors
DROP POLICY IF EXISTS "Allow anonymous insert of company inquiries" ON public.company_inquiries;
CREATE POLICY "Allow anonymous insert of company inquiries"
ON public.company_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admin management policy
DROP POLICY IF EXISTS "Allow admins full access to company inquiries" ON public.company_inquiries;
CREATE POLICY "Allow admins full access to company inquiries"
ON public.company_inquiries
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Create SECURITY DEFINER RPC function for atomic quote submission
DROP FUNCTION IF EXISTS public.submit_company_inquiry(text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.submit_company_inquiry(
    name_input TEXT,
    phone_input TEXT,
    shop_name_input TEXT DEFAULT NULL,
    product_input TEXT DEFAULT NULL,
    message_input TEXT DEFAULT NULL,
    ip_hash_input TEXT DEFAULT NULL
)
RETURNS TABLE (
    status TEXT,
    inquiry_id UUID
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_id UUID;
BEGIN
    INSERT INTO public.company_inquiries (
        name,
        shop_name,
        phone,
        product_interest,
        message,
        source,
        status,
        ip_hash
    )
    VALUES (
        name_input,
        NULLIF(TRIM(shop_name_input), ''),
        phone_input,
        NULLIF(TRIM(product_input), ''),
        NULLIF(TRIM(message_input), ''),
        'homepage_quote',
        'new',
        ip_hash_input
    )
    RETURNING id INTO v_new_id;

    RETURN QUERY SELECT 'OK'::TEXT AS status, v_new_id AS inquiry_id;
END;
$$;

-- Grant EXECUTE permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.submit_company_inquiry(text, text, text, text, text, text) TO anon, authenticated;

COMMIT;
