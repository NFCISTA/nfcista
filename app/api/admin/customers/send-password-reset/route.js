import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateAdmin } from "@/lib/adminAuth";
import { getAuthRedirectUrl } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/customers/send-password-reset
 *
 * Generates a password reset link for an existing customer auth account.
 * The admin uses this when a customer is locked out or needs to update their
 * credentials. The link is returned to the admin for manual sharing (WhatsApp,
 * email, etc.). No email is sent automatically by this route.
 *
 * Security:
 * - Requires authenticated NFCISTA admin session.
 * - Service role key is used server-side only; never exposed to the client.
 * - The generated recovery link is returned ONLY in the response body to the
 *   authenticated admin. It is NEVER logged, stored, or persisted.
 * - Links are single-use and TTL-controlled by Supabase Auth.
 *
 * Body: { customer_id: string }
 *
 * Response (200 OK):
 *   { success: true, action_link: string, email: string, message: string }
 */
export async function POST(request) {
  try {
    // ── 1. Authenticate the caller as an NFCISTA admin ────────────────────────
    const { errorResponse } = await authenticateAdmin(request);
    if (errorResponse) return errorResponse;

    // ── 2. Validate service role key availability ──────────────────────────────
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey?.trim()) {
      console.error("[send-password-reset] SUPABASE_SERVICE_ROLE_KEY is not configured.");
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
    if (!customer_id) {
      return NextResponse.json(
        { error: "customer_id is required." },
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
    const { data: customer, error: fetchErr } = await serviceClient
      .from("customers")
      .select("id, auth_user_id")
      .eq("id", customer_id)
      .maybeSingle();

    if (fetchErr) {
      console.error("[send-password-reset] Failed to fetch customer:", fetchErr.message);
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
        { error: "This customer does not have a portal login account yet. Use Create Login first." },
        { status: 400 }
      );
    }

    // ── 6. Fetch the linked auth user to get email ────────────────────────────
    const { data: authData, error: authErr } = await serviceClient.auth.admin.getUserById(
      customer.auth_user_id
    );

    if (authErr || !authData?.user?.email) {
      console.error("[send-password-reset] Failed to fetch auth user:", authErr?.message);
      return NextResponse.json(
        { error: "Failed to look up linked auth account." },
        { status: 500 }
      );
    }

    const email = authData.user.email;

    // ── 7. Check if account is banned — warn admin but still allow reset ──────
    const banned_until = authData.user.banned_until;
    const is_banned = Boolean(banned_until && new Date(banned_until) > new Date());

    // ── 8. Generate a password reset link ────────────────────────────────────
    // Uses "recovery" type — produces a link the customer uses to set a new
    // password. Supabase will direct the user to the recovery flow.
    // SECURITY: The action_link is returned only to the admin response.
    //           It is never logged here.
    const redirectTo = getAuthRedirectUrl(request, "/reset-password");

    const { data: linkData, error: linkErr } = await serviceClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo,
      },
    });

    if (linkErr || !linkData?.properties?.action_link) {
      console.error("[send-password-reset] Failed to generate reset link:", linkErr?.message);
      return NextResponse.json(
        { error: "Failed to generate password reset link: " + (linkErr?.message || "Unknown error") },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action_link: linkData.properties.action_link,
      email,
      was_banned: is_banned,
      message: is_banned
        ? `Password reset link generated for ${email}. Note: this account is currently disabled. Share the link with the customer — it is single-use and expires per your Supabase token TTL.`
        : `Password reset link generated for ${email}. Share this link directly with the customer — it is single-use and expires per your Supabase token TTL.`,
    });
  } catch (fatalErr) {
    console.error("[send-password-reset] Uncaught exception:", fatalErr);
    return NextResponse.json(
      { error: "Server error: " + (fatalErr?.message || "Internal error") },
      { status: 500 }
    );
  }
}
