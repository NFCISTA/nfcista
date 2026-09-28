import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient.js";

/**
 * Shared helper to authenticate and authorize admin API requests.
 *
 * Verifies:
 * 1. Bearer token in 'sb-access-token' HttpOnly cookie or Authorization header.
 * 2. Token validity with Supabase Auth (supabase.auth.getUser).
 * 3. Administrator status via PostgreSQL RPC (public.is_admin()).
 *
 * Returns { errorResponse } if unauthorized or forbidden,
 * or { user, authClient } if authorized.
 */
export async function authenticateAdmin(request) {
  if (!supabase) {
    return {
      errorResponse: NextResponse.json(
        { error: "Server configuration error: Supabase not configured." },
        { status: 500 }
      ),
    };
  }

  // 1. Extract bearer token from cookie or Authorization header
  const cookieStore = await cookies();
  const token =
    cookieStore.get("sb-access-token")?.value ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return {
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Missing authentication session." },
        { status: 401 }
      ),
    };
  }

  // 2. Validate token with Supabase Auth
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Invalid or expired session." },
        { status: 401 }
      ),
    };
  }

  // 3. Create scoped authenticated client using user's bearer token
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  // 4. Verify admin status via public.is_admin() RPC
  const { data: isAdmin, error: adminErr } = await authClient.rpc("is_admin");
  if (adminErr || !isAdmin) {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden: Administrator privileges required." },
        { status: 403 }
      ),
    };
  }

  return { user: userData.user, authClient };
}
