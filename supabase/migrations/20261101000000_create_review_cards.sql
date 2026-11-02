-- ==============================================================================
-- Migration: Create public.review_cards with RLS & Public Lookup RPC
-- NFCISTA Standalone Google Review Cards System
-- ==============================================================================
-- Architecture:
-- 1. Dedicated public.review_cards table for standalone Google Review Cards.
-- 2. Decoupled from public.customers (zero digital profile required).
-- 3. review_assistant_enabled DEFAULTS TO FALSE (opt-in only, manually enabled).
-- 4. RLS enabled: direct anon table access completely blocked.
-- 5. Admin management access granted via public.is_admin().
-- 6. SECURITY DEFINER public lookup RPC returns ONLY public business config.
-- ==============================================================================

BEGIN;

-- 1. Create review_cards table
CREATE TABLE IF NOT EXISTS public.review_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_code TEXT UNIQUE NOT NULL,                          -- e.g. 'NF8K29'
    business_name TEXT NOT NULL,                             -- e.g. 'Dr. Sharma Dental'
    category TEXT NOT NULL DEFAULT 'retail',                 -- e.g. 'clinic', 'restaurant', 'salon'
    google_review_url TEXT NOT NULL,                         -- Verified Google Review destination
    review_assistant_enabled BOOLEAN NOT NULL DEFAULT false, -- MANDATORY: Defaults to FALSE
    is_active BOOLEAN NOT NULL DEFAULT true,                 -- Card active status
    notes TEXT,                                              -- Internal admin notes (never public)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT review_cards_code_format CHECK (
        card_code ~ '^[A-Z0-9_-]+$' AND card_code = upper(card_code)
    ),
    CONSTRAINT review_cards_name_not_empty CHECK (
        length(trim(business_name)) > 0 AND length(business_name) <= 150
    ),
    CONSTRAINT review_cards_google_url_not_empty CHECK (
        length(trim(google_review_url)) > 0
    )
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_review_cards_code ON public.review_cards (card_code);
CREATE INDEX IF NOT EXISTS idx_review_cards_is_active ON public.review_cards (is_active);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_review_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_review_cards_updated_at ON public.review_cards;
CREATE TRIGGER trigger_review_cards_updated_at
    BEFORE UPDATE ON public.review_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_review_cards_updated_at();

-- 2. Row Level Security (RLS) Configuration
ALTER TABLE public.review_cards ENABLE ROW LEVEL SECURITY;

-- Revoke all direct table operations from PUBLIC, anon, and authenticated
REVOKE ALL ON TABLE public.review_cards FROM PUBLIC, anon, authenticated;

-- Explicitly deny direct table access for anon
DROP POLICY IF EXISTS "Deny direct anon access to review_cards" ON public.review_cards;
CREATE POLICY "Deny direct anon access to review_cards"
    ON public.review_cards
    FOR ALL
    TO anon
    USING (false);

-- Admin CRUD Access
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.review_cards TO authenticated;

DROP POLICY IF EXISTS "Allow admins full access to review_cards" ON public.review_cards;
CREATE POLICY "Allow admins full access to review_cards"
    ON public.review_cards
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3. Public Lookup RPC (SECURITY DEFINER)
-- Returns ONLY the 5 necessary public attributes; strictly strips IDs, timestamps, and admin notes.
-- SECURITY REQUIREMENT: Returns NO ROWS unless card exists, is active AND review_assistant_enabled = true.
-- Inactive or unconfigured cards never expose business name or Google Review URL to the public.
DROP FUNCTION IF EXISTS public.get_review_card_config(text);

CREATE OR REPLACE FUNCTION public.get_review_card_config(card_code_input text)
RETURNS TABLE (
    business_name TEXT,
    category TEXT,
    google_review_url TEXT,
    review_assistant_enabled BOOLEAN,
    is_active BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        r.business_name,
        r.category,
        r.google_review_url,
        r.review_assistant_enabled,
        r.is_active
    FROM public.review_cards r
    WHERE r.card_code = upper(trim(card_code_input))
      AND r.is_active = true
      AND r.review_assistant_enabled = true
    LIMIT 1;
$$;

-- Explicitly assign function ownership to trusted postgres role
ALTER FUNCTION public.get_review_card_config(text) OWNER TO postgres;

-- Security Hardening: Revoke execution from PUBLIC, grant strictly to anon, authenticated, service_role
REVOKE ALL ON FUNCTION public.get_review_card_config(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_review_card_config(text) TO anon, authenticated, service_role;

COMMIT;
