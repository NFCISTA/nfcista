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
 * 5. Uses service-role client strictly on the server to update password via updateUserById.
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

  // ── 2. Service role key verification ─────────────────────────────────────
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
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

  // ── 4. Verify recovery credential & derive target user ID ────────────────
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let targetUserId = null;

  // Path A: Authenticated recovery access token (JWT)
  if (accessToken && typeof accessToken === "string") {
    const { data: authUserData, error: tokenError } = await supabaseAdmin.auth.getUser(accessToken);
    if (!tokenError && authUserData?.user?.id) {
      targetUserId = authUserData.user.id;
    }
  }

  // Path B: Direct token_hash verification fallback
  if (!targetUserId && tokenHash && typeof tokenHash === "string") {
    const { data: otpData, error: otpError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    if (!otpError && otpData?.user?.id) {
      targetUserId = otpData.user.id;
    }
  }

  if (!targetUserId) {
    return NextResponse.json(
      { error: "Invalid or expired password reset link. Please request a new link." },
      { status: 401 }
    );
  }

  // ── 5. Perform server-side password update scoped to derived user ID ──────
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    targetUserId,
    { password: newPassword }
  );

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
