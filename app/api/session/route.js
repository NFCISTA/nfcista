import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

/**
 * Shared Session Cookie Route
 *
 * Manages the HttpOnly `sb-access-token` cookie for the customer portal.
 * This endpoint is used by:
 *   - POST: /login page (customer sign-in) — sets the cookie after auth
 *   - DELETE: /dashboard layout (customer sign-out) — clears the cookie
 *
 * The admin portal uses /api/admin/session independently.
 * This route intentionally does NOT perform any admin operations.
 */

/**
 * POST /api/session
 * Validates the customer's access token and sets an HttpOnly session cookie.
 * The token is verified with Supabase Auth before the cookie is issued.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { access_token, expires_in } = body || {};

    if (!access_token || typeof access_token !== "string") {
      return NextResponse.json({ error: "Missing access token" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // Verify token with Supabase Auth before setting cookie
    const { data, error } = await supabase.auth.getUser(access_token);
    if (error || !data?.user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    const maxAge = typeof expires_in === "number" && expires_in > 0 ? expires_in : 3600;

    response.cookies.set({
      name: "sb-access-token",
      value: access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Failed to establish session" }, { status: 500 });
  }
}

/**
 * DELETE /api/session
 * Clears the HttpOnly session cookie (customer sign-out).
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("sb-access-token");
  return response;
}
