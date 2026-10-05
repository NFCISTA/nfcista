import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/admin/products/upload
 * Accepts FormData with 'file'.
 * Safely uploads image to 'product-images' bucket and returns public URL.
 */
export async function POST(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string" || !file.size) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds maximum size of 5 MB." }, { status: 400 });
    }

    const mimeType = file.type?.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    // Determine extension
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const fileName = `${Date.now()}-${randomSuffix}.${ext}`;
    const storagePath = `products/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadErr } = await authClient.storage
      .from("product-images")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadErr) {
      console.error("Storage upload error for product image:", uploadErr.message);
      return NextResponse.json({ error: "Failed to upload image to storage: " + uploadErr.message }, { status: 500 });
    }

    const { data: publicUrlData } = authClient.storage
      .from("product-images")
      .getPublicUrl(storagePath);

    return NextResponse.json(
      {
        url: publicUrlData?.publicUrl,
        fileName,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected error in POST /api/admin/products/upload:", err);
    return NextResponse.json({ error: "An unexpected error occurred during upload." }, { status: 500 });
  }
}
