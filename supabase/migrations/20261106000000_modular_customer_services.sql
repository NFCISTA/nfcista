-- ==============================================================================
-- Migration: Modular Customer Services & Subscription Management
-- NFCISTA Multi-Service Architecture (Smart Profile, Review Assistant, Analytics)
-- ==============================================================================
-- 1. Adds smart_profile_enabled to public.customers (defaults to true for existing customers).
-- 2. Makes profile_slug nullable so subscription-only customers can exist without dummy slugs.
-- 3. Updates customers_profile_slug_format CHECK constraint to allow NULL profile_slug.
-- 4. Creates index on smart_profile_enabled for fast filtering.
-- 5. Updates get_customer_by_slug RPC to verify smart_profile_enabled = true.
-- 6. Updates submit_customer_enquiry RPC to verify smart_profile_enabled = true.
--
-- BACKWARDS COMPATIBILITY GUARANTEES:
-- - All existing customer records automatically receive smart_profile_enabled = true.
-- - Existing profile slugs, auth links, review cards, and analytics remain 100% intact.
-- - Customer IDs and foreign keys are never altered.
-- ==============================================================================

BEGIN;

-- 1. Add smart_profile_enabled column to public.customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS smart_profile_enabled BOOLEAN NOT NULL DEFAULT true;

-- 2. Make profile_slug nullable
ALTER TABLE public.customers
ALTER COLUMN profile_slug DROP NOT NULL;

-- 3. Update CHECK constraint on profile_slug to allow NULL while enforcing format when present
ALTER TABLE public.customers
DROP CONSTRAINT IF EXISTS customers_profile_slug_format;

ALTER TABLE public.customers
ADD CONSTRAINT customers_profile_slug_format
CHECK (profile_slug IS NULL OR profile_slug ~ '^[a-z0-9-_]+$');

-- 4. Index for fast segment filtering by smart_profile_enabled
CREATE INDEX IF NOT EXISTS idx_customers_smart_profile_enabled
ON public.customers (smart_profile_enabled);

-- 5. Update public.get_customer_by_slug RPC safely inside transaction
-- Ensures public profile at /p/[slug] resolves ONLY when smart_profile_enabled = TRUE
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
      AND c.smart_profile_enabled = TRUE
      AND c.profile_slug IS NOT NULL
    LIMIT 1;
$$;

-- Re-grant EXECUTE to public visitors and authenticated users
GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;

-- 6. Update public.submit_customer_enquiry RPC safely inside transaction
-- Ensures inquiries can only be submitted to customers whose Smart Profile is active
DROP FUNCTION IF EXISTS public.submit_customer_enquiry(
    text, text, text, text, text, text, text
);

CREATE FUNCTION public.submit_customer_enquiry(
    slug_input    text,
    visitor_name  text,
    visitor_phone text,
    visitor_email text,   -- nullable
    message       text,
    ip_hash_input text,
    user_agent_input text  -- nullable
)
RETURNS TABLE (
    status           text,
    enquiry_id       uuid,
    customer_name    text,
    wa_number        text,
    delivery_whatsapp boolean
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_customer RECORD;
    v_enquiry_id UUID;
    v_can_whatsapp BOOLEAN;
    v_whatsapp_status TEXT;
BEGIN
    -- 1. Find the customer by slug: must be active, have enquiry enabled, and have smart profile enabled.
    SELECT
        c.id,
        c.full_name,
        c.whatsapp,
        c.enquiry_delivery_dashboard,
        c.enquiry_delivery_email,
        c.enquiry_delivery_whatsapp
    INTO v_customer
    FROM public.customers c
    WHERE LOWER(TRIM(c.profile_slug)) = LOWER(TRIM(slug_input))
      AND c.is_active = TRUE
      AND c.enquiry_enabled = TRUE
      AND c.smart_profile_enabled = TRUE
      AND c.profile_slug IS NOT NULL
    LIMIT 1;

    -- 2. Return controlled DISABLED result if no eligible customer found.
    IF NOT FOUND THEN
        RETURN QUERY SELECT
            'DISABLED'::text AS status,
            NULL::uuid        AS enquiry_id,
            NULL::text        AS customer_name,
            NULL::text        AS wa_number,
            FALSE::boolean    AS delivery_whatsapp;
        RETURN;
    END IF;

    -- 3. Determine WhatsApp capability using only server-side data.
    v_can_whatsapp := v_customer.enquiry_delivery_whatsapp
        AND v_customer.whatsapp IS NOT NULL
        AND TRIM(v_customer.whatsapp) <> '';

    v_whatsapp_status := CASE WHEN v_can_whatsapp THEN 'ready' ELSE 'skipped' END;

    -- 4. Insert the enquiry record with snapshotted delivery settings.
    INSERT INTO public.customer_enquiries (
        customer_id,
        visitor_name,
        visitor_phone,
        visitor_email,
        message,
        delivery_dashboard,
        delivery_email,
        delivery_whatsapp,
        is_read,
        email_status,
        whatsapp_status,
        source_slug,
        ip_hash,
        user_agent
    )
    VALUES (
        v_customer.id,
        visitor_name,
        visitor_phone,
        NULLIF(TRIM(COALESCE(visitor_email, '')), ''),
        message,
        v_customer.enquiry_delivery_dashboard,
        v_customer.enquiry_delivery_email,
        v_customer.enquiry_delivery_whatsapp,
        FALSE,
        'not_configured',
        v_whatsapp_status,
        LOWER(TRIM(slug_input)),
        ip_hash_input,
        user_agent_input
    )
    RETURNING id INTO v_enquiry_id;

    -- 5. Return only the minimum fields the API layer needs.
    RETURN QUERY SELECT
        'OK'::text                              AS status,
        v_enquiry_id                            AS enquiry_id,
        v_customer.full_name                    AS customer_name,
        CASE WHEN v_can_whatsapp
            THEN v_customer.whatsapp
            ELSE NULL
        END                                     AS wa_number,
        v_customer.enquiry_delivery_whatsapp    AS delivery_whatsapp;
END;
$$;

-- Re-grant EXECUTE to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.submit_customer_enquiry(
    text, text, text, text, text, text, text
) TO anon, authenticated;

COMMIT;
