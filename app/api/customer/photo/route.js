import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateCustomer } from "@/lib/customerAuth";
import { revalidateCustomerProfile } from "@/lib/revalidateProfile";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BUCKET = "profile-photos";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/customer/photo
 * Accepts multipart/form-data with a single 'file' field.
 *
 * Security:
 * - Authenticates customer via authenticateCustomer() (session token + RLS)
 * - Uploads to 'profile-photos' bucket at path: customers/{auth_user_id}/{timestamp}.{ext}
 * - Uses service-role client for storage upload ONLY (never exposed to browser)
 * - Updates customers.photo_url via the customer's own scoped authClient (respects RLS)
 * - Deletes previous photo from storage if it was in this bucket
 *
 * DELETE /api/customer/photo
 * Removes the customer's current profile photo and clears photo_url.
 */
export async function POST(request) {
  const { errorResponse, user, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!serviceRoleKey) {
      console.error("[customer/photo] SUPABASE_SERVICE_ROLE_KEY is not configured.");
      return NextResponse.json(
        { error: "Storage service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file");

    // Validate file presence
    if (!file || typeof file === "string" || !file.size) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum allowed size is 5 MB." },
        { status: 400 }
      );
    }

    // Validate MIME type
    const mimeType = file.type?.toLowerCase() || "";
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    // Build a safe, customer-scoped storage path: customers/{auth_user_id}/{timestamp}.{ext}
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const fileName = `${Date.now()}.${ext}`;
    const storagePath = `customers/${user.id}/${fileName}`;

    // Convert File to Buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Service-role client — only used for storage.upload (never sent to browser)
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // Delete previous photo if it was stored in our bucket (best-effort cleanup)
    const prevPhotoUrl = customer.photo_url || "";
    const bucketMarker = `/object/public/${BUCKET}/`;
    if (prevPhotoUrl.includes(bucketMarker)) {
      const prevPath = prevPhotoUrl.substring(
        prevPhotoUrl.indexOf(bucketMarker) + bucketMarker.length
      );
      if (prevPath) {
        await serviceClient.storage.from(BUCKET).remove([prevPath]).catch((e) => {
          console.warn("[customer/photo] Failed to remove old photo:", e?.message);
        });
      }
    }

    // Upload new photo via service-role client
    const { error: uploadErr } = await serviceClient.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadErr) {
      console.error("[customer/photo] Storage upload error:", uploadErr.message);
      return NextResponse.json(
        { error: "Failed to upload photo: " + uploadErr.message },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = serviceClient.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json(
        { error: "Photo uploaded but could not get public URL." },
        { status: 500 }
      );
    }

    // Persist the new photo_url via the customer's scoped client (enforces RLS)
    const { data: updatedCustomer, error: updateErr } = await authClient
      .from("customers")
      .update({ photo_url: publicUrl })
      .eq("id", customer.id)
      .eq("auth_user_id", user.id)
      .select()
      .single();

    if (updateErr) {
      console.error("[customer/photo] Failed to update photo_url:", updateErr.message);
      // Attempt to clean up the just-uploaded file
      await serviceClient.storage.from(BUCKET).remove([storagePath]).catch(() => {});
      return NextResponse.json(
        { error: "Photo uploaded but failed to save URL: " + updateErr.message },
        { status: 500 }
      );
    }

    // Revalidate the public profile cache
    if (customer.profile_slug) {
      revalidateCustomerProfile(customer.profile_slug);
    }

    return NextResponse.json({
      success: true,
      photo_url: publicUrl,
      customer: updatedCustomer,
    });
  } catch (fatalErr) {
    console.error("[customer/photo] Uncaught exception:", fatalErr);
    return NextResponse.json(
      { error: "An unexpected error occurred during photo upload." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customer/photo
 * Removes the customer's profile photo from storage and clears photo_url.
 */
export async function DELETE(request) {
  const { errorResponse, user, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    const prevPhotoUrl = customer.photo_url || "";

    // Clear photo_url in the database via customer's scoped client (RLS)
    const { data: updatedCustomer, error: updateErr } = await authClient
      .from("customers")
      .update({ photo_url: null })
      .eq("id", customer.id)
      .eq("auth_user_id", user.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to remove photo: " + updateErr.message },
        { status: 500 }
      );
    }

    // Best-effort: delete the stored file if it was in our bucket
    if (serviceRoleKey && prevPhotoUrl) {
      const bucketMarker = `/object/public/${BUCKET}/`;
      if (prevPhotoUrl.includes(bucketMarker)) {
        const prevPath = prevPhotoUrl.substring(
          prevPhotoUrl.indexOf(bucketMarker) + bucketMarker.length
        );
        if (prevPath) {
          const serviceClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceRoleKey,
            { auth: { persistSession: false, autoRefreshToken: false } }
          );
          await serviceClient.storage.from(BUCKET).remove([prevPath]).catch((e) => {
            console.warn("[customer/photo] Failed to delete storage file:", e?.message);
          });
        }
      }
    }

    // Revalidate the public profile cache
    if (customer.profile_slug) {
      revalidateCustomerProfile(customer.profile_slug);
    }

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (fatalErr) {
    console.error("[customer/photo] Uncaught exception in DELETE:", fatalErr);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
