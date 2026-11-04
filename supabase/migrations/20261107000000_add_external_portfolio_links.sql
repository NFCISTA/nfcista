-- ==============================================================================
-- Migration: Add External Portfolio Links Support to Gallery Items
-- NFCISTA Digital Business Cards — Business Profile Enhancement
-- ==============================================================================
-- 1. Adds is_external_link BOOLEAN NOT NULL DEFAULT false to public.gallery_items
-- 2. Creates index on (customer_id, is_external_link) for optimized lookups
-- 3. Updates get_customer_gallery(slug) RPC to expose is_external_link
--
-- BACKWARDS COMPATIBILITY GUARANTEES:
-- - All existing gallery items automatically default to is_external_link = false.
-- - Existing image portfolio uploads, product items, and customer records remain 100% intact.
-- - Existing public profile URLs and APIs remain fully backwards-compatible.
-- ==============================================================================

BEGIN;

-- 1. Add is_external_link column to public.gallery_items
ALTER TABLE public.gallery_items
ADD COLUMN IF NOT EXISTS is_external_link BOOLEAN NOT NULL DEFAULT false;

-- 2. Index for fast filtering of external links vs image portfolio items
CREATE INDEX IF NOT EXISTS idx_gallery_items_external_link
ON public.gallery_items (customer_id, is_external_link);

-- 3. Update public.get_customer_gallery RPC to include is_external_link
DROP FUNCTION IF EXISTS public.get_customer_gallery(text);

CREATE FUNCTION public.get_customer_gallery(slug_input text)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    description TEXT,
    price TEXT,
    category TEXT,
    external_url TEXT,
    cta_text TEXT,
    whatsapp_enabled BOOLEAN,
    display_order INTEGER,
    is_external_link BOOLEAN,
    images JSON
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        gi.id,
        gi.type,
        gi.title,
        gi.description,
        gi.price,
        gi.category,
        gi.external_url,
        gi.cta_text,
        gi.whatsapp_enabled,
        gi.display_order,
        COALESCE(gi.is_external_link, false) AS is_external_link,
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', gii.id,
                        'image_url', gii.image_url,
                        'display_order', gii.display_order
                    ) ORDER BY gii.display_order ASC, gii.created_at ASC
                )
                FROM public.gallery_item_images gii
                WHERE gii.gallery_item_id = gi.id
            ),
            '[]'::json
        ) AS images
    FROM public.gallery_items gi
    JOIN public.customers c ON c.id = gi.customer_id
    WHERE c.profile_slug = lower(trim(slug_input))
      AND c.is_active = true
      AND gi.is_active = true
    ORDER BY gi.display_order ASC, gi.created_at ASC;
$$;

-- Grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_customer_gallery(text) TO anon, authenticated;

COMMIT;
