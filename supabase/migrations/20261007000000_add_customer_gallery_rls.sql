-- ==============================================================================
-- Migration: Add Customer Self-Service RLS Policies for Gallery & Products
-- NFCISTA Customer Portal — Products & Portfolio Feature
-- ==============================================================================
-- 1. Allows authenticated customers to perform full CRUD on their OWN items in
--    public.gallery_items (where customer_id belongs to auth.uid())
-- 2. Allows authenticated customers to perform full CRUD on their OWN images in
--    public.gallery_item_images (where gallery_item_id belongs to customer's item)
-- 3. Preserves all existing admin CRUD policies (public.is_admin())
-- 4. Preserves anti-scraping DENY policies for anon role
-- 5. Preserves public lookup RPC (get_customer_gallery)
-- ==============================================================================

-- 1. Policies for public.gallery_items
DROP POLICY IF EXISTS "Customers can view their own gallery items" ON public.gallery_items;
CREATE POLICY "Customers can view their own gallery items"
    ON public.gallery_items
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Customers can insert their own gallery items" ON public.gallery_items;
CREATE POLICY "Customers can insert their own gallery items"
    ON public.gallery_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Customers can update their own gallery items" ON public.gallery_items;
CREATE POLICY "Customers can update their own gallery items"
    ON public.gallery_items
    FOR UPDATE
    TO authenticated
    USING (
        customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Customers can delete their own gallery items" ON public.gallery_items;
CREATE POLICY "Customers can delete their own gallery items"
    ON public.gallery_items
    FOR DELETE
    TO authenticated
    USING (
        customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        )
    );

-- 2. Policies for public.gallery_item_images
DROP POLICY IF EXISTS "Customers can view their own gallery item images" ON public.gallery_item_images;
CREATE POLICY "Customers can view their own gallery item images"
    ON public.gallery_item_images
    FOR SELECT
    TO authenticated
    USING (
        gallery_item_id IN (
            SELECT gi.id
            FROM public.gallery_items gi
            JOIN public.customers c ON c.id = gi.customer_id
            WHERE c.auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Customers can insert their own gallery item images" ON public.gallery_item_images;
CREATE POLICY "Customers can insert their own gallery item images"
    ON public.gallery_item_images
    FOR INSERT
    TO authenticated
    WITH CHECK (
        gallery_item_id IN (
            SELECT gi.id
            FROM public.gallery_items gi
            JOIN public.customers c ON c.id = gi.customer_id
            WHERE c.auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Customers can update their own gallery item images" ON public.gallery_item_images;
CREATE POLICY "Customers can update their own gallery item images"
    ON public.gallery_item_images
    FOR UPDATE
    TO authenticated
    USING (
        gallery_item_id IN (
            SELECT gi.id
            FROM public.gallery_items gi
            JOIN public.customers c ON c.id = gi.customer_id
            WHERE c.auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        gallery_item_id IN (
            SELECT gi.id
            FROM public.gallery_items gi
            JOIN public.customers c ON c.id = gi.customer_id
            WHERE c.auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Customers can delete their own gallery item images" ON public.gallery_item_images;
CREATE POLICY "Customers can delete their own gallery item images"
    ON public.gallery_item_images
    FOR DELETE
    TO authenticated
    USING (
        gallery_item_id IN (
            SELECT gi.id
            FROM public.gallery_items gi
            JOIN public.customers c ON c.id = gi.customer_id
            WHERE c.auth_user_id = auth.uid()
        )
    );
