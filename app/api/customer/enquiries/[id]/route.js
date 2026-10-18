import { NextResponse } from "next/server";
import { authenticateCustomer } from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * PATCH /api/customer/enquiries/[id]
 * Updates enquiry status (only is_read is modifiable by customer).
 */
export async function PATCH(request, context) {
  const { errorResponse, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await context.params;

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid enquiry ID format." }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
    }

    // Only allow updating is_read
    if (body.is_read === undefined || typeof body.is_read !== "boolean") {
      return NextResponse.json(
        { error: "is_read (boolean) is required in update payload." },
        { status: 400 }
      );
    }

    // Reject any unauthorized field manipulation attempts
    const disallowed = [
      "id",
      "customer_id",
      "visitor_name",
      "visitor_phone",
      "visitor_email",
      "message",
      "delivery_dashboard",
      "delivery_email",
      "delivery_whatsapp",
      "ip_hash",
      "user_agent",
      "created_at",
    ];

    for (const key of disallowed) {
      if (body[key] !== undefined) {
        return NextResponse.json(
          { error: `Field '${key}' cannot be modified.` },
          { status: 400 }
        );
      }
    }

    // Execute update strictly scoped to customer_id = customer.id
    const { data: updated, error } = await authClient
      .from("customer_enquiries")
      .update({
        is_read: body.is_read,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("customer_id", customer.id)
      .select("id, is_read, updated_at")
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: "Enquiry not found or update not permitted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      enquiry: updated,
    });
  } catch (err) {
    console.error("[customer/enquiries/[id]] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
