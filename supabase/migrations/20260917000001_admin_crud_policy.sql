-- ==============================================================================
-- Migration: Authorized Admin CRUD Access Control for NFCISTA
-- Ensures ONLY verified administrator accounts have CRUD permissions.
-- ==============================================================================

-- 1. Create admin_users registry table
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users FROM anon;
REVOKE ALL ON public.admin_users FROM authenticated;

-- 2. Secure helper function to verify if the current user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (
        -- User ID is explicitly registered in admin_users
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid()
        )
        OR
        -- Owner email from JWT claim
        (auth.jwt() ->> 'email' = 'hellonfcista@gmail.com')
        OR
        -- Supabase app_metadata admin role
        (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Grant table permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;

-- 4. Create strict admin-only RLS policy on customers
-- Only users who pass public.is_admin() can select, insert, update, or delete customers.
-- Any other authenticated user is rejected.
DROP POLICY IF EXISTS "Allow authorized admins full access to customers" ON public.customers;
CREATE POLICY "Allow authorized admins full access to customers"
    ON public.customers
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Helper trigger: When an admin user signs up/in with the owner email, automatically register in admin_users
CREATE OR REPLACE FUNCTION public.sync_owner_admin_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email = 'hellonfcista@gmail.com' THEN
        INSERT INTO public.admin_users (user_id, email)
        VALUES (NEW.id, NEW.email)
        ON CONFLICT (email) DO UPDATE SET user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_owner_admin_user ON auth.users;
CREATE TRIGGER trigger_sync_owner_admin_user
    AFTER INSERT OR UPDATE OF email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_owner_admin_user();
