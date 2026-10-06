import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient.js";

/**
 * Shared helper to authenticate and authorize customer self-service requests.
 *
 * Verifies:
 * 1. Bearer token in 'sb-access-token' HttpOnly cookie or Authorization header.
 * 2. Token validity with Supabase Auth (supabase.auth.getUser).
 * 3. Linked customer profile where public.customers.auth_user_id = user.id.
 *
 * Returns { errorResponse } if unauthorized or not linked,
 * or { user, customer, authClient } if authorized.
 */
export async function authenticateCustomer(request) {
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

  // 4. Fetch the linked customer profile for this user
  const { data: customer, error: customerErr } = await authClient
    .from("customers")
    .select("*")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();

  if (customerErr) {
    return {
      errorResponse: NextResponse.json(
        { error: "Failed to load customer profile: " + customerErr.message },
        { status: 500 }
      ),
    };
  }

  if (!customer) {
    return {
      errorResponse: NextResponse.json(
        {
          error: "No customer profile is linked to this account. Please contact NFCISTA support.",
          unlinked: true,
          userId: userData.user.id,
          userEmail: userData.user.email,
        },
        { status: 404 }
      ),
    };
  }

  return { user: userData.user, customer, authClient };
}
