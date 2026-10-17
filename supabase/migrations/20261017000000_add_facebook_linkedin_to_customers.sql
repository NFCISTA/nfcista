BEGIN;

-- ==============================================================================
-- Migration: Add Facebook and LinkedIn Social Links to NFCISTA Customers
-- ==============================================================================
-- 1. Adds optional facebook_url and linkedin_url columns to public.customers.
-- 2. Preserves all existing customer rows (default NULL).
-- 3. Safely drops and recreates get_customer_by_slug RPC inside a transaction
--    to avoid PostgreSQL error 42P13 (cannot change return type of existing function).
-- 4. Preserves all existing 15 return columns, exact order, and types.
-- 5. Preserves SECURITY DEFINER, search_path isolation, and execute permissions.
-- 6. No CASCADE used; customer data and existing RLS policies remain untouched.
-- ==============================================================================

-- 1. Add optional facebook_url and linkedin_url columns to public.customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT NULL;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS linkedin_url TEXT DEFAULT NULL;

-- 2. Drop existing function so the return signature can be cleanly updated
DROP FUNCTION IF EXISTS public.get_customer_by_slug(text);

-- 3. Recreate public.get_customer_by_slug with all 15 existing fields + 2 new fields
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
    linkedin_url      TEXT
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
        c.linkedin_url
    FROM public.customers c
    WHERE c.profile_slug = slug_input
      AND c.is_active = true
    LIMIT 1;
$$;

-- 4. Grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;

COMMIT;
