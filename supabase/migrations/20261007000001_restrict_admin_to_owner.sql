-- ==============================================================================
-- Migration: Restrict Admin Access Strictly to Owner Email
-- Ensures ONLY hellonfcista@gmail.com is authorized as an administrator.
-- ==============================================================================

-- 1. Remove any non-owner records from admin_users table
DELETE FROM public.admin_users 
WHERE lower(email) != 'hellonfcista@gmail.com';

-- 2. Update public.is_admin() to strictly authorize ONLY hellonfcista@gmail.com
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (
        lower(coalesce(auth.jwt() ->> 'email', '')) = 'hellonfcista@gmail.com'
    );
$$;

-- Ensure execute permissions are granted to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
