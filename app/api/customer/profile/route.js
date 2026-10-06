import { NextResponse } from "next/server";
import { authenticateCustomer } from "@/lib/customerAuth";
import { revalidateCustomerProfile } from "@/lib/revalidateProfile";
import { isValidHttpUrl, cleanInstagramHandle } from "@/lib/customers";

export const dynamic = "force-dynamic";

/**
 * GET /api/customer/profile
 * Returns the currently authenticated customer's own profile.
 */
export async function GET(request) {
  const { errorResponse, customer } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  return NextResponse.json({ customer });
}

/**
 * PUT /api/customer/profile
 * Updates the currently authenticated customer's own profile.
 *
 * Allowed editable fields in Phase 1:
 * - full_name, job_title, company_name, category, description,
 *   phone, whatsapp, email, instagram, website, address,
 *   google_review_url, photo_url.
 *
 * Protected admin-controlled fields (IGNORED if supplied):
 * - id, profile_slug, auth_user_id, is_active, created_at, updated_at.
 */
export async function PUT(request) {
  const { errorResponse, user, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const updates = {};

    // 1. Full Name (Required, 1-150 chars)
    if (body.full_name !== undefined) {
      const cleanName = String(body.full_name || "").trim();
      if (!cleanName || cleanName.length > 150) {
        return NextResponse.json(
          { error: "Full name is required and must be 150 characters or less." },
          { status: 400 }
        );
      }
      updates.full_name = cleanName;
    }

    // 2. Job Title (Optional, max 100 chars)
    if (body.job_title !== undefined) {
      updates.job_title = body.job_title ? String(body.job_title).trim().slice(0, 100) : null;
    }

    // 3. Company Name (Optional, max 150 chars)
    if (body.company_name !== undefined) {
      updates.company_name = body.company_name ? String(body.company_name).trim().slice(0, 150) : null;
    }

    // 4. Category (Optional, max 100 chars)
    if (body.category !== undefined) {
      updates.category = body.category ? String(body.category).trim().slice(0, 100) : null;
    }

    // 5. Description / Bio (Optional, max 2000 chars)
    if (body.description !== undefined) {
      updates.description = body.description ? String(body.description).trim().slice(0, 2000) : null;
    }

    // 6. Phone (Optional, clean string)
    if (body.phone !== undefined) {
      updates.phone = body.phone ? String(body.phone).trim().slice(0, 40) : null;
    }

    // 7. WhatsApp (Optional, clean string)
    if (body.whatsapp !== undefined) {
      updates.whatsapp = body.whatsapp ? String(body.whatsapp).trim().replace(/[^0-9+]/g, "").slice(0, 25) : null;
    }

    // 8. Email (Optional, validate format if provided)
    if (body.email !== undefined) {
      const cleanEmail = body.email ? String(body.email).trim() : null;
      if (cleanEmail && !cleanEmail.includes("@")) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      }
      updates.email = cleanEmail ? cleanEmail.slice(0, 120) : null;
    }

    // 9. Instagram (Optional, clean handle)
    if (body.instagram !== undefined) {
      updates.instagram = body.instagram ? cleanInstagramHandle(String(body.instagram).trim()) : null;
    }

    // 10. Website URL (Optional, validate URL if provided)
    if (body.website !== undefined) {
      const cleanWeb = body.website ? String(body.website).trim() : null;
      if (cleanWeb && !cleanWeb.startsWith("http://") && !cleanWeb.startsWith("https://")) {
        updates.website = `https://${cleanWeb}`;
      } else {
        updates.website = cleanWeb;
      }
    }

    // 11. Address (Optional, max 250 chars)
    if (body.address !== undefined) {
      updates.address = body.address ? String(body.address).trim().slice(0, 250) : null;
    }

    // 12. Google Review URL (Optional)
    if (body.google_review_url !== undefined) {
      const cleanReview = body.google_review_url ? String(body.google_review_url).trim() : null;
      if (cleanReview && !isValidHttpUrl(cleanReview)) {
        return NextResponse.json(
          { error: "Google Review URL must be a valid HTTP or HTTPS link." },
          { status: 400 }
        );
      }
      updates.google_review_url = cleanReview;
    }

    // 13. Photo URL (Optional)
    if (body.photo_url !== undefined) {
      const cleanPhoto = body.photo_url ? String(body.photo_url).trim() : null;
      if (cleanPhoto && !isValidHttpUrl(cleanPhoto) && !cleanPhoto.startsWith("/")) {
        return NextResponse.json(
          { error: "Profile photo URL must be a valid image URL." },
          { status: 400 }
        );
      }
      updates.photo_url = cleanPhoto;
    }

    // Ensure we are updating only where id = customer.id AND auth_user_id = user.id
    const { data: updatedCustomer, error: updateErr } = await authClient
      .from("customers")
      .update(updates)
      .eq("id", customer.id)
      .eq("auth_user_id", user.id)
      .select()
      .single();

    if (updateErr) {
      console.error("Error updating customer profile:", updateErr.message);
      return NextResponse.json(
        { error: "Failed to update profile: " + updateErr.message },
        { status: 500 }
      );
    }

    // Purge public cache for this customer's profile slug
    if (customer.profile_slug) {
      revalidateCustomerProfile(customer.profile_slug);
    }

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error("Unexpected error in PUT /api/customer/profile:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
