-- ==============================================================================
-- Migration: Create customers table with strict Row Level Security (RLS)
-- NFCISTA Digital Business Cards
-- ==============================================================================

-- 1. Create the customers table (stores full customer profile)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    job_title TEXT,
    company_name TEXT,
    category TEXT,
    description TEXT,
    phone TEXT,
    whatsapp TEXT,
    instagram TEXT,
    email TEXT,
    website TEXT,
    address TEXT,
    google_review_url TEXT,
    profile_slug TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT customers_profile_slug_format CHECK (profile_slug ~ '^[a-z0-9-_]+$')
);

-- 2. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_customers_profile_slug ON public.customers (profile_slug);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON public.customers (is_active);

-- 3. Trigger for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION public.handle_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_customers_updated_at ON public.customers;
CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_customers_updated_at();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- ==============================================================================
-- Enable RLS on the table.
-- With RLS enabled, NO operations are permitted to anon/authenticated unless
-- an explicit policy permits it.
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Revoke default direct access to ensure zero unauthorized table scans
REVOKE ALL ON public.customers FROM anon;
REVOKE ALL ON public.customers FROM authenticated;

-- Explicitly deny all direct SELECT queries on the customers table to anonymous users.
-- This ensures that anonymous users can NEVER dump, scrape, or list the customer table.
CREATE POLICY "Deny all direct anon access to customers"
    ON public.customers
    FOR SELECT
    TO anon
    USING (false);

-- ==============================================================================
-- 5. SECURE PUBLIC PROFILE LOOKUP (RPC)
-- ==============================================================================
-- Public visitors must ONLY be able to fetch public-safe profile fields for a single active slug.
-- SENSITIVE / PRIVATE FIELDS ARE STRICTLY EXCLUDED:
--   - phone (EXCLUDED)
--   - whatsapp (EXCLUDED)
--   - email (EXCLUDED)
--   - address (EXCLUDED)
--   - id, created_at, updated_at (EXCLUDED)
--
-- ONLY public branding / presentation fields are returned:
CREATE OR REPLACE FUNCTION public.get_customer_by_slug(slug_input text)
RETURNS TABLE (
    full_name TEXT,
    job_title TEXT,
    company_name TEXT,
    category TEXT,
    description TEXT,
    instagram TEXT,
    website TEXT,
    google_review_url TEXT,
    profile_slug TEXT,
    is_active BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        c.full_name,
        c.job_title,
        c.company_name,
        c.category,
        c.description,
        c.instagram,
        c.website,
        c.google_review_url,
        c.profile_slug,
        c.is_active
    FROM public.customers c
    WHERE c.profile_slug = slug_input
      AND c.is_active = true
    LIMIT 1;
$$;

-- Grant execution of the public lookup function to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;

-- ==============================================================================
-- 6. DUMMY TEST RECORD (Purely fake sample data for verification)
-- ==============================================================================
INSERT INTO public.customers (
    full_name,
    job_title,
    company_name,
    category,
    description,
    phone,
    whatsapp,
    instagram,
    email,
    website,
    address,
    google_review_url,
    profile_slug,
    is_active
) VALUES (
    'Test Customer',
    'Marketing Director',
    'Demo Company',
    'Digital Marketing',
    'This is a fake test profile used to verify database connectivity and Row Level Security.',
    '+1 (555) 000-1234',
    '15550001234',
    'democompany',
    'test@democompany.example.com',
    'https://democompany.example.com',
    '123 Demo Street, Sample City',
    'https://maps.google.com',
    'demo-customer',
    true
) ON CONFLICT (profile_slug) DO NOTHING;
