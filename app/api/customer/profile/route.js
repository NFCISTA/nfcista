import { NextResponse } from "next/server";
import { authenticateCustomer } from "@/lib/customerAuth";
import { revalidateCustomerProfile } from "@/lib/revalidateProfile";
import {
  isValidHttpUrl,
  cleanInstagramHandle,
  getSafeExternalHttpsUrl,
  isValidHttpsUrl,
  getSafeTwitterUrl,
  getSafeGoogleDriveUrl,
} from "@/lib/customers";

export const dynamic = "force-dynamic";

/**
 * Serializes customer profile for dashboard consumption.
 * Explicit allowlist: returns only fields required by the customer dashboard.
 * Internal fields (auth_user_id, created_at, updated_at) are excluded.
 */
function serializeCustomerProfile(customer) {
  if (!customer) return null;
  return {
    id: customer.id,
    full_name: customer.full_name,
    job_title: customer.job_title,
    company_name: customer.company_name,
    category: customer.category,
    description: customer.description,
    phone: customer.phone,
    whatsapp: customer.whatsapp,
    email: customer.email,
    instagram: customer.instagram,
    website: customer.website,
    address: customer.address,
    google_review_url: customer.google_review_url,
    facebook_url: customer.facebook_url || customer.facebook || null,
    linkedin_url: customer.linkedin_url || customer.linkedin || null,
    twitter_url: customer.twitter_url || customer.x_url || null,
    drive_url: customer.drive_url || customer.google_drive_url || null,
    photo_url: customer.photo_url || null,
    banner_url: customer.banner_url || null,
    profile_slug: customer.profile_slug,
    is_active: customer.is_active,
    enquiry_enabled: customer.enquiry_enabled,
    enquiry_delivery_dashboard: customer.enquiry_delivery_dashboard,
    enquiry_delivery_email: customer.enquiry_delivery_email,
    enquiry_delivery_whatsapp: customer.enquiry_delivery_whatsapp,
  };
}

/**
 * GET /api/customer/profile
 * Returns the currently authenticated customer's own profile.
 */
