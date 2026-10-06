-- ==============================================================================
-- Migration: Create profile-photos storage bucket with public read access
-- NFCISTA Customer Self-Service Portal — Profile Photo Upload
-- ==============================================================================
-- 1. Creates public 'profile-photos' bucket (max 5 MB, image MIME types)
-- 2. Establishes Storage RLS: public can read; authenticated customers can
--    only upload/update/delete files within their own folder
--    (path prefix = 'customers/' || auth.uid() || '/')
-- ==============================================================================

-- 1. Create 'profile-photos' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos',
    'profile-photos',
    true,
    5242880,  -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public           = true,
    file_size_limit  = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Public can view all profile photos (needed for public /p/[slug] profiles)
DROP POLICY IF EXISTS "Public can view profile photos" ON storage.objects;
CREATE POLICY "Public can view profile photos"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'profile-photos');

-- 3. Authenticated customers can upload their own photo (path must be under customers/{uid}/)
DROP POLICY IF EXISTS "Customers can upload their own profile photo" ON storage.objects;
CREATE POLICY "Customers can upload their own profile photo"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'profile-photos'
        AND (storage.foldername(name))[1] = 'customers'
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

-- 4. Authenticated customers can update/replace their own photo
DROP POLICY IF EXISTS "Customers can update their own profile photo" ON storage.objects;
CREATE POLICY "Customers can update their own profile photo"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'profile-photos'
        AND (storage.foldername(name))[1] = 'customers'
        AND (storage.foldername(name))[2] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'profile-photos'
        AND (storage.foldername(name))[1] = 'customers'
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

-- 5. Authenticated customers can delete their own photo
DROP POLICY IF EXISTS "Customers can delete their own profile photo" ON storage.objects;
CREATE POLICY "Customers can delete their own profile photo"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'profile-photos'
        AND (storage.foldername(name))[1] = 'customers'
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

-- 6. Admins retain full access to all profile photos
DROP POLICY IF EXISTS "Admins can manage all profile photos" ON storage.objects;
CREATE POLICY "Admins can manage all profile photos"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'profile-photos' AND public.is_admin())
    WITH CHECK (bucket_id = 'profile-photos' AND public.is_admin());
