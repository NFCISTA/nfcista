-- ==============================================================================
-- Migration: Add Customer Self-Service Auth Relationship & Strict RLS
-- NFCISTA Customer Self-Service Portal (Phase 1)
-- ==============================================================================
-- 1. Links public.customers to auth.users via auth_user_id (UUID, UNIQUE)
-- 2. Establishes strict RLS so customers can ONLY view and edit their own row
-- 3. Preserves existing admin full CRUD access (public.is_admin())
-- 4. Preserves public lookup via get_customer_by_slug RPC
-- ==============================================================================

-- 1. Add auth_user_id column to public.customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Index for high-performance lookups by auth user ID
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id
ON public.customers (auth_user_id);

-- 3. RLS: Customers can view their own profile
DROP POLICY IF EXISTS "Customers can view their own profile" ON public.customers;
CREATE POLICY "Customers can view their own profile"
    ON public.customers
    FOR SELECT
    TO authenticated
    USING (auth_user_id = auth.uid());

-- 4. RLS: Customers can update their own profile
DROP POLICY IF EXISTS "Customers can update their own profile" ON public.customers;
CREATE POLICY "Customers can update their own profile"
    ON public.customers
    FOR UPDATE
    TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());
