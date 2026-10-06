import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/customers/create-login
 *
 * Creates a Supabase Auth user for an existing customer and links them via
 * public.customers.auth_user_id. Uses the Supabase Admin API (service role)
 * exclusively server-side — the service role key is NEVER exposed to the client.
 *
 * Security:
 * - Requires authenticated NFCISTA admin session (authenticateAdmin checks cookie +
 *   Supabase token validity + public.is_admin() RPC).
 * - Service role client is created server-side only, scoped to this request.
 * - Returns only safe, non-sensitive information (auth_user_id, email, status).
 * - Never logs or returns secrets; service-role key is never exposed.
 * - Idempotent: safe to call again if customer already has an auth_user_id.
 *
 * Body: { customer_id: string, email: string, password?: string }
 *
 * Response (200 OK):
 *   { success: true, auth_user_id: string, email: string, status: "created"|"already_linked" }
 */
export async function POST(request) {
  try {
    // ── 1. Authenticate the caller as an NFCISTA admin ──────────────────────────
    const { errorResponse, user: adminUser } = await authenticateAdmin(request);
    if (errorResponse) return errorResponse;

    // ── 2. Validate service role key availability ────────────────────────────────
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey || !serviceRoleKey.trim()) {
      console.error("[create-login] SUPABASE_SERVICE_ROLE_KEY is not configured.");
      return NextResponse.json(
        { error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing or not configured for this environment." },
        { status: 500 }
      );
    }

    // ── 3. Parse and validate request body ──────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { customer_id, email, password } = body || {};

    if (!customer_id || typeof customer_id !== "string" || !customer_id.trim()) {
      return NextResponse.json({ error: "customer_id is required." }, { status: 400 });
    }

    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length < 5) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const cleanPassword = typeof password === "string" && password.trim().length >= 6 ? password.trim() : null;

    // ── 4. Build service-role admin client (server-side only) ────────────────────
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey.trim(),
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // ── 5. Fetch the target customer row (using service role for reliable read) ──
    const { data: customer, error: fetchErr } = await serviceClient
      .from("customers")
      .select("id, full_name, profile_slug, auth_user_id")
      .eq("id", customer_id.trim())
      .maybeSingle();

    if (fetchErr) {
      console.error("[create-login] Failed to fetch customer:", fetchErr.message);
      return NextResponse.json(
        { error: "Failed to look up customer record: " + fetchErr.message },
        { status: 500 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    // ── 6. Idempotency: customer already has a login ─────────────────────────────
    if (customer.auth_user_id) {
      // Fetch email from auth.users for display — service role can do this
      const { data: existingUser } = await serviceClient.auth.admin.getUserById(
        customer.auth_user_id
      );

      return NextResponse.json({
        success: true,
        status: "already_linked",
        auth_user_id: customer.auth_user_id,
        email: existingUser?.user?.email || null,
        message: `This customer already has a portal login linked (${existingUser?.user?.email || "active"}).`,
      });
    }

    // ── 7. Create the Supabase Auth user via Admin API ───────────────────────────
    const userPayload = {
      email: cleanEmail,
      email_confirm: true,
      user_metadata: {
        customer_id: customer.id,
        full_name: customer.full_name,
        role: "customer",
      },
    };

    if (cleanPassword) {
      userPayload.password = cleanPassword;
    }

    const { data: newUser, error: createErr } = await serviceClient.auth.admin.createUser(userPayload);

    if (createErr) {
      const msg = createErr.message?.toLowerCase() || "";
      if (
        msg.includes("already registered") ||
        msg.includes("already been registered") ||
        msg.includes("user already exists") ||
        msg.includes("duplicate") ||
        createErr.status === 422
      ) {
        return NextResponse.json(
          {
            error: `An Auth account with email "${cleanEmail}" already exists in Supabase. It may be linked to another customer or was previously created. Please use a different email address, or contact support to reassign the existing account.`,
          },
          { status: 409 }
        );
      }

      console.error("[create-login] Failed to create Auth user:", createErr.message);
      return NextResponse.json(
        { error: "Failed to create customer login account: " + createErr.message },
        { status: 500 }
      );
    }

    const authUserId = newUser?.user?.id;
    if (!authUserId) {
      console.error("[create-login] Auth user created but no ID returned.");
      return NextResponse.json(
        { error: "Auth user creation returned an unexpected response." },
        { status: 500 }
      );
    }

    // ── 8. Link the new Auth user to the customer row ────────────────────────────
    const { error: linkErr } = await serviceClient
      .from("customers")
      .update({ auth_user_id: authUserId })
      .eq("id", customer.id);

    if (linkErr) {
      // Attempt cleanup: delete the newly created Auth user to avoid orphaned accounts
      try {
        await serviceClient.auth.admin.deleteUser(authUserId);
      } catch (cleanupErr) {
        console.error(
          "[create-login] CRITICAL: Auth user created but link failed AND cleanup failed.",
          "auth_user_id:", authUserId,
          "customer_id:", customer.id,
          "cleanup error:", cleanupErr?.message
        );
      }

      console.error("[create-login] Failed to link auth_user_id to customer:", linkErr.message);
      return NextResponse.json(
        { error: "Failed to link login to customer record: " + linkErr.message },
        { status: 500 }
      );
    }

    // ── 9. Password setup link (only if no temporary password was set) ───────────
    let actionLink = null;
    if (!cleanPassword) {
      try {
        const { data: linkData, error: resetErr } = await serviceClient.auth.admin.generateLink({
          type: "recovery",
          email: cleanEmail,
        });
        if (!resetErr && linkData?.properties?.action_link) {
          actionLink = linkData.properties.action_link;
        } else if (resetErr) {
          console.warn("[create-login] Password reset link could not be generated:", resetErr.message);
        }
      } catch (resetEx) {
        console.warn("[create-login] Exception generating password reset link:", resetEx?.message);
      }
    }

    // ── 10. Return safe response ──────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      status: "created",
      auth_user_id: authUserId,
      email: cleanEmail,
      action_link: actionLink,
      has_temporary_password: Boolean(cleanPassword),
      message: cleanPassword
        ? `Portal login created for ${cleanEmail}. The customer can now log in at /login.`
        : actionLink
        ? `Portal login created for ${cleanEmail}. A setup link has been generated.`
        : `Portal login created for ${cleanEmail}.`,
    });
  } catch (fatalErr) {
    console.error("[create-login] Uncaught exception in route handler:", fatalErr);
    return NextResponse.json(
      { error: "Server error during customer login creation: " + (fatalErr?.message || "Internal error") },
      { status: 500 }
    );
  }
}
