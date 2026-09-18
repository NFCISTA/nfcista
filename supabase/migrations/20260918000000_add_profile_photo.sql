-- ==============================================================================
-- Migration: Add optional Profile Photo support to NFCISTA
-- ==============================================================================
-- 1. Adds photo_url column to public.customers
-- 2. Updates get_customer_by_slug RPC to return photo_url
-- 3. Creates public 'profile-photos' storage bucket (max 5 MB, image MIME types)
-- 4. Establishes strict Storage RLS policies (Public view, Admin upload/replace/delete)
-- ==============================================================================

-- 1. Add photo_url column to public.customers (allows NULL)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT NULL;

-- 2. Update secure public profile lookup RPC to include photo_url
CREATE OR REPLACE FUNCTION public.get_customer_by_slug(slug_input text)
RETURNS TABLE (
    full_name         TEXT,
    job_title         TEXT,
    company_name      TEXT,
    category          TEXT,
    description       TEXT,
    instagram         TEXT,
    website           TEXT,
    google_review_url TEXT,
    profile_slug      TEXT,
    is_active         BOOLEAN,
    phone             TEXT,
    whatsapp          TEXT,
    email             TEXT,
    address           TEXT,
    photo_url         TEXT
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
        c.is_active,
        c.phone,
        c.whatsapp,
        c.email,
        c.address,
        c.photo_url
    FROM public.customers c
    WHERE c.profile_slug = slug_input
      AND c.is_active = true
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_by_slug(text) TO anon, authenticated;

-- 3. Create 'profile-photos' bucket in Supabase storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos',
    'profile-photos',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 4. Row Level Security (RLS) on storage.objects for 'profile-photos'
-- Public can view profile photos of active customers
DROP POLICY IF EXISTS "Public can view profile photos" ON storage.objects;
CREATE POLICY "Public can view profile photos"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'profile-photos');

-- Authorized Admins can upload profile photos
DROP POLICY IF EXISTS "Admins can upload profile photos" ON storage.objects;
CREATE POLICY "Admins can upload profile photos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'profile-photos'
        AND public.is_admin()
    );

-- Authorized Admins can update/replace profile photos
DROP POLICY IF EXISTS "Admins can update profile photos" ON storage.objects;
CREATE POLICY "Admins can update profile photos"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'profile-photos'
        AND public.is_admin()
    )
    WITH CHECK (
        bucket_id = 'profile-photos'
        AND public.is_admin()
    );

-- Authorized Admins can delete profile photos
DROP POLICY IF EXISTS "Admins can delete profile photos" ON storage.objects;
CREATE POLICY "Admins can delete profile photos"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'profile-photos'
        AND public.is_admin()
    );
