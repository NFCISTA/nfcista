BEGIN;

-- ==============================================================================
-- Migration: Add optional Profile Banner support to NFCISTA Customers
-- ==============================================================================
-- 1. Adds optional banner_url column to public.customers (defaults to NULL).
-- 2. Preserves all existing customer rows (banner_url IS NULL => default mountain banner).
-- 3. Safely drops and recreates get_customer_by_slug RPC inside a transaction
--    to prevent PostgreSQL error 42P13 (cannot change return type of existing function).
-- 4. Preserves all 17 existing return columns, exact order, types, and adds banner_url as 18th column.
-- 5. Preserves SECURITY DEFINER, search_path isolation, and execute permissions.
-- 6. No CASCADE used; customer data and existing RLS policies remain untouched.
-- ==============================================================================

-- 1. Add optional banner_url column to public.customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS banner_url TEXT DEFAULT NULL;

-- 2. Drop existing function so return signature can be updated safely
DROP FUNCTION IF EXISTS public.get_customer_by_slug(text);

-- 3. Recreate public.get_customer_by_slug with 17 existing fields + banner_url
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
    banner_url        TEXT
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
        c.banner_url
    FROM public.customers c
    WHERE c.profile_slug = slug_input
      AND c.is_active = true
    LIMIT 1;
$$;

-- 4. Re-grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;

COMMIT;
