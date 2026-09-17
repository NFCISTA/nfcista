import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Client Configuration
 *
 * Uses public environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase publishable / anon key
 *
 * SECURITY NOTICE:
 * - The publishable / anon key is safe to be exposed in the browser when protected
 *   by Supabase Row Level Security (RLS) policies.
 * - NEVER add your service_role secret key or database passwords here.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file or Vercel Environment Variables."
    );
  }
  return supabase;
}
