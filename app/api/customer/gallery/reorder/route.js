import { NextResponse } from "next/server";
import { authenticateCustomer } from "@/lib/customerAuth";
import { revalidateCustomerProfile } from "@/lib/revalidateProfile";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

/**
 * POST /api/customer/gallery/reorder
 * Body: { itemIds: string[] }
 * Updates display_order for all specified gallery items belonging to the customer.
 */
export async function POST(request) {
  const { errorResponse, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    const { itemIds } = await request.json();

    if (!Array.isArray(itemIds) || itemIds.length === 0 || !itemIds.every(isValidUuid)) {
      return NextResponse.json({ error: "itemIds must be a non-empty array of valid UUIDs." }, { status: 400 });
    }

    // Verify all item IDs belong to this customer
    const { data: existing, error: fetchErr } = await authClient
      .from("gallery_items")
      .select("id, customer_id")
      .in("id", itemIds)
      .eq("customer_id", customer.id);

    if (fetchErr) {
      console.error("[customer/gallery/reorder] Error verifying items:", fetchErr.message);
      return NextResponse.json({ error: "Failed to verify items." }, { status: 500 });
    }

    const validIds = new Set((existing || []).map((i) => i.id));
    if (validIds.size !== itemIds.length) {
      return NextResponse.json({ error: "One or more items do not belong to you." }, { status: 403 });
    }

    // Update display_order for each item
    const updates = itemIds.map((id, index) =>
      authClient
        .from("gallery_items")
        .update({ display_order: index })
        .eq("id", id)
        .eq("customer_id", customer.id)
    );

    await Promise.all(updates);

    // Revalidate public profile cache
    if (customer.profile_slug) {
      revalidateCustomerProfile(customer.profile_slug);
    }

    return NextResponse.json({ success: true, count: itemIds.length });
  } catch (err) {
    console.error("[customer/gallery/reorder] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
