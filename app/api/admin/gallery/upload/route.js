import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

/**
 * POST /api/admin/gallery/upload
 * Accepts FormData with 'file', 'customerId', 'galleryItemId'.
 * Safely uploads image to gallery-images bucket and creates record in gallery_item_images.
 */
export async function POST(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const customerId = formData.get("customerId");
    const galleryItemId = formData.get("galleryItemId");

    // 1. Validate UUIDs
    if (!isValidUuid(customerId) || !isValidUuid(galleryItemId)) {
      return NextResponse.json({ error: "Invalid customer or gallery item ID." }, { status: 400 });
    }

    // 2. Validate file existence
    if (!file || typeof file === "string" || !file.size) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // 3. Validate file size and type
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds maximum size of 5 MB." }, { status: 400 });
    }

    const mimeType = file.type?.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." }, { status: 400 });
    }

    // 4. Verify item exists and belongs to this customer
    const { data: item, error: itemErr } = await authClient
      .from("gallery_items")
      .select("id, customer_id")
      .eq("id", galleryItemId)
      .maybeSingle();

    if (itemErr || !item) {
      return NextResponse.json({ error: "Gallery item not found." }, { status: 404 });
    }

    if (item.customer_id !== customerId) {
      return NextResponse.json({ error: "Item does not belong to this customer." }, { status: 403 });
    }

    // 5. Construct safe storage path
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const fileName = `${Date.now()}-${randomSuffix}.${ext}`;
    const storagePath = `gallery/${customerId}/${galleryItemId}/${fileName}`;

    // 6. Convert file to buffer and upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadErr } = await authClient.storage
      .from("gallery-images")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr.message);
      return NextResponse.json({ error: "Failed to upload image to storage." }, { status: 500 });
    }

    // 7. Get public URL
    const { data: publicUrlData } = authClient.storage
      .from("gallery-images")
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData?.publicUrl;

    // 8. Determine next display_order for this item's images
    const { data: maxImg } = await authClient
      .from("gallery_item_images")
      .select("display_order")
      .eq("gallery_item_id", galleryItemId)
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = maxImg && maxImg.length > 0 ? (maxImg[0].display_order || 0) + 1 : 0;

    // 9. Insert record into gallery_item_images
    const { data: newImage, error: insertImgErr } = await authClient
      .from("gallery_item_images")
      .insert({
        gallery_item_id: galleryItemId,
        image_url: publicUrl,
        display_order: nextOrder,
      })
      .select()
      .single();

    if (insertImgErr) {
      console.error("Error creating gallery_item_images record:", insertImgErr.message);
      // Attempt storage rollback
      authClient.storage.from("gallery-images").remove([storagePath]).catch(() => {});
      return NextResponse.json({ error: "Failed to record image in database." }, { status: 500 });
    }

    return NextResponse.json({ image: newImage }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error in POST /api/admin/gallery/upload:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
