-- ==============================================================================
-- Migration: Create gallery-images storage bucket with strict RLS
-- NFCISTA Portfolio & Product Gallery
-- ==============================================================================
-- 1. Creates public 'gallery-images' storage bucket (max 5 MB, image MIME types)
-- 2. Establishes strict Storage RLS policies (Public view, Admin upload/replace/delete)
-- ==============================================================================

-- 1. Create 'gallery-images' bucket in Supabase storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gallery-images',
    'gallery-images',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Row Level Security (RLS) on storage.objects for 'gallery-images'
-- Public can view gallery images
DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;
CREATE POLICY "Public can view gallery images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'gallery-images');

-- Authorized Admins can upload gallery images
DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
CREATE POLICY "Admins can upload gallery images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'gallery-images'
        AND public.is_admin()
    );

-- Authorized Admins can update/replace gallery images
DROP POLICY IF EXISTS "Admins can update gallery images" ON storage.objects;
CREATE POLICY "Admins can update gallery images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'gallery-images'
        AND public.is_admin()
    )
    WITH CHECK (
        bucket_id = 'gallery-images'
        AND public.is_admin()
    );

-- Authorized Admins can delete gallery images
DROP POLICY IF EXISTS "Admins can delete gallery images" ON storage.objects;
CREATE POLICY "Admins can delete gallery images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'gallery-images'
        AND public.is_admin()
    );
