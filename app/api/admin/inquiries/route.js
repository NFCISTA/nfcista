import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Builds a service-role Supabase client when credentials are present.
 * Server-side only — never exposed to the browser.
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
 * Helper to identify if an error indicates that the table does not exist.
 * Catches PostgreSQL 42P01 and PostgREST PGRST205 (missing table in schema cache).
 */
function isTableMissingError(error) {
  if (!error) return false;
  const code = String(error.code || "").toUpperCase();
  const msg = String(error.message || "").toLowerCase();

  return (
    code === "PGRST205" ||
    code === "42P01" ||
    msg.includes("schema cache") ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table")
  );
}

/**
 * GET /api/admin/inquiries
 * Retrieves company_inquiries ordered newest-first.
 * Protected by authenticateAdmin.
 */
export async function GET(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  const client = getServiceRoleClient() || authClient;
  if (!client) {
    return NextResponse.json(
      { error: "Server configuration error: Database client unavailable." },
      { status: 503 }
    );
  }

  const { data, error } = await client
    .from("company_inquiries")
    .select("id, created_at, name, shop_name, phone, product_interest, message, status, source")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    if (isTableMissingError(error)) {
      return NextResponse.json(
        {
          inquiries: [],
          migration_pending: true,
          table_name: "company_inquiries",
          note: "The company_inquiries table has not been created in Supabase yet. Apply the SQL migration to enable this feature.",
        },
        { status: 200 }
      );
    }

    console.error("[admin-inquiries] Query error:", error.message || error);
    return NextResponse.json(
      { error: "Failed to retrieve inquiries. Please check database permissions or try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    inquiries: data || [],
    migration_pending: false,
  });
}

/**
 * PATCH /api/admin/inquiries
 * Updates the status of an inquiry ('new' | 'contacted' | 'closed').
 * Protected by authenticateAdmin.
 */
export async function PATCH(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
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

  const client = getServiceRoleClient() || authClient;
  if (!client) {
    return NextResponse.json({ error: "Database client unavailable." }, { status: 503 });
  }

  const { error } = await client
    .from("company_inquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    if (isTableMissingError(error)) {
      return NextResponse.json(
        {
          error: "The company_inquiries table does not exist. Please apply the migration first.",
          migration_pending: true,
        },
        { status: 503 }
      );
    }

    console.error("[admin-inquiries-patch] Error:", error.message || error);
    return NextResponse.json({ error: "Failed to update inquiry status." }, { status: 500 });
  }

  return NextResponse.json({ success: true, id, status });
}
