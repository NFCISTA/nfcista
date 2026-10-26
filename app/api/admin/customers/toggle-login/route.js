import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/customers/toggle-login
 *
 * Enables or disables a customer's Supabase Auth account login.
 *
 * IMPORTANT: This action only affects the customer's ability to AUTHENTICATE.
 * It does NOT change:
 *   - customers.is_active (public profile visibility)
 *   - customers.profile_slug
 *   - Any public routes (/p/[slug], /review/[slug], /r/[cardCode])
 *   - Gallery / portfolio data
 *   - Any customer profile content
 *
 * Implementation:
 *   - disable: sets ban_duration to a very large value ("876600h" ≈ 100 years)
 *   - enable:  sets ban_duration to "none" (removes the ban)
 *
 * Security:
 * - Requires authenticated NFCISTA admin session.
 * - Service role key is used server-side only; never exposed to the client.
 * - Validates that action is strictly "disable" or "enable".
 * - Does not delete auth accounts or customer data.
 *
 * Body: { customer_id: string, action: "disable" | "enable" }
 *
 * Response (200 OK):
 *   {
 *     success: true,
 *     action: "disable" | "enable",
 *     auth_user_id: string,
 *     email: string,
 *     is_banned: boolean,
 *     message: string
 *   }
 */
export async function POST(request) {
  try {
    // ── 1. Authenticate the caller as an NFCISTA admin ────────────────────────
    const { errorResponse } = await authenticateAdmin(request);
    if (errorResponse) return errorResponse;

    // ── 2. Validate service role key availability ──────────────────────────────
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey?.trim()) {
      console.error("[toggle-login] SUPABASE_SERVICE_ROLE_KEY is not configured.");
      return NextResponse.json(
        { error: "Server configuration error: service role key missing." },
        { status: 500 }
      );
    }

    // ── 3. Parse and validate request body ────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const customer_id = (body?.customer_id || "").trim();
    const action = (body?.action || "").trim().toLowerCase();

    if (!customer_id) {
      return NextResponse.json(
        { error: "customer_id is required." },
        { status: 400 }
      );
    }

    if (action !== "disable" && action !== "enable") {
      return NextResponse.json(
        { error: 'action must be either "disable" or "enable".' },
        { status: 400 }
      );
    }

    // ── 4. Build service-role admin client (server-side only) ─────────────────
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey.trim(),
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // ── 5. Fetch customer to get auth_user_id ─────────────────────────────────
    // Explicitly select ONLY what we need — do NOT touch is_active, profile_slug,
    // or any profile content fields.
    const { data: customer, error: fetchErr } = await serviceClient
      .from("customers")
      .select("id, auth_user_id")
      .eq("id", customer_id)
      .maybeSingle();

    if (fetchErr) {
      console.error("[toggle-login] Failed to fetch customer:", fetchErr.message);
      return NextResponse.json(
        { error: "Failed to look up customer: " + fetchErr.message },
        { status: 500 }
      );
    }

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    if (!customer.auth_user_id) {
      return NextResponse.json(
        { error: "This customer does not have a portal login account yet." },
        { status: 400 }
      );
    }

    // ── 6. Fetch current auth user details ────────────────────────────────────
    const { data: authData, error: authErr } = await serviceClient.auth.admin.getUserById(
      customer.auth_user_id
    );

    if (authErr || !authData?.user) {
      console.error("[toggle-login] Failed to fetch auth user:", authErr?.message);
      return NextResponse.json(
        { error: "Failed to look up linked auth account." },
        { status: 500 }
      );
    }

    const email = authData.user.email;

    // ── 7. Apply the enable / disable action ─────────────────────────────────
    // SAFETY GUARANTEE: updateUserById is called with ONLY the ban_duration
    // field. It does NOT touch any profile field in public.customers.
    const ban_duration = action === "disable" ? "876600h" : "none";

    const { data: updatedUser, error: updateErr } = await serviceClient.auth.admin.updateUserById(
      customer.auth_user_id,
      { ban_duration }
    );

    if (updateErr) {
      console.error(`[toggle-login] Failed to ${action} auth user:`, updateErr.message);
      return NextResponse.json(
        { error: `Failed to ${action} login: ` + updateErr.message },
        { status: 500 }
      );
    }

    // Derive new ban state from the updated user object
    const newBannedUntil = updatedUser?.user?.banned_until ?? null;
    const is_banned = Boolean(newBannedUntil && new Date(newBannedUntil) > new Date());

    return NextResponse.json({
      success: true,
      action,
      auth_user_id: customer.auth_user_id,
      email: email ?? null,
      is_banned,
      message:
        action === "disable"
          ? `Login disabled for ${email ?? "this customer"}. Their public digital profile remains unchanged.`
          : `Login enabled for ${email ?? "this customer"}. They can now sign in at /login.`,
    });
  } catch (fatalErr) {
    console.error("[toggle-login] Uncaught exception:", fatalErr);
    return NextResponse.json(
      { error: "Server error: " + (fatalErr?.message || "Internal error") },
      { status: 500 }
    );
  }
}
