import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";
import { revalidateCustomerById } from "@/lib/revalidateProfile";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

/**
 * DELETE /api/admin/gallery/image?customerId=...&itemId=...&imageId=...
 * Deletes an individual image belonging to a gallery item.
 */
export async function DELETE(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const itemId = searchParams.get("itemId");
  const imageId = searchParams.get("imageId");

  if (!isValidUuid(customerId) || !isValidUuid(itemId) || !isValidUuid(imageId)) {
    return NextResponse.json({ error: "Invalid parameters." }, { status: 400 });
  }

  try {
    // 1. Verify item belongs to customer
    const { data: item, error: itemErr } = await authClient
      .from("gallery_items")
      .select("id, customer_id")
      .eq("id", itemId)
      .maybeSingle();

    if (itemErr || !item || item.customer_id !== customerId) {
      return NextResponse.json({ error: "Item not found or access denied." }, { status: 403 });
    }

    // 2. Fetch image to verify it belongs to item
    const { data: img, error: imgErr } = await authClient
      .from("gallery_item_images")
      .select("id, gallery_item_id, image_url")
      .eq("id", imageId)
      .maybeSingle();

    if (imgErr || !img || img.gallery_item_id !== itemId) {
      return NextResponse.json({ error: "Image not found for this item." }, { status: 404 });
    }

    // 3. Delete database row
    const { error: delErr } = await authClient
      .from("gallery_item_images")
      .delete()
      .eq("id", imageId);

    if (delErr) {
      console.error("Error deleting image row:", delErr.message);
      return NextResponse.json({ error: "Failed to delete image." }, { status: 500 });
    }

    // 4. Clean up storage file if it's in our bucket
    if (img.image_url) {
      const marker = "/gallery-images/";
      const idx = img.image_url.indexOf(marker);
      if (idx !== -1) {
        const filePath = img.image_url.substring(idx + marker.length);
        if (filePath) {
          authClient.storage.from("gallery-images").remove([filePath]).catch(() => {});
        }
      }
    }

    // Invalidate public profile cache on-demand after image deletion
    await revalidateCustomerById(customerId, authClient);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in DELETE /api/admin/gallery/image:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * POST /api/admin/gallery/image
 * Body: { customerId: string, itemId: string, imageIds: string[] }
 * Reorders images within an item by setting display_order to their array index.
 */
export async function POST(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const { customerId, itemId, imageIds } = await request.json();

    if (!isValidUuid(customerId) || !isValidUuid(itemId)) {
      return NextResponse.json({ error: "Invalid customer or item ID." }, { status: 400 });
    }

    if (!Array.isArray(imageIds) || imageIds.length === 0 || !imageIds.every(isValidUuid)) {
      return NextResponse.json({ error: "imageIds must be an array of UUIDs." }, { status: 400 });
    }

    // Verify item belongs to customer
    const { data: item, error: itemErr } = await authClient
      .from("gallery_items")
      .select("id, customer_id")
      .eq("id", itemId)
      .maybeSingle();

    if (itemErr || !item || item.customer_id !== customerId) {
      return NextResponse.json({ error: "Item not found or access denied." }, { status: 403 });
    }

    // Verify images belong to this item
    const { data: imgs, error: imgsErr } = await authClient
      .from("gallery_item_images")
      .select("id, gallery_item_id")
      .in("id", imageIds);

    if (imgsErr || !imgs) {
      return NextResponse.json({ error: "Failed to verify images." }, { status: 500 });
    }

    const validIds = new Set(imgs.filter((img) => img.gallery_item_id === itemId).map((img) => img.id));
    if (validIds.size !== imageIds.length) {
      return NextResponse.json({ error: "One or more images do not belong to this item." }, { status: 403 });
    }

    // Update display_order for each image
    const updates = imageIds.map((id, index) =>
      authClient
        .from("gallery_item_images")
        .update({ display_order: index })
        .eq("id", id)
    );

    await Promise.all(updates);

    // Invalidate public profile cache on-demand after image reordering
    await revalidateCustomerById(customerId, authClient);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in POST /api/admin/gallery/image:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
