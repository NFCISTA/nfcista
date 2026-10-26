import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/customers/login-status?customer_id=<uuid>
 *
 * Returns the Supabase Auth state of a customer's linked account.
 * Used by the admin Login Modal to show accurate status and enable
 * resend / reset / disable actions.
 *
 * Security:
 * - Requires authenticated NFCISTA admin session (authenticateAdmin checks
 *   cookie + Supabase token validity + public.is_admin() RPC).
 * - Service role client is created server-side only, scoped to this request.
 * - Returns only safe, non-sensitive fields. Never returns passwords,
 *   raw JWTs, session tokens, or the service-role key.
 *
 * Response (200 OK):
 *   {
 *     auth_user_id: string,
 *     email: string | null,
 *     email_confirmed_at: string | null,
 *     last_sign_in_at: string | null,
 *     is_banned: boolean,
 *     banned_until: string | null,
 *     setup_complete: boolean,
 *     login_status: "active" | "disabled" | "setup_pending"
 *   }
 */
export async function GET(request) {
  try {
    // ── 1. Authenticate the caller as an NFCISTA admin ────────────────────────
    const { errorResponse } = await authenticateAdmin(request);
    if (errorResponse) return errorResponse;

    // ── 2. Validate service role key availability ──────────────────────────────
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey?.trim()) {
      console.error("[login-status] SUPABASE_SERVICE_ROLE_KEY is not configured.");
      return NextResponse.json(
        { error: "Server configuration error: service role key missing." },
        { status: 500 }
      );
    }

    // ── 3. Parse and validate query params ────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get("customer_id")?.trim();

    if (!customer_id) {
      return NextResponse.json(
        { error: "customer_id query parameter is required." },
        { status: 400 }
      );
    }

    // ── 4. Build service-role admin client (server-side only) ─────────────────
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey.trim(),
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // ── 5. Fetch the customer row to get auth_user_id ─────────────────────────
    const { data: customer, error: fetchErr } = await serviceClient
      .from("customers")
      .select("id, auth_user_id")
      .eq("id", customer_id)
      .maybeSingle();

    if (fetchErr) {
      console.error("[login-status] Failed to fetch customer:", fetchErr.message);
      return NextResponse.json(
        { error: "Failed to look up customer record: " + fetchErr.message },
        { status: 500 }
      );
    }

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    if (!customer.auth_user_id) {
      return NextResponse.json(
        { error: "This customer has no linked login account.", has_login: false },
        { status: 404 }
      );
    }

    // ── 6. Fetch auth user details via admin API ───────────────────────────────
    const { data: authData, error: authErr } = await serviceClient.auth.admin.getUserById(
      customer.auth_user_id
    );

    if (authErr || !authData?.user) {
      console.error("[login-status] Failed to fetch auth user:", authErr?.message);
      return NextResponse.json(
        { error: "Failed to fetch auth account details: " + (authErr?.message || "Not found") },
        { status: 500 }
      );
    }

    const u = authData.user;

    // banned_until is set when the account has been banned
    const banned_until = u.banned_until ?? null;
    const is_banned = Boolean(
      banned_until && new Date(banned_until) > new Date()
    );

    // email_confirmed_at and last_sign_in_at determine setup state
    const email_confirmed_at = u.email_confirmed_at ?? null;
    const last_sign_in_at = u.last_sign_in_at ?? null;

    // setup_complete: customer has confirmed email AND signed in at least once
    const setup_complete = Boolean(email_confirmed_at && last_sign_in_at);

    // Derive a single human-readable status
    let login_status;
    if (is_banned) {
      login_status = "disabled";
    } else if (!setup_complete) {
      login_status = "setup_pending";
    } else {
      login_status = "active";
    }

    return NextResponse.json({
      has_login: true,
      auth_user_id: u.id,
      email: u.email ?? null,
      email_confirmed_at,
      last_sign_in_at,
      is_banned,
      banned_until,
      setup_complete,
      login_status, // "active" | "disabled" | "setup_pending"
    });
  } catch (fatalErr) {
    console.error("[login-status] Uncaught exception:", fatalErr);
    return NextResponse.json(
      { error: "Server error: " + (fatalErr?.message || "Internal error") },
      { status: 500 }
    );
  }
}
