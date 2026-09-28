-- ==============================================================================
-- Migration: Update destination_url for dummy test card NF8K29
-- NFCISTA Dynamic QR System — Step 5 destination change verification
-- ==============================================================================
-- Purpose:
--   Proves that the physical QR URL (https://nfcista.vercel.app/r/NF8K29)
--   remains unchanged while the redirect destination is updated in the database.
--
-- This update changes ONLY the destination for the dummy test card NF8K29.
-- All other cards, columns, and tables are untouched.
-- ==============================================================================

UPDATE public.dynamic_qr_cards
SET
    destination_url = 'https://www.google.com',
    updated_at      = now()
WHERE card_code = 'NF8K29';
