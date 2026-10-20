BEGIN;

-- ==============================================================================
-- Migration: Add Google Review AI Assistant Setting to NFCISTA
-- ==============================================================================
-- 1. Adds review_assistant_enabled column to public.customers (default FALSE).
-- 2. Ensures existing and new customers default to FALSE (opt-in only).
-- 3. Updates public.get_customer_by_slug(text) RPC safely inside transaction:
--    - Preserves all 21 existing columns in exact order and types.
--    - Appends 22nd column: review_assistant_enabled BOOLEAN.
--    - Retains STABLE, SECURITY DEFINER, SET search_path = public.
-- ==============================================================================

-- 1. Add review_assistant_enabled column to public.customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS review_assistant_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Safely drop and recreate get_customer_by_slug RPC inside transaction
DROP FUNCTION IF EXISTS public.get_customer_by_slug(text);

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
    review_assistant_enabled  BOOLEAN
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
        c.enquiry_enabled,
        c.review_assistant_enabled
    FROM public.customers c
    WHERE LOWER(c.profile_slug) = LOWER(TRIM(slug_input))
      AND c.is_active = TRUE
    LIMIT 1;
$$;

-- Grant EXECUTE to public visitors and authenticated users
GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;

COMMIT;
