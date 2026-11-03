-- ==============================================================================
-- Migration: Add Review Assistant Analytics System
-- NFCISTA Review Assistant Analytics Dashboard
-- ==============================================================================
-- 1. Adds analytics_enabled to public.customers (default FALSE for opt-in).
-- 2. Links public.review_cards to public.customers via customer_id (foreign key).
-- 3. Creates public.review_card_events for tracking funnel events.
-- 4. Establishes RLS policies:
--    - Customers can SELECT only events for review_cards assigned to their profile.
--    - Admin has full SELECT/manage access via public.is_admin().
--    - Anonymous users have zero direct SELECT access.
-- 5. Creates SECURITY DEFINER RPC record_review_card_event for abuse-protected event ingestion.
-- ==============================================================================

BEGIN;

-- 1. Add analytics_enabled column to public.customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS analytics_enabled BOOLEAN NOT NULL DEFAULT false;

-- 2. Link review_cards to customers
ALTER TABLE public.review_cards
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_review_cards_customer_id
ON public.review_cards (customer_id);

-- 3. Create review_card_events table
CREATE TABLE IF NOT EXISTS public.review_card_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_code TEXT NOT NULL,
    event_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT review_card_events_type_check CHECK (
        event_type IN (
            'card_visit',       -- Physical tap or direct /r/[cardCode] hardware landing
            'page_view',        -- Standalone review assistant loaded at /review/c/[cardCode]
            'draft_generated',  -- Customer generated a review draft
            'draft_copied',     -- Customer successfully copied draft to clipboard
            'google_click'      -- Customer navigated outbound to Google Review
        )
    ),
    CONSTRAINT review_card_events_code_format CHECK (
        card_code ~ '^[A-Z0-9_-]+$' AND card_code = upper(card_code)
    )
);

-- Performance Indexes for aggregation queries by card, event type and date
CREATE INDEX IF NOT EXISTS idx_review_events_code_type_created
ON public.review_card_events (card_code, event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_review_events_created
ON public.review_card_events (created_at);

-- 4. Row Level Security (RLS) Configuration
ALTER TABLE public.review_card_events ENABLE ROW LEVEL SECURITY;

-- Grant SELECT to authenticated users so RLS policies can evaluate
GRANT SELECT ON TABLE public.review_card_events TO authenticated;

-- Explicitly revoke all access from anon
REVOKE ALL ON TABLE public.review_card_events FROM anon;

-- Customer SELECT Policy:
-- Customers can view only events for review cards assigned to their customer record,
-- AND only if analytics_enabled is true for their customer record.
DROP POLICY IF EXISTS "Customers can view events for their assigned review cards" ON public.review_card_events;
CREATE POLICY "Customers can view events for their assigned review cards"
    ON public.review_card_events
    FOR SELECT
    TO authenticated
    USING (
        card_code IN (
            SELECT rc.card_code
            FROM public.review_cards rc
            INNER JOIN public.customers c ON c.id = rc.customer_id
            WHERE c.auth_user_id = auth.uid()
              AND c.analytics_enabled = true
        )
    );

-- Admin Full Access Policy:
-- Admin (hellonfcista@gmail.com verified via public.is_admin()) can query all events
DROP POLICY IF EXISTS "Admin full access to review_card_events" ON public.review_card_events;
CREATE POLICY "Admin full access to review_card_events"
    ON public.review_card_events
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Abuse-Protected Ingestion RPC (SECURITY DEFINER)
-- Validates:
--   a) Valid event type
--   b) Card exists, is_active = true, and review_assistant_enabled = true
--   c) Normalizes card code to uppercase
-- Rejects arbitrary codes. Does not store personal info or review text.
DROP FUNCTION IF EXISTS public.record_review_card_event(text, text);

CREATE OR REPLACE FUNCTION public.record_review_card_event(
    p_card_code TEXT,
    p_event_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_clean_code TEXT;
    v_is_valid BOOLEAN;
BEGIN
    IF p_card_code IS NULL OR p_event_type IS NULL THEN
        RETURN FALSE;
    END IF;

    v_clean_code := upper(trim(p_card_code));

    -- Validate event type
    IF p_event_type NOT IN ('card_visit', 'page_view', 'draft_generated', 'draft_copied', 'google_click') THEN
        RETURN FALSE;
    END IF;

    -- Verify card exists, is active, and review assistant is enabled
    SELECT EXISTS (
        SELECT 1 FROM public.review_cards
        WHERE card_code = v_clean_code
          AND is_active = true
          AND review_assistant_enabled = true
    ) INTO v_is_valid;

    IF NOT v_is_valid THEN
        RETURN FALSE;
    END IF;

    -- Record event cleanly
    INSERT INTO public.review_card_events (card_code, event_type, created_at)
    VALUES (v_clean_code, p_event_type, now());

    RETURN TRUE;
END;
$$;

-- Security Hardening: Revoke execution from PUBLIC, grant strictly to anon, authenticated, service_role
ALTER FUNCTION public.record_review_card_event(text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.record_review_card_event(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_review_card_event(text, text) TO anon, authenticated, service_role;

COMMIT;
