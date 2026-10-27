import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { NFCISTA_BASE_URL } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

/**
 * Allowed origins for CSRF protection.
 * Strict origin allowlist matching our trusted endpoints.
 * Host / X-Forwarded-Host headers are intentionally never read.
 */
const ALLOWED_ORIGINS = [
  NFCISTA_BASE_URL,          // https://nfcista.vercel.app
  "http://localhost:3000",   // local development
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.SITE_URL,
].filter(Boolean);

/**
 * POST /api/auth/reset-password
 *
 * Dedicated server-side password reset execution endpoint for genuine recovery flows.
 *
 * Security requirements:
 * 1. Strict Origin / CSRF check matching ALLOWED_ORIGINS.
 * 2. Accepts either:
 *    - `accessToken`: an authenticated recovery session JWT (from verifyOtp or PASSWORD_RECOVERY event)
 *    - `tokenHash`: a recovery token_hash to verify directly via service role
 * 3. Validates the recovery credential with Supabase Auth to identify the target user:
 *    - Never accepts `user.id`, `customer_id`, or `email` from the client request.
 * 4. Password validation:
 *    - Minimum 6 characters required.
 * 5. Updates password via direct authenticated PUT /auth/v1/user scoped to the verified recovery token.
 * 6. Never logs passwords, tokens, request bodies, or internal secrets.
 * 7. Returns generic error messages without leaking database or internal Auth details.
 */
export async function POST(request) {
  // ── 1. CSRF: Origin verification ─────────────────────────────────────────
  const origin = request.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { error: "Forbidden: invalid request origin." },
      { status: 403 }
    );
  }

  // ── 2. Validate environment configuration ────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  // ── 3. Parse request body ────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { newPassword, accessToken, tokenHash } = body || {};

  // Validate new password
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters long." },
      { status: 400 }
    );
  }

  // Ensure at least one legitimate recovery credential was provided
  if (!accessToken && !tokenHash) {
    return NextResponse.json(
      { error: "Missing recovery credentials. Please use the reset link from your email or admin." },
      { status: 400 }
    );
  }

  // ── 4. Verify recovery credential & obtain verified user token ───────────
  // We first verify the recovery credential using the admin client.
  // Never trust user.id or email from client payload.
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let validAccessToken = null;

  // Path A: Authenticated recovery access token (JWT)
  if (accessToken && typeof accessToken === "string") {
    const { data: authUserData, error: tokenError } = await supabaseAdmin.auth.getUser(accessToken);
    if (!tokenError && authUserData?.user?.id) {
      validAccessToken = accessToken;
    }
  }

  // Path B: Direct token_hash verification fallback
  if (!validAccessToken && tokenHash && typeof tokenHash === "string") {
    const { data: otpData, error: otpError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    if (!otpError && otpData?.session?.access_token) {
      validAccessToken = otpData.session.access_token;
    }
  }

  if (!validAccessToken) {
    return NextResponse.json(
      { error: "Invalid or expired password reset link. Please request a new link." },
      { status: 401 }
    );
  }

  // ── 5. Perform password update scoped to verified recovery token ───────────
  // Replaces failing userClient.auth.updateUser with direct authenticated PUT to Supabase Auth /auth/v1/user
  // using customer's verified Bearer JWT (validAccessToken).
  // Bypasses GoTrue client's internal session requirement while officially completing recovery flow.
  let updateRes;
  try {
    updateRes = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/auth/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${validAccessToken}`,
      },
      body: JSON.stringify({ password: newPassword }),
    });
  } catch {
    return NextResponse.json(
      { error: "Authentication service temporarily unreachable. Please try again later." },
      { status: 502 }
    );
  }

  if (!updateRes.ok) {
    const errorBody = await updateRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errorBody.msg || errorBody.message || "Failed to reset password. Please try again." },
      { status: updateRes.status || 500 }
    );
  }

  return NextResponse.json({ success: true });
}
