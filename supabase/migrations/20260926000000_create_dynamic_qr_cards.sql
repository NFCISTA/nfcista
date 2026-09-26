-- ==============================================================================
-- Migration: Create dynamic_qr_cards table with strict Row Level Security (RLS)
-- NFCISTA Dynamic QR System
-- ==============================================================================
-- Architecture:
--   Physical NFCISTA card -> Unique card code -> https://nfcista.com/r/[cardCode]
--   -> Supabase -> Current destination URL
--
-- Security:
--   - RLS enabled immediately
--   - All direct table operations revoked from anon and unprivileged authenticated
--   - Explicit DENY policy for direct anonymous SELECT (prevents scraping/listing)
--   - Admin-only CRUD access policy using public.is_admin()
--   - Controlled server-side lookup / RPC to be added in future step
-- ==============================================================================

-- 1. Create the dynamic_qr_cards table
CREATE TABLE IF NOT EXISTS public.dynamic_qr_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_code TEXT NOT NULL UNIQUE,
    destination_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT dynamic_qr_cards_card_code_format CHECK (
        card_code ~ '^[A-Z0-9_-]+$' AND card_code = upper(card_code)
    ),
    CONSTRAINT dynamic_qr_cards_destination_url_not_empty CHECK (
        length(trim(destination_url)) > 0
    )
);

-- 2. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_dynamic_qr_cards_card_code ON public.dynamic_qr_cards (card_code);
CREATE INDEX IF NOT EXISTS idx_dynamic_qr_cards_is_active ON public.dynamic_qr_cards (is_active);

-- 3. Trigger for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION public.handle_dynamic_qr_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_dynamic_qr_cards_updated_at ON public.dynamic_qr_cards;
CREATE TRIGGER trigger_dynamic_qr_cards_updated_at
    BEFORE UPDATE ON public.dynamic_qr_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_dynamic_qr_cards_updated_at();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- ==============================================================================

-- Enable RLS on the table
ALTER TABLE public.dynamic_qr_cards ENABLE ROW LEVEL SECURITY;

-- Revoke default direct access to ensure zero unauthorized table scans
REVOKE ALL ON public.dynamic_qr_cards FROM anon;
REVOKE ALL ON public.dynamic_qr_cards FROM authenticated;

-- Explicitly deny all direct SELECT queries on dynamic_qr_cards to anonymous users.
-- This ensures anonymous users can NEVER dump, scrape, or list dynamic QR cards.
DROP POLICY IF EXISTS "Deny all direct anon access to dynamic_qr_cards" ON public.dynamic_qr_cards;
CREATE POLICY "Deny all direct anon access to dynamic_qr_cards"
    ON public.dynamic_qr_cards
    FOR SELECT
    TO anon
    USING (false);

-- Grant CRUD table permissions to authenticated role (gated by RLS policy below)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dynamic_qr_cards TO authenticated;

-- Strict admin-only RLS policy for dynamic_qr_cards management
-- Only users who pass public.is_admin() can select, insert, update, or delete cards.
DROP POLICY IF EXISTS "Allow authorized admins full access to dynamic_qr_cards" ON public.dynamic_qr_cards;
CREATE POLICY "Allow authorized admins full access to dynamic_qr_cards"
    ON public.dynamic_qr_cards
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ==============================================================================
-- 5. DUMMY TEST RECORD (Purely fake sample data for verification)
-- ==============================================================================
INSERT INTO public.dynamic_qr_cards (
    card_code,
    destination_url,
    is_active
) VALUES (
    'NF8K29',
    'https://example.com',
    true
) ON CONFLICT (card_code) DO NOTHING;
