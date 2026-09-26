-- ==============================================================================
-- Migration: Add secure public lookup RPC for Dynamic QR card destination
-- NFCISTA Dynamic QR System
-- ==============================================================================
-- Purpose:
--   Allows the server-side redirect route /r/[cardCode] to securely resolve
--   the active destination URL for a given card code without granting direct
--   table access to anonymous callers.
--
-- Security:
--   - RLS on public.dynamic_qr_cards remains untouched (direct anon access blocked).
--   - Function executes as SECURITY DEFINER with search_path = public.
--   - Normalizes input card_code to uppercase.
--   - Only returns active cards (is_active = true).
--   - Returns ONLY the destination_url column (no IDs, timestamps, or internal data).
--   - Returns no rows if not found or inactive.
--   - Granted to anon and authenticated roles.
-- ==============================================================================

-- 1. Drop existing function if present to ensure clean signature and return-type update
DROP FUNCTION IF EXISTS public.get_dynamic_qr_destination(text);

-- 2. Create the secure lookup function
CREATE OR REPLACE FUNCTION public.get_dynamic_qr_destination(card_code_input text)
RETURNS TABLE (
    destination_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        d.destination_url
    FROM public.dynamic_qr_cards d
    WHERE d.card_code = upper(trim(card_code_input))
      AND d.is_active = true
    LIMIT 1;
$$;

-- 3. Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_dynamic_qr_destination(text) TO anon, authenticated;
