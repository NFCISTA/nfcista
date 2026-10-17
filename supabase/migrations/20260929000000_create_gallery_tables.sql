-- ==============================================================================
-- Migration: Create Portfolio & Product Gallery tables with strict RLS
-- NFCISTA Digital Business Cards
-- ==============================================================================
-- Architecture:
--   Customer (public.customers) 1 -> N Gallery Items (public.gallery_items)
--   Gallery Item (public.gallery_items) 1 -> N Images (public.gallery_item_images)
--
-- Security:
--   - Row Level Security (RLS) enabled immediately on all gallery tables
--   - Direct table queries revoked from anonymous and unprivileged users
--   - Explicit DENY policy for direct anonymous table scans
--   - Full CRUD permitted only to authorized admins via public.is_admin()
--   - Public visitors access ONLY active items via secure RPC: get_customer_gallery(slug)
--   - Cascading foreign-key deletion prevents orphaned gallery records
-- ==============================================================================

-- 1. Create the gallery_items table
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price TEXT,
    category TEXT,
    external_url TEXT,
    cta_text TEXT,
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT gallery_items_type_check CHECK (
        type IN ('portfolio', 'product')
    ),
    CONSTRAINT gallery_items_title_check CHECK (
        length(trim(title)) > 0 AND length(title) <= 150
    ),
    CONSTRAINT gallery_items_description_check CHECK (
        description IS NULL OR length(description) <= 2000
    ),
    CONSTRAINT gallery_items_price_check CHECK (
        price IS NULL OR length(price) <= 50
    ),
    CONSTRAINT gallery_items_category_check CHECK (
        category IS NULL OR length(category) <= 50
    ),
    CONSTRAINT gallery_items_external_url_check CHECK (
        external_url IS NULL OR (
            external_url ~* '^https?://[^\s/$.?#].[^\s]*$' AND length(external_url) <= 2048
        )
    ),
    CONSTRAINT gallery_items_cta_text_check CHECK (
        cta_text IS NULL OR length(cta_text) <= 50
    )
);

-- 2. Create the gallery_item_images table (multi-image support)
CREATE TABLE IF NOT EXISTS public.gallery_item_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_item_id UUID NOT NULL REFERENCES public.gallery_items(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT gallery_item_images_image_url_check CHECK (
        length(trim(image_url)) > 0 AND (
            image_url ~* '^https?://[^\s/$.?#].[^\s]*$' OR image_url ~* '^/[^\s]*'
        ) AND length(image_url) <= 2048
    )
);

-- 3. Indexes for fast query performance and ordered retrieval
CREATE INDEX IF NOT EXISTS idx_gallery_items_customer_id ON public.gallery_items (customer_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_is_active ON public.gallery_items (is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_items_type ON public.gallery_items (type);
CREATE INDEX IF NOT EXISTS idx_gallery_items_customer_order ON public.gallery_items (customer_id, display_order, created_at);

CREATE INDEX IF NOT EXISTS idx_gallery_item_images_item_id ON public.gallery_item_images (gallery_item_id);
CREATE INDEX IF NOT EXISTS idx_gallery_item_images_order ON public.gallery_item_images (gallery_item_id, display_order, created_at);

-- 4. Trigger for automatic updated_at timestamp maintenance on gallery_items
CREATE OR REPLACE FUNCTION public.handle_gallery_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_gallery_items_updated_at ON public.gallery_items;
CREATE TRIGGER trigger_gallery_items_updated_at
    BEFORE UPDATE ON public.gallery_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_gallery_items_updated_at();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- ==============================================================================

-- Enable RLS on both tables
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_item_images ENABLE ROW LEVEL SECURITY;

-- Revoke default direct permissions from public roles
REVOKE ALL ON public.gallery_items FROM anon;
REVOKE ALL ON public.gallery_items FROM authenticated;
REVOKE ALL ON public.gallery_item_images FROM anon;
REVOKE ALL ON public.gallery_item_images FROM authenticated;

-- Explicitly deny direct SELECT queries to anonymous users (anti-scraping)
DROP POLICY IF EXISTS "Deny direct anon access to gallery_items" ON public.gallery_items;
CREATE POLICY "Deny direct anon access to gallery_items"
    ON public.gallery_items
    FOR SELECT
    TO anon
    USING (false);

DROP POLICY IF EXISTS "Deny direct anon access to gallery_item_images" ON public.gallery_item_images;
CREATE POLICY "Deny direct anon access to gallery_item_images"
    ON public.gallery_item_images
    FOR SELECT
    TO anon
    USING (false);

-- Grant CRUD operations to authenticated role (evaluated strictly by RLS policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_item_images TO authenticated;

-- Admin full access policy using existing public.is_admin()
DROP POLICY IF EXISTS "Allow authorized admins full access to gallery_items" ON public.gallery_items;
CREATE POLICY "Allow authorized admins full access to gallery_items"
    ON public.gallery_items
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow authorized admins full access to gallery_item_images" ON public.gallery_item_images;
CREATE POLICY "Allow authorized admins full access to gallery_item_images"
    ON public.gallery_item_images
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. SECURE PUBLIC GALLERY LOOKUP RPC
-- ==============================================================================
-- Returns ONLY published, active gallery items and images for a given customer slug.
-- Private/internal fields (customer_id, created_at, updated_at) are excluded.
-- Inactive items or inactive customer profiles return zero rows.
CREATE OR REPLACE FUNCTION public.get_customer_gallery(slug_input text)
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

-- Grant execution of the public lookup RPC to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_customer_gallery(text) TO anon, authenticated;
