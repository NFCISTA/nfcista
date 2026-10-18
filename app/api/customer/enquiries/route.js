import { NextResponse } from "next/server";
import { authenticateCustomer } from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/customer/enquiries
 * Returns paginated enquiries for the currently authenticated customer.
 *
 * Query params:
 * - page (number, default: 1)
 * - limit (number, default: 20, max: 50)
 * - filter ("all" | "unread", default: "all")
 */
export async function GET(request) {
  const { errorResponse, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const filter = (searchParams.get("filter") || "all").toLowerCase().trim();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Base query scoped strictly to customer.id through RLS authClient
    let query = authClient
      .from("customer_enquiries")
      .select("id, visitor_name, visitor_phone, visitor_email, message, is_read, created_at, delivery_dashboard, delivery_email, delivery_whatsapp", { count: "exact" })
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (filter === "unread") {
      query = query.eq("is_read", false);
    }

    const { data: enquiries, count, error } = await query;

    if (error) {
      console.error("[customer/enquiries] Error fetching enquiries:", error.message);
      return NextResponse.json({ error: "Failed to fetch enquiries." }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount, error: countErr } = await authClient
      .from("customer_enquiries")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customer.id)
      .eq("is_read", false);

    if (countErr) {
      console.warn("[customer/enquiries] Error fetching unread count:", countErr.message);
    }

    return NextResponse.json({
      success: true,
      enquiries: enquiries || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
      unread_count: unreadCount || 0,
      delivery_settings: {
        enquiry_enabled: customer.enquiry_enabled,
        enquiry_delivery_dashboard: customer.enquiry_delivery_dashboard,
        enquiry_delivery_email: customer.enquiry_delivery_email,
        enquiry_delivery_whatsapp: customer.enquiry_delivery_whatsapp,
      },
    });
  } catch (err) {
    console.error("[customer/enquiries] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
