BEGIN;

-- ==============================================================================
-- Migration: Add Enquiry Form System to NFCISTA
-- ==============================================================================
-- 1. Adds enquiry settings columns to public.customers (default FALSE for opt-in).
-- 2. Creates public.customer_enquiries table for storing visitor leads.
-- 3. Configures performance indexes for customer queries.
-- 4. Establishes strict RLS policies:
--    - Customers can ONLY view and update (is_read) their own enquiries.
--    - Admin (hellonfcista@gmail.com) has full management access.
--    - Anonymous visitors cannot directly scan or modify enquiries.
-- 5. Updates public.get_customer_by_slug(text) RPC safely inside transaction:
--    - Preserves all 20 existing columns in exact order and types.
--    - Appends 21st column: enquiry_enabled BOOLEAN.
--    - Does NOT expose customer_id, auth_user_id, or delivery destination settings.
-- ==============================================================================

-- 1. Add enquiry settings columns to public.customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS enquiry_enabled BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS enquiry_delivery_dashboard BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS enquiry_delivery_email BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS enquiry_delivery_whatsapp BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Create customer_enquiries table
CREATE TABLE IF NOT EXISTS public.customer_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT NOT NULL,
    visitor_email TEXT DEFAULT NULL,
    message TEXT NOT NULL,

    -- Delivery settings snapshots at time of submission
    delivery_dashboard BOOLEAN NOT NULL DEFAULT TRUE,
    delivery_email BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    email_status TEXT NOT NULL DEFAULT 'not_configured' CHECK (email_status IN ('not_configured', 'pending', 'sent', 'failed')),
    whatsapp_status TEXT NOT NULL DEFAULT 'ready' CHECK (whatsapp_status IN ('ready', 'skipped', 'sent')),

    source_slug TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    user_agent TEXT DEFAULT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_enquiries_customer_created
ON public.customer_enquiries (customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_enquiries_customer_read
ON public.customer_enquiries (customer_id, is_read);

CREATE INDEX IF NOT EXISTS idx_enquiries_source_slug
ON public.customer_enquiries (source_slug);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;

-- Customer SELECT: Customers can view only enquiries sent to their profile
DROP POLICY IF EXISTS "Customers can view their own enquiries" ON public.customer_enquiries;
CREATE POLICY "Customers can view their own enquiries"
    ON public.customer_enquiries
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        )
    );

-- Customer UPDATE: Customers can update only their own enquiries (e.g. is_read)
DROP POLICY IF EXISTS "Customers can update their own enquiries" ON public.customer_enquiries;
CREATE POLICY "Customers can update their own enquiries"
    ON public.customer_enquiries
    FOR UPDATE
    TO authenticated
    USING (
        customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        )
    );

-- Admin ALL: Strictly restricted to hellonfcista@gmail.com via public.is_admin()
DROP POLICY IF EXISTS "Admin can manage all enquiries" ON public.customer_enquiries;
CREATE POLICY "Admin can manage all enquiries"
    ON public.customer_enquiries
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Safely drop and recreate get_customer_by_slug RPC inside transaction
DROP FUNCTION IF EXISTS public.get_customer_by_slug(text);

CREATE FUNCTION public.get_customer_by_slug(slug_input text)
RETURNS TABLE (
    full_name         TEXT,
    job_title         TEXT,
    company_name      TEXT,
    category          TEXT,
    description       TEXT,
    instagram         TEXT,
    website           TEXT,
    google_review_url TEXT,
    profile_slug      TEXT,
    is_active         BOOLEAN,
    phone             TEXT,
    whatsapp          TEXT,
    email             TEXT,
    address           TEXT,
    photo_url         TEXT,
    facebook_url      TEXT,
    linkedin_url      TEXT,
    banner_url        TEXT,
    twitter_url       TEXT,
    drive_url         TEXT,
    enquiry_enabled   BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        c.full_name,
        c.job_title,
        c.company_name,
        c.category,
        c.description,
        c.instagram,
        c.website,
        c.google_review_url,
        c.profile_slug,
        c.is_active,
        c.phone,
        c.whatsapp,
        c.email,
        c.address,
        c.photo_url,
        c.facebook_url,
        c.linkedin_url,
        c.banner_url,
        c.twitter_url,
        c.drive_url,
        c.enquiry_enabled
    FROM public.customers c
    WHERE LOWER(c.profile_slug) = LOWER(TRIM(slug_input))
      AND c.is_active = TRUE
    LIMIT 1;
$$;

-- Grant EXECUTE to public visitors and authenticated users
GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;

COMMIT;
