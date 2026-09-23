import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * Admin Session Route Handler
 *
 * Securely manages the HttpOnly session cookie for server-side proxy gating.
 * The access token is NEVER written to document.cookie and cannot be read by JavaScript.
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

    // Verify token validity with Supabase Auth before issuing HttpOnly cookie
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

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("sb-access-token");
  return response;
}
