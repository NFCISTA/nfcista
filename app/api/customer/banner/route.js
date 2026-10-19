import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateCustomer } from "@/lib/customerAuth";
import { revalidateCustomerProfile } from "@/lib/revalidateProfile";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BUCKET = "profile-photos";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/customer/banner
 * Accepts multipart/form-data with a single 'file' field.
 *
 * Security:
 * - Authenticates customer via authenticateCustomer() (session token + RLS)
 * - Uploads to 'profile-photos' bucket at path: customers/{auth_user_id}/banners/{timestamp}.{ext}
 * - Uses service-role client for storage upload ONLY (never exposed to browser)
 * - Updates customers.banner_url via the customer's own scoped authClient (respects RLS)
 * - Deletes previous custom banner from storage if it was in this bucket
 *
 * DELETE /api/customer/banner
 * Removes the customer's custom banner and clears banner_url (reverting to NFCISTA default).
 */
export async function POST(request) {
  const { errorResponse, user, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  // Rate limit: 5 uploads per 10 minutes per customer+IP (LOW-06)
  const clientIp = getClientIp(request);
  const rateLimitKey = `upload:banner:${customer.id}:${clientIp}`;
  const rateCheck = await checkRateLimit(rateLimitKey, {
    limit: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
  });
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Too many upload attempts. Please wait before trying again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.reset) },
      }
    );
  }

  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!serviceRoleKey) {
      console.error("[customer/banner] SUPABASE_SERVICE_ROLE_KEY is not configured.");
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

    // Build safe customer-scoped storage path: customers/{auth_user_id}/banners/{timestamp}.{ext}
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const fileName = `${Date.now()}.${ext}`;
    const storagePath = `customers/${user.id}/banners/${fileName}`;

    // Convert File to Buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Service-role client — only used for storage upload
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // Delete previous custom banner if it was stored in our bucket
    const prevBannerUrl = customer.banner_url || "";
    const bucketMarker = `/object/public/${BUCKET}/`;
    if (prevBannerUrl.includes(bucketMarker)) {
      const prevPath = prevBannerUrl.substring(
        prevBannerUrl.indexOf(bucketMarker) + bucketMarker.length
      );
      if (prevPath) {
        await serviceClient.storage.from(BUCKET).remove([prevPath]).catch((e) => {
          console.warn("[customer/banner] Failed to remove old banner:", e?.message);
        });
      }
    }

    // Upload new banner via service-role client
    const { error: uploadErr } = await serviceClient.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadErr) {
      console.error("[customer/banner] Storage upload error:", uploadErr.message);
      return NextResponse.json(
        { error: "Failed to upload banner. Please try again." },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = serviceClient.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) {
      console.error("[customer/banner] Could not get public URL for uploaded banner.");
      return NextResponse.json(
        { error: "Failed to upload banner. Please try again." },
        { status: 500 }
      );
    }

    // Persist the new banner_url via the customer's scoped client (enforces RLS)
    const { data: updatedCustomer, error: updateErr } = await authClient
      .from("customers")
      .update({ banner_url: publicUrl })
      .eq("id", customer.id)
      .eq("auth_user_id", user.id)
      .select()
      .single();

    if (updateErr) {
      console.error("[customer/banner] Failed to update banner_url:", updateErr.message);
      await serviceClient.storage.from(BUCKET).remove([storagePath]).catch(() => {});
      return NextResponse.json(
        { error: "Failed to update profile banner. Please try again." },
        { status: 500 }
      );
    }

    // Revalidate public profile cache
    if (customer.profile_slug) {
      revalidateCustomerProfile(customer.profile_slug);
    }

    return NextResponse.json({
      success: true,
      banner_url: publicUrl,
      customer: updatedCustomer,
    });
  } catch (fatalErr) {
    console.error("[customer/banner] Uncaught exception:", fatalErr);
    return NextResponse.json(
      { error: "An unexpected error occurred during banner upload." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customer/banner
 * Removes the customer's custom profile banner from storage and resets banner_url to null.
 */
export async function DELETE(request) {
  const { errorResponse, user, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    const prevBannerUrl = customer.banner_url || "";

    // Clear banner_url in the database via customer's scoped client (RLS)
    const { data: updatedCustomer, error: updateErr } = await authClient
      .from("customers")
      .update({ banner_url: null })
      .eq("id", customer.id)
      .eq("auth_user_id", user.id)
      .select()
      .single();

    if (updateErr) {
      console.error("[customer/banner] Failed to clear banner_url:", updateErr.message);
      return NextResponse.json(
        { error: "Failed to remove custom banner. Please try again." },
        { status: 500 }
      );
    }

    // Best-effort: delete the stored file if it was in our bucket
    if (serviceRoleKey && prevBannerUrl) {
      const bucketMarker = `/object/public/${BUCKET}/`;
      if (prevBannerUrl.includes(bucketMarker)) {
        const prevPath = prevBannerUrl.substring(
          prevBannerUrl.indexOf(bucketMarker) + bucketMarker.length
        );
        if (prevPath) {
          const serviceClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceRoleKey,
            { auth: { persistSession: false, autoRefreshToken: false } }
          );
          await serviceClient.storage.from(BUCKET).remove([prevPath]).catch((e) => {
            console.warn("[customer/banner] Failed to delete storage file:", e?.message);
          });
        }
      }
    }

    // Revalidate public profile cache
    if (customer.profile_slug) {
      revalidateCustomerProfile(customer.profile_slug);
    }

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (fatalErr) {
    console.error("[customer/banner] Uncaught exception in DELETE:", fatalErr);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
