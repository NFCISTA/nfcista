import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateAdmin } from "@/lib/adminAuth";
import { getAuthRedirectUrl } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Safely search for Supabase Auth users matching an email address.
 * Paginates through auth.admin.listUsers() to collect all matching users.
 *
 * @param {object} serviceClient - Supabase client initialized with service_role key
 * @param {string} email - Target email address (normalized/lowercase)
 * @returns {Promise<Array<object>>} List of matching auth user objects
 */
async function findAuthUsersByEmail(serviceClient, email) {
  const clean = String(email || "").toLowerCase().trim();
  if (!clean) return [];

  const matches = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await serviceClient.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Failed to query Auth users: ${error.message}`);
    }

    const users = data?.users || [];
    for (const u of users) {
      if (u.email && u.email.toLowerCase().trim() === clean) {
        matches.push(u);
      }
    }

    if (users.length < perPage) {
      break;
    }

    page++;
    if (page > 50) break; // Safety threshold
  }

  return matches;
}

/**
 * Safely link an existing Supabase Auth user to an existing customer record.
 * Enforces strict verification checks before modifying any record:
 *  1. Exactly one matching Auth user exists for the verified email.
 *  2. That Auth user is not already linked to another customer.
 *  3. The target customer's auth_user_id is currently NULL.
 *  4. Atomically updates only the target customer where auth_user_id IS NULL.
 *  5. NEVER modifies existing Auth user credentials, passwords, or email confirmation.
 *  6. NEVER deletes or mutates other Auth users.
 */
async function linkExistingAuthUser({
  serviceClient,
  customer,
  cleanEmail,
  cleanPassword,
}) {
  // ── Verification 1: Find matching Auth users ──────────────────────────────
  const matchingUsers = await findAuthUsersByEmail(serviceClient, cleanEmail);

  if (matchingUsers.length === 0) {
    return {
      status: 404,
      error: `No Supabase Auth account found with email "${cleanEmail}".`,
    };
  }

  if (matchingUsers.length > 1) {
    return {
      status: 409,
      error: `Multiple Auth accounts found for email "${cleanEmail}". Please resolve this ambiguity in Supabase before linking.`,
    };
  }

  const existingAuthUser = matchingUsers[0];

  // ── Verification 2: Check if Auth user is already linked elsewhere ─────────
  const { data: linkedCustomers, error: checkLinkedErr } = await serviceClient
    .from("customers")
    .select("id, full_name, profile_slug")
    .eq("auth_user_id", existingAuthUser.id);

  if (checkLinkedErr) {
    console.error("[create-login] Failed to verify existing linkage:", checkLinkedErr.message);
    return {
      status: 500,
      error: `Failed to verify customer linkage: ${checkLinkedErr.message}`,
    };
  }

  if (linkedCustomers && linkedCustomers.length > 0) {
    const linked = linkedCustomers[0];
    if (linked.id === customer.id) {
      return {
        status: 200,
        result: {
          success: true,
          status: "already_linked",
          auth_user_id: existingAuthUser.id,
          email: cleanEmail,
          message: `This customer already has a portal login linked (${cleanEmail}).`,
        },
      };
    }

    return {
      status: 409,
      error: `This Auth account (${cleanEmail}) is already linked to another customer: "${linked.full_name || linked.profile_slug}". Cannot link to a different customer.`,
    };
  }

  // ── Verification 3: Check target customer's auth_user_id is still NULL ────
  const { data: freshCustomer, error: recheckErr } = await serviceClient
    .from("customers")
    .select("id, auth_user_id")
    .eq("id", customer.id)
    .single();

  if (recheckErr || !freshCustomer) {
    return {
      status: 500,
      error: "Failed to reload customer record before linking.",
    };
  }

  if (freshCustomer.auth_user_id) {
    return {
      status: 409,
      error: "Target customer already has a linked login account. Existing login will not be overwritten.",
    };
  }

  // ── Execution: Atomically link the Auth user to the target customer ────────
  // .is("auth_user_id", null) guarantees we NEVER overwrite an existing link
  const { data: updatedCustomer, error: linkErr } = await serviceClient
    .from("customers")
    .update({
      auth_user_id: existingAuthUser.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customer.id)
    .is("auth_user_id", null)
    .select("id, auth_user_id")
    .single();

  if (linkErr || !updatedCustomer) {
    console.error("[create-login] Failed to link existing Auth user:", linkErr?.message);
    return {
      status: 500,
      error: "Failed to link existing login to customer record: " + (linkErr?.message || "Customer may have already been linked concurrently."),
    };
  }

  // NOTE: Existing Auth credentials, password, and confirmation status are
  // strictly PRESERVED. We do not call auth admin update user here.

  // ── Safe logging without credentials or sensitive data ────────────────────
  console.log("[create-login] Successfully linked existing Auth user to customer:", {
    customer_id: customer.id,
    auth_user_id: existingAuthUser.id,
    status: "linked_existing",
  });

  return {
    status: 200,
    result: {
      success: true,
      status: "linked_existing",
      auth_user_id: existingAuthUser.id,
      email: cleanEmail,
      has_temporary_password: false,
      existing_credentials_preserved: true,
      message: cleanPassword
        ? `Linked existing account for ${cleanEmail}. Existing credentials preserved (temporary password ignored). Customer can log in at /login with their existing password.`
        : `Linked existing account for ${cleanEmail} to customer profile. Customer can log in at /login with their existing password.`,
    },
  };
}

/**
 * POST /api/admin/customers/create-login
 *
 * Creates a Supabase Auth user for an existing customer OR safely links an
 * existing Auth user matching the customer's email.
 *
 * Security:
 * - Requires authenticated NFCISTA admin session (authenticateAdmin).
 * - Service role client is created server-side only.
 * - Idempotent: safe if customer already has an auth_user_id.
 * - Safe linking: verifies single Auth user, unlinked status, and NULL target.
 * - Never overwrites an existing customer's auth_user_id.
 * - Never deletes an existing Auth user.
 * - Never modifies existing Auth credentials during account linking.
 *
 * Body: { customer_id: string, email: string, password?: string, action?: string }
 */
export async function POST(request) {
  try {
    // ── 1. Authenticate the caller as an NFCISTA admin ──────────────────────────
    const { errorResponse } = await authenticateAdmin(request);
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

    const { customer_id, email, password, action } = body || {};

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

    // ── 5. Fetch the target customer row ─────────────────────────────────────────
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

    // ── 7. Explicit Link Request (if requested by caller) ───────────────────────
    if (action === "link_existing" || body?.link_existing === true) {
      const linkResult = await linkExistingAuthUser({
        serviceClient,
        customer,
        cleanEmail,
        cleanPassword,
      });

      if (linkResult.error) {
        return NextResponse.json({ error: linkResult.error }, { status: linkResult.status });
      }

      return NextResponse.json(linkResult.result, { status: linkResult.status });
    }

    // ── 8. Create new Auth user (default path) ───────────────────────────────────
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

    // ── 9. Handle Existing Auth User on duplicate error ──────────────────────────
    if (createErr) {
      const msg = createErr.message?.toLowerCase() || "";
      const isDuplicateUser =
        msg.includes("already registered") ||
        msg.includes("already been registered") ||
        msg.includes("user already exists") ||
        msg.includes("duplicate") ||
        msg.includes("email address is already in use") ||
        createErr.status === 422;

      if (isDuplicateUser) {
        // Attempt safe linking of the pre-existing Auth user without changing credentials
        console.log(`[create-login] Auth account already exists for ${cleanEmail}; verifying and linking without credential changes...`);
        const linkResult = await linkExistingAuthUser({
          serviceClient,
          customer,
          cleanEmail,
          cleanPassword,
        });

        if (linkResult.error) {
          return NextResponse.json({ error: linkResult.error }, { status: linkResult.status });
        }

        return NextResponse.json(linkResult.result, { status: linkResult.status });
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

    // ── 10. Link the newly created Auth user to the customer row ─────────────────
    const { error: linkErr } = await serviceClient
      .from("customers")
      .update({ auth_user_id: authUserId })
      .eq("id", customer.id)
      .is("auth_user_id", null);

    if (linkErr) {
      // Rollback newly created user only
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

    // ── 11. Password setup link (only if no temporary password was set) ──────────
    let actionLink = null;
    if (!cleanPassword) {
      try {
        const redirectTo = getAuthRedirectUrl(request, "/reset-password");
        const { data: linkData, error: resetErr } = await serviceClient.auth.admin.generateLink({
          type: "recovery",
          email: cleanEmail,
          options: {
            redirectTo,
          },
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

    // ── 12. Return safe response for newly created account ───────────────────────
    console.log("[create-login] Successfully created and linked new Auth user for customer:", {
      customer_id: customer.id,
      auth_user_id: authUserId,
      status: "created",
    });

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
