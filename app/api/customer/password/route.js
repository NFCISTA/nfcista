import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateCustomer } from "@/lib/customerAuth";
import { NFCISTA_BASE_URL } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

/**
 * Allowed origins for CSRF protection.
 * Explicitly allows production domain, local development, and
 * any configured site URL environment variables.
 * Host / X-Forwarded-Host headers are intentionally never read.
 */
const ALLOWED_ORIGINS = [
  NFCISTA_BASE_URL,          // https://nfcista.vercel.app
  "http://localhost:3000",   // local development
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.SITE_URL,
].filter(Boolean);

/**
 * POST /api/customer/password
 *
 * Wave 3: Server-side password change for authenticated customers.
 *
 * Security design:
 * - Identity is established exclusively through the HttpOnly sb-customer-token cookie
 *   via authenticateCustomer(request). The browser never sends a user ID.
 * - Password update is performed with the service-role client scoped to user.id
 *   obtained from the cookie-based auth result — never from the request body.
 * - CSRF protection: Origin header must match an allowed origin.
 * - No password, token, or sensitive value is ever logged.
 */
export async function POST(request) {
  // ── CSRF: Origin check ──────────────────────────────────────────
  const origin = request.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { error: "Forbidden: invalid request origin." },
      { status: 403 }
    );
  }

  // ── Auth: verify customer via HttpOnly cookie ───────────────────
  const { errorResponse, user } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  // ── Parse body (password only — identity comes from cookie) ─────
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { newPassword } = body || {};
  if (
    !newPassword ||
    typeof newPassword !== "string" ||
    newPassword.length < 6
  ) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters long." },
      { status: 400 }
    );
  }

  // ── Service-role password update ────────────────────────────────
  // Identity is sourced exclusively from the validated cookie session (user.id).
  // The service-role client is constructed per-request and never persisted.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (error) {
    // Do NOT include error.message — may contain internal Supabase detail.
    return NextResponse.json(
      { error: "Failed to update password. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
