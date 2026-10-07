import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateCustomer } from "@/lib/customerAuth";
import { revalidateCustomerProfile } from "@/lib/revalidateProfile";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUCKET = "gallery-images";

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

/**
 * DELETE /api/customer/gallery/image?itemId=...&imageId=...
 * Deletes an individual image belonging to a customer's gallery item.
 */
export async function DELETE(request) {
  const { errorResponse, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  const imageId = searchParams.get("imageId");

  if (!isValidUuid(itemId) || !isValidUuid(imageId)) {
    return NextResponse.json({ error: "Invalid parameters." }, { status: 400 });
  }

  try {
    // 1. Verify item belongs to customer
    const { data: item, error: itemErr } = await authClient
      .from("gallery_items")
      .select("id, customer_id")
      .eq("id", itemId)
      .eq("customer_id", customer.id)
      .maybeSingle();

    if (itemErr || !item) {
      return NextResponse.json({ error: "Item not found or access denied." }, { status: 403 });
    }

    // 2. Fetch image to verify it belongs to item
    const { data: img, error: imgErr } = await authClient
      .from("gallery_item_images")
      .select("id, gallery_item_id, image_url")
      .eq("id", imageId)
      .eq("gallery_item_id", itemId)
      .maybeSingle();

    if (imgErr || !img) {
      return NextResponse.json({ error: "Image not found for this item." }, { status: 404 });
    }

    // 3. Delete database row
    const { error: delErr } = await authClient
      .from("gallery_item_images")
      .delete()
      .eq("id", imageId)
      .eq("gallery_item_id", itemId);

    if (delErr) {
      console.error("[customer/gallery/image] Error deleting image:", delErr.message);
      return NextResponse.json({ error: "Failed to delete image." }, { status: 500 });
    }

    // 4. Clean up storage file if in bucket
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (serviceRoleKey && img.image_url) {
      const marker = `/${BUCKET}/`;
      const idx = img.image_url.indexOf(marker);
      if (idx !== -1) {
        const filePath = img.image_url.substring(idx + marker.length);
        if (filePath) {
          const serviceClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceRoleKey,
            { auth: { persistSession: false, autoRefreshToken: false } }
          );
          serviceClient.storage.from(BUCKET).remove([filePath]).catch((e) => {
            console.warn("[customer/gallery/image] Storage cleanup notice:", e?.message);
          });
        }
      }
    }

    // Revalidate public profile cache
    if (customer.profile_slug) {
      revalidateCustomerProfile(customer.profile_slug);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[customer/gallery/image] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
