import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateCustomer } from "@/lib/customerAuth";
import { revalidateCustomerProfile } from "@/lib/revalidateProfile";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const BUCKET = "gallery-images";

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

/**
 * POST /api/customer/gallery/upload
 * Accepts FormData with 'file' and 'galleryItemId'.
 * Safely uploads image to gallery-images bucket and creates record in gallery_item_images.
 */
export async function POST(request) {
  const { errorResponse, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const galleryItemId = formData.get("galleryItemId");

    // 1. Validate gallery item ID
    if (!isValidUuid(galleryItemId)) {
      return NextResponse.json({ error: "Invalid gallery item ID." }, { status: 400 });
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
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // 4. Verify item exists and belongs to this customer
    const { data: item, error: itemErr } = await authClient
      .from("gallery_items")
      .select("id, customer_id")
      .eq("id", galleryItemId)
      .eq("customer_id", customer.id)
      .maybeSingle();

    if (itemErr || !item) {
      return NextResponse.json({ error: "Item not found or access denied." }, { status: 404 });
    }

    // 5. Construct safe storage path
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const fileName = `${Date.now()}-${randomSuffix}.${ext}`;
    const storagePath = `gallery/${customer.id}/${galleryItemId}/${fileName}`;

    // 6. Convert file to buffer and upload via service-role client (server-side only)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!serviceRoleKey) {
      console.error("[customer/gallery/upload] SUPABASE_SERVICE_ROLE_KEY is not configured.");
      return NextResponse.json(
        { error: "Storage service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { error: uploadErr } = await serviceClient.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadErr) {
      console.error("[customer/gallery/upload] Storage upload error:", uploadErr.message);
      return NextResponse.json({ error: "Failed to upload image to storage: " + uploadErr.message }, { status: 500 });
    }

    // 7. Get public URL
    const { data: publicUrlData } = serviceClient.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json({ error: "Could not generate public URL for uploaded image." }, { status: 500 });
    }

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
      console.error("[customer/gallery/upload] Error creating image record:", insertImgErr.message);
      // Rollback storage file
      serviceClient.storage.from(BUCKET).remove([storagePath]).catch(() => {});
      return NextResponse.json({ error: "Failed to save image record in database." }, { status: 500 });
    }

    // Revalidate public profile cache
    if (customer.profile_slug) {
      revalidateCustomerProfile(customer.profile_slug);
    }

    return NextResponse.json({ image: newImage }, { status: 201 });
  } catch (err) {
    console.error("[customer/gallery/upload] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred during image upload." }, { status: 500 });
  }
}
