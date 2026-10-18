BEGIN;

-- ==============================================================================
-- Migration: Add submit_customer_enquiry SECURITY DEFINER RPC
-- ==============================================================================
-- BUG FIX for: Public /api/enquiry fails because the anon Supabase client
-- cannot directly SELECT from public.customers or INSERT into
-- public.customer_enquiries due to correct RLS restrictions.
--
-- Solution:
--   Create a SECURITY DEFINER function public.submit_customer_enquiry(...)
--   that atomically:
--     1. Validates the customer is active and has enquiry_enabled = TRUE.
--     2. Snapshots delivery settings at the moment of submission.
--     3. Inserts the enquiry record into public.customer_enquiries.
--     4. Returns only the minimum data the API needs:
--        - status / success flag
--        - customer full_name (for WhatsApp message template)
--        - customer whatsapp (only when delivery_whatsapp is true)
--        - delivery_whatsapp flag
--        - new enquiry id (for audit trail)
--
-- Security design:
--   - Direct anon SELECT on customers remains FORBIDDEN (RLS unchanged).
--   - Direct anon INSERT on customer_enquiries remains FORBIDDEN (RLS unchanged).
--   - customer_id, auth_user_id, customer email, social URLs,
--     photo_url, address, and all private data are NEVER returned.
--   - Runs as the database owner (SECURITY DEFINER) with a pinned
--     SET search_path = public to prevent search-path injection attacks.
--   - GRANT EXECUTE given to anon and authenticated roles only.
-- ==============================================================================

-- Drop the previous version if it exists (safe idempotent upgrade)
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
    wa_number        text,   -- NULL unless delivery_whatsapp is TRUE and customer has a number
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
    -- 1. Find the customer by slug: must be active AND have enquiry enabled.
    --    If no matching row exists, return DISABLED immediately without leaking info.
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
    --    WhatsApp number is returned ONLY when delivery_whatsapp is TRUE.
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

-- Grant EXECUTE to anonymous and authenticated roles.
-- This does NOT grant any table-level SELECT or INSERT permissions.
GRANT EXECUTE ON FUNCTION public.submit_customer_enquiry(
    text, text, text, text, text, text, text
) TO anon, authenticated;

COMMIT;
