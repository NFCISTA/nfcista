-- ==============================================================================
-- Migration: Add digital_card_enabled to public.customers
-- ==============================================================================
-- 1. Adds digital_card_enabled column defaulting to TRUE (backward compatibility).
-- 2. Preserves all existing customers as active Digital Business Card owners.
-- 3. Keeps get_customer_by_slug RPC intact without unnecessary public exposure
--    or risky function drop/recreation in production.
-- ==============================================================================

BEGIN;

-- Add digital_card_enabled column to public.customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS digital_card_enabled BOOLEAN NOT NULL DEFAULT true;

COMMIT;