export async function GET(request) {
  const { errorResponse, customer } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  return NextResponse.json({ customer: serializeCustomerProfile(customer) });
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

    // 14. Facebook URL (Optional, strictly HTTPS)
    const rawFbInput = body.facebook_url !== undefined ? body.facebook_url : body.facebook;
    if (rawFbInput !== undefined) {
      const rawFb = rawFbInput ? String(rawFbInput).trim() : null;
      if (rawFb) {
        const safeFb = getSafeExternalHttpsUrl(rawFb);
        if (!safeFb) {
          return NextResponse.json(
            { error: "Facebook URL must be a valid HTTPS link (e.g. https://facebook.com/yourpage)." },
            { status: 400 }
          );
        }
        updates.facebook_url = safeFb;
      } else {
        updates.facebook_url = null;
      }
    }

    // 15. LinkedIn URL (Optional, strictly HTTPS)
    const rawLiInput = body.linkedin_url !== undefined ? body.linkedin_url : body.linkedin;
    if (rawLiInput !== undefined) {
      const rawLi = rawLiInput ? String(rawLiInput).trim() : null;
      if (rawLi) {
        const safeLi = getSafeExternalHttpsUrl(rawLi);
        if (!safeLi) {
          return NextResponse.json(
            { error: "LinkedIn URL must be a valid HTTPS link (e.g. https://linkedin.com/in/yourprofile)." },
            { status: 400 }
          );
        }
        updates.linkedin_url = safeLi;
      } else {
        updates.linkedin_url = null;
      }
    }

    // 16. Banner URL (Optional)
    if (body.banner_url !== undefined) {
      const cleanBanner = body.banner_url ? String(body.banner_url).trim() : null;
      if (cleanBanner && !isValidHttpUrl(cleanBanner) && !cleanBanner.startsWith("/")) {
        return NextResponse.json(
          { error: "Profile banner URL must be a valid image URL." },
          { status: 400 }
        );
      }
      updates.banner_url = cleanBanner;
    }

    // 17. X / Twitter URL (Optional, strictly HTTPS)
    const rawTwitterInput = body.twitter_url !== undefined ? body.twitter_url : body.x_url;
    if (rawTwitterInput !== undefined) {
      const rawTwitter = rawTwitterInput ? String(rawTwitterInput).trim() : null;
      if (rawTwitter) {
        const safeTwitter = getSafeTwitterUrl(rawTwitter);
        if (!safeTwitter) {
          return NextResponse.json(
            { error: "X / Twitter URL must be a valid HTTPS link (e.g. https://x.com/yourhandle or @yourhandle)." },
            { status: 400 }
          );
        }
        updates.twitter_url = safeTwitter;
      } else {
        updates.twitter_url = null;
      }
    }

    // 18. Google Drive URL (Optional, strictly HTTPS drive.google.com or docs.google.com)
    const rawDriveInput = body.drive_url !== undefined ? body.drive_url : body.google_drive_url;
    if (rawDriveInput !== undefined) {
      const rawDrive = rawDriveInput ? String(rawDriveInput).trim() : null;
      if (rawDrive) {
        const safeDrive = getSafeGoogleDriveUrl(rawDrive);
        if (!safeDrive) {
          return NextResponse.json(
            { error: "Google Drive URL must be a valid shareable link starting with https://drive.google.com/ or https://docs.google.com/." },
            { status: 400 }
          );
        }
        updates.drive_url = safeDrive;
      } else {
        updates.drive_url = null;
      }
    }

    // 19. Enquiry Form & Delivery Settings (Optional booleans)
    if (body.enquiry_enabled !== undefined) {
      updates.enquiry_enabled = Boolean(body.enquiry_enabled);
    }
    if (body.enquiry_delivery_dashboard !== undefined) {
      updates.enquiry_delivery_dashboard = Boolean(body.enquiry_delivery_dashboard);
    }
    if (body.enquiry_delivery_email !== undefined) {
      updates.enquiry_delivery_email = Boolean(body.enquiry_delivery_email);
    }
    if (body.enquiry_delivery_whatsapp !== undefined) {
      updates.enquiry_delivery_whatsapp = Boolean(body.enquiry_delivery_whatsapp);
    }

    // Validation: When enquiry_enabled is active, require at least one valid delivery method
    const isEnquiryActive = updates.enquiry_enabled !== undefined ? updates.enquiry_enabled : customer.enquiry_enabled;
    if (isEnquiryActive) {
      const willDashboard = updates.enquiry_delivery_dashboard !== undefined ? updates.enquiry_delivery_dashboard : customer.enquiry_delivery_dashboard;
      const willEmail = updates.enquiry_delivery_email !== undefined ? updates.enquiry_delivery_email : customer.enquiry_delivery_email;
      const willWhatsapp = updates.enquiry_delivery_whatsapp !== undefined ? updates.enquiry_delivery_whatsapp : customer.enquiry_delivery_whatsapp;

      if (!willDashboard && !willEmail && !willWhatsapp) {
        return NextResponse.json(
          { error: "At least one delivery destination (e.g. Dashboard or WhatsApp) must be selected when Enquiry Form is enabled." },
          { status: 400 }
        );
      }

      if (willWhatsapp) {
        const currentWa = updates.whatsapp !== undefined ? updates.whatsapp : customer.whatsapp;
        if (!currentWa || !String(currentWa).trim()) {
          return NextResponse.json(
            { error: "A WhatsApp number is required to enable WhatsApp Follow-up delivery." },
            { status: 400 }
          );
        }
      }
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
        { error: "Failed to update profile. Please try again." },
        { status: 500 }
      );
    }

    // Purge public cache for this customer's profile slug
    if (customer.profile_slug) {
      revalidateCustomerProfile(customer.profile_slug);
    }

    return NextResponse.json({
      success: true,
      customer: serializeCustomerProfile(updatedCustomer),
    });
  } catch (err) {
    console.error("Unexpected error in PUT /api/customer/profile:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
