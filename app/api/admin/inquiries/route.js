import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Build a service-role Supabase client.
 * Server-side only — the service role key is never sent to the browser.
 */
function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * GET /api/admin/inquiries
 * Returns company_inquiries ordered newest-first.
 * Requires valid admin session.
 * Handles the case where the migration has not been applied yet.
 */
export async function GET(request) {
  const { errorResponse } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  const client = getServiceRoleClient();
  if (!client) {
    return NextResponse.json(
      { error: "Server configuration error: Supabase service credentials are missing." },
      { status: 503 }
    );
  }

  const { data, error } = await client
    .from("company_inquiries")
    .select("id, created_at, name, shop_name, phone, product_interest, message, status, source")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    // Table does not exist yet (migration pending)
    if (error.message?.includes("does not exist") || error.code === "42P01") {
      return NextResponse.json(
        {
          inquiries: [],
          migration_pending: true,
          note: "The company_inquiries table has not been created yet. Apply the SQL migration to enable this feature.",
        },
        { status: 200 }
      );
    }
    console.error("[admin-inquiries] Query error:", error.message);
    return NextResponse.json(
      { error: "Failed to retrieve inquiries. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ inquiries: data || [], migration_pending: false });
}

/**
 * PATCH /api/admin/inquiries
 * Update the status of a single inquiry.
 * Body: { id: string, status: "new" | "contacted" | "closed" }
 */
export async function PATCH(request) {
  const { errorResponse } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { id, status } = body || {};
  const VALID_STATUSES = ["new", "contacted", "closed"];

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Inquiry ID is required." }, { status: 400 });
  }
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Status must be one of: ${VALID_STATUSES.join(", ")}.` },
      { status: 400 }
    );
  }

  const client = getServiceRoleClient();
  if (!client) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 503 });
  }

  const { error } = await client
    .from("company_inquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[admin-inquiries-patch] Error:", error.message);
    return NextResponse.json({ error: "Failed to update inquiry status." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
