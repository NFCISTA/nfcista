-- ==============================================================================
-- Migration: Add contact fields to get_customer_by_slug RPC
-- ==============================================================================
-- REASON: The public customer profile page now displays contact action buttons
-- (Call, WhatsApp, Email, Address/Maps). The RPC must return these fields so
-- the profile page can build safe contact links.
--
-- SECURITY PRESERVED:
--   - RLS remains enabled on public.customers. Direct anon access still blocked.
--   - Contact fields are returned by a controlled SECURITY DEFINER function,
--     not by direct table access.
--   - Only ACTIVE customers (is_active = true) are returned.
--   - id, created_at, updated_at remain excluded.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_customer_by_slug(slug_input text)
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
    address           TEXT
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
        c.address
    FROM public.customers c
    WHERE c.profile_slug = slug_input
      AND c.is_active = true
    LIMIT 1;
$$;

-- Re-grant execution to anon and authenticated (unchanged from original)
GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;
