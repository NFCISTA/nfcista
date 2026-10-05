-- ==============================================================================
-- Migration: Create NFCISTA Products Table with RLS & Auto-Code Generation
-- NFCISTA Self-Managed Product Sales System
-- ==============================================================================
-- Architecture:
--   NFCISTA Own Products (public.products)
--   Completely independent from customer profile/gallery systems
--
-- Security:
--   - Row Level Security (RLS) enabled immediately
--   - Public (anonymous & authenticated) can only read active products (is_active = true)
--   - Full CRUD permitted exclusively to authenticated admins via public.is_admin()
--   - Auto-generated product codes (e.g. NFC-001, NFC-002) via sequence & trigger
--   - Auto-updating updated_at timestamp
-- ==============================================================================

-- 1. Sequence for product code generation (NFC-001, NFC-002, ...)
CREATE SEQUENCE IF NOT EXISTS public.product_code_seq START 1;

-- 2. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    category TEXT,
    price NUMERIC(10,2),
    original_price NUMERIC(10,2),
    image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    whatsapp_url TEXT,
    stock_status TEXT NOT NULL DEFAULT 'in_stock',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT products_stock_status_check CHECK (
        stock_status IN ('in_stock', 'out_of_stock', 'coming_soon')
    ),
    CONSTRAINT products_name_check CHECK (
        length(trim(name)) > 0 AND length(name) <= 150
    ),
    CONSTRAINT products_slug_check CHECK (
        length(trim(slug)) > 0 AND length(slug) <= 150 AND slug ~* '^[a-z0-9-]+$'
    ),
    CONSTRAINT products_price_check CHECK (
        price IS NULL OR price >= 0
    ),
    CONSTRAINT products_original_price_check CHECK (
        original_price IS NULL OR original_price >= 0
    )
);

-- 3. Trigger function to auto-assign product_code if omitted
CREATE OR REPLACE FUNCTION public.generate_product_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.product_code IS NULL OR trim(NEW.product_code) = '' THEN
        NEW.product_code := 'NFC-' || lpad(nextval('public.product_code_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_products_product_code ON public.products;
DROP TRIGGER IF EXISTS products_product_code_trigger ON public.products;
CREATE TRIGGER trigger_products_product_code
    BEFORE INSERT ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_product_code();

-- 4. Trigger functions for automatic updated_at timestamp maintenance
-- Defines both handle_products_updated_at (following NFCISTA conventions)
-- and update_updated_at (for backward compatibility).
CREATE OR REPLACE FUNCTION public.handle_products_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS products_updated_at_trigger ON public.products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_products_updated_at();

-- 5. Indexes for fast public and admin querying
CREATE INDEX IF NOT EXISTS idx_products_is_active_display_order
    ON public.products (is_active, display_order ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_products_slug
    ON public.products (slug);

CREATE INDEX IF NOT EXISTS idx_products_product_code
    ON public.products (product_code);

-- 6. Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can view active products
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
    ON public.products
    FOR SELECT
    TO public
    USING (is_active = true);

-- Policy 2: Admins have full access (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
CREATE POLICY "Admins have full access to products"
    ON public.products
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 7. Grant sequence and table permissions to Supabase roles
GRANT USAGE, SELECT ON SEQUENCE public.product_code_seq TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
