BEGIN;

-- ==============================================================================
-- Migration: Add Portfolio URL to NFCISTA Customers (Live Schema Aligned)
-- ==============================================================================
-- 1. Adds optional portfolio_url column to public.customers (default NULL).
-- 2. Safely drops and recreates get_customer_by_slug inside a transaction
--    to prevent PostgreSQL 42P13 error (cannot change return type of existing function).
-- 3. Preserves all 22 existing return columns in exact order and types, and appends
--    portfolio_url as the 23rd column.
-- 4. Preserves true live filter: WHERE LOWER(c.profile_slug) = LOWER(TRIM(slug_input)) AND c.is_active = TRUE.
-- 5. Preserves SECURITY DEFINER, search_path = pg_catalog, public, pg_temp, argument name slug_input text.
-- 6. Preserves function owner (postgres), revokes PUBLIC, and re-grants EXECUTE to anon and authenticated.
-- ==============================================================================

-- 1. Add optional portfolio_url column
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS portfolio_url TEXT DEFAULT NULL;

-- 2. Drop existing function so return signature can be updated safely
DROP FUNCTION IF EXISTS public.get_customer_by_slug(text);

-- 3. Recreate public.get_customer_by_slug with all 22 existing fields + portfolio_url
CREATE FUNCTION public.get_customer_by_slug(slug_input text)
RETURNS TABLE (
    full_name                 TEXT,
    job_title                 TEXT,
    company_name              TEXT,
    category                  TEXT,
    description               TEXT,
    instagram                 TEXT,
    website                   TEXT,
    google_review_url         TEXT,
    profile_slug              TEXT,
    is_active                 BOOLEAN,
    phone                     TEXT,
    whatsapp                  TEXT,
    email                     TEXT,
    address                   TEXT,
    photo_url                 TEXT,
    facebook_url              TEXT,
    linkedin_url              TEXT,
    banner_url                TEXT,
    twitter_url               TEXT,
    drive_url                 TEXT,
    enquiry_enabled           BOOLEAN,
    review_assistant_enabled  BOOLEAN,
    portfolio_url             TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
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
        c.enquiry_enabled,
        c.review_assistant_enabled,
        c.portfolio_url
    FROM public.customers c
    WHERE LOWER(c.profile_slug) = LOWER(TRIM(slug_input))
      AND c.is_active = TRUE
    LIMIT 1;
$$;

-- 4. Preserve function owner
ALTER FUNCTION public.get_customer_by_slug(text) OWNER TO postgres;

-- 5. Revoke default execution privileges from PUBLIC
REVOKE ALL ON FUNCTION public.get_customer_by_slug(text) FROM PUBLIC;

-- 6. Re-grant execute permissions to public visitors and authenticated users
GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;

COMMIT;
