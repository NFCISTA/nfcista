import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";
import { revalidateCustomerById } from "@/lib/revalidateProfile";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

/**
 * POST /api/admin/gallery/reorder
 * Body: { customerId: string, itemIds: string[] }
 * Updates display_order for all specified gallery items belonging to the customer.
 */
export async function POST(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const { customerId, itemIds } = await request.json();

    if (!isValidUuid(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID." }, { status: 400 });
    }

    if (!Array.isArray(itemIds) || itemIds.length === 0 || !itemIds.every(isValidUuid)) {
      return NextResponse.json({ error: "itemIds must be a non-empty array of valid UUIDs." }, { status: 400 });
    }

    // Verify all item IDs belong to this customer
    const { data: existing, error: fetchErr } = await authClient
      .from("gallery_items")
      .select("id, customer_id")
      .in("id", itemIds);

    if (fetchErr) {
      console.error("Error verifying gallery items for reorder:", fetchErr.message);
      return NextResponse.json({ error: "Failed to verify gallery items." }, { status: 500 });
    }

    const validIds = new Set((existing || []).filter((i) => i.customer_id === customerId).map((i) => i.id));

    if (validIds.size !== itemIds.length) {
      return NextResponse.json({ error: "One or more items do not belong to this customer." }, { status: 403 });
    }

    // Update display_order for each item sequentially
    const updates = itemIds.map((id, index) =>
      authClient
        .from("gallery_items")
        .update({ display_order: index })
        .eq("id", id)
        .eq("customer_id", customerId)
    );

    await Promise.all(updates);

    // Invalidate public profile cache on-demand after successful reorder
    await revalidateCustomerById(customerId, authClient);

    return NextResponse.json({ success: true, count: itemIds.length });
  } catch (err) {
    console.error("Unexpected error in POST /api/admin/gallery/reorder:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
