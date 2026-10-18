BEGIN;

-- ==============================================================================
-- Migration: Add optional X / Twitter and Google Drive Links to NFCISTA Customers
-- ==============================================================================
-- 1. Adds optional twitter_url and drive_url columns to public.customers (default NULL).
-- 2. Preserves all existing customer rows (default NULL).
-- 3. Safely drops and recreates get_customer_by_slug RPC inside a transaction
--    to prevent PostgreSQL error 42P13 (cannot change return type of existing function).
-- 4. Preserves all 18 existing return columns, exact order, types, and adds
--    twitter_url (19th) and drive_url (20th).
-- 5. Preserves SECURITY DEFINER, search_path isolation, and execute permissions.
-- 6. No CASCADE used; customer data and existing RLS policies remain untouched.
-- ==============================================================================

-- 1. Add optional twitter_url and drive_url columns to public.customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS twitter_url TEXT DEFAULT NULL;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS drive_url TEXT DEFAULT NULL;

-- 2. Drop existing function so return signature can be updated safely
DROP FUNCTION IF EXISTS public.get_customer_by_slug(text);

-- 3. Recreate public.get_customer_by_slug with 18 existing fields + twitter_url + drive_url
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
    drive_url         TEXT
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
        c.drive_url
    FROM public.customers c
    WHERE c.profile_slug = slug_input
      AND c.is_active = true
    LIMIT 1;
$$;

-- 4. Re-grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;

COMMIT;
