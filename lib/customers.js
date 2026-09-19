import { supabase, isSupabaseConfigured } from "./supabaseClient";

/**
 * ==============================================================================
 * PUBLIC DATA ACCESS (Used by public profile card at /p/[slug])
 * ==============================================================================
 */

/**
 * Fetch an active customer profile securely by its unique slug.
 *
 * Security:
 * - Uses the PostgreSQL RPC `get_customer_by_slug` which enforces that
 *   only a single active profile matching the exact slug is returned.
 * - Private fields (phone, whatsapp, email, address) are strictly excluded.
 * - Anonymous callers cannot list, scrape, or enumerate other records.
 *
 * @param {string} slug - The unique profile slug (e.g. "demo-customer")
 * @returns {Promise<object|null>} The customer profile object or null if not found/inactive
 */
export async function getCustomerBySlug(slug) {
  if (!isSupabaseConfigured || !slug) {
    return null;
  }

  try {
    const { data, error } = await supabase.rpc("get_customer_by_slug", {
      slug_input: slug.toLowerCase().trim(),
    });

    if (error) {
      console.error("Error fetching customer profile by slug:", error.message);
      return null;
    }

    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error("Unexpected error in getCustomerBySlug:", err);
    return null;
  }
}

/**
 * ==============================================================================
 * AUTHENTICATED ADMIN DATA ACCESS (Used by /admin Dashboard)
 * Protected by Supabase Auth and PostgreSQL RLS (is_admin check).
 * ==============================================================================
 */

/**
 * Fetch the list of customers for the admin dashboard table.
 * Private fields (phone, whatsapp, email, address) are NOT fetched for the list view.
 */
export async function getAdminCustomers() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("customers")
    .select("id, full_name, company_name, job_title, profile_slug, is_active, photo_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Fetch complete customer record (including contact fields) for Edit modal.
 * Only called on-demand when an authenticated admin opens the edit/details modal.
 */
export async function getAdminCustomerDetails(id) {
  if (!isSupabaseConfigured || !id) {
    throw new Error("Invalid request or Supabase not configured.");
  }

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Validates profile slug formatting and uniqueness.
 * - Must be lowercase alphanumeric with hyphens or underscores
 * - Must not be already taken by another customer
 */
export async function validateProfileSlug(slug, excludeId = null) {
  const cleanSlug = (slug || "").trim().toLowerCase();

  // 1. Format validation
  const slugRegex = /^[a-z0-9-_]+$/;
  if (!cleanSlug) {
    return { valid: false, message: "Profile slug is required." };
  }
  if (!slugRegex.test(cleanSlug)) {
    return {
      valid: false,
      message: "Slug can only contain lowercase letters, numbers, hyphens (-), and underscores (_).",
    };
  }
  if (cleanSlug.length < 2 || cleanSlug.length > 50) {
    return { valid: false, message: "Slug must be between 2 and 50 characters." };
  }

  // 2. Uniqueness check in Supabase
  try {
    let query = supabase
      .from("customers")
      .select("id")
      .eq("profile_slug", cleanSlug);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;
    if (error) {
      // If table has RLS blocking or query error, pass format check
      return { valid: true, cleanSlug };
    }

    if (data && data.length > 0) {
      return { valid: false, message: `The slug "${cleanSlug}" is already taken.` };
    }

    return { valid: true, cleanSlug };
  } catch {
    return { valid: true, cleanSlug };
  }
}

/**
 * Create a new customer profile.
 */
export async function createCustomer(formData) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const cleanSlug = formData.profile_slug.trim().toLowerCase();

  const record = {
    full_name: formData.full_name.trim(),
    job_title: formData.job_title?.trim() || null,
    company_name: formData.company_name?.trim() || null,
    category: formData.category?.trim() || null,
    description: formData.description?.trim() || null,
    phone: formData.phone?.trim() || null,
    whatsapp: formData.whatsapp?.trim() || null,
    instagram: formData.instagram?.trim().replace(/^@/, "") || null,
    email: formData.email?.trim() || null,
    website: formData.website?.trim() ? getSafeExternalUrl(formData.website) : null,
    address: formData.address?.trim() || null,
    google_review_url: formData.google_review_url?.trim() ? getSafeExternalUrl(formData.google_review_url) : null,
    photo_url: formData.photo_url?.trim() || null,
    profile_slug: cleanSlug,
    is_active: formData.is_active !== undefined ? Boolean(formData.is_active) : true,
  };

  const { data, error } = await supabase
    .from("customers")
    .insert([record])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Record a publication-consent entry for a newly created customer.
 *
 * DPDP Engineering Note (2026-09-v1):
 * This records that the admin confirmed the customer's permission to publish
 * their profile publicly. The exact legal basis and wording require review by
 * a qualified privacy lawyer before this system is relied upon for compliance.
 *
 * IMPORTANT: The customer_consents table is created by migration
 * supabase/migrations/20260919000000_dpdp_consent_and_rights.sql which has
 * NOT yet been executed in production. This function fails silently with a
 * console.warn so the admin workflow is never blocked by the missing table.
 *
 * @param {string} customerId - UUID of the newly created customer
 * @returns {Promise<void>}
 */
export async function recordConsentForCustomer(customerId) {
  if (!isSupabaseConfigured || !customerId) {
    console.warn("[DPDP] recordConsentForCustomer: skipped — missing config or customerId");
    return;
  }

  try {
    const { error } = await supabase.from("customer_consents").insert([
      {
        customer_id: customerId,
        purpose: "public_profile_display",
        consent_status: "granted",
        policy_version: "2026-09-v1",
        source_form: "admin_concierge",
        granted_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      // 42P01 = table does not exist (PostgreSQL), PGRST116 = PostgREST not found
      if (
        error.code === "42P01" ||
        error.code === "PGRST116" ||
        error.message?.toLowerCase().includes("does not exist")
      ) {
        console.warn(
          "[DPDP] customer_consents table not yet created — run the DPDP migration to enable consent recording. Error:",
          error.message
        );
      } else {
        // Other errors (RLS, network, etc.) — warn but do not rethrow
        console.warn("[DPDP] Failed to record consent (non-blocking):", error.message);
      }
    }
  } catch (err) {
    // Catch-all: never block the admin UI
    console.warn("[DPDP] Unexpected error in recordConsentForCustomer (non-blocking):", err);
  }
}

/**
 * Update an existing customer profile.
 */
export async function updateCustomer(id, formData) {
  if (!isSupabaseConfigured || !id) {
    throw new Error("Invalid request or Supabase not configured.");
  }

  const cleanSlug = formData.profile_slug.trim().toLowerCase();

  const updates = {
    full_name: formData.full_name.trim(),
    job_title: formData.job_title?.trim() || null,
    company_name: formData.company_name?.trim() || null,
    category: formData.category?.trim() || null,
    description: formData.description?.trim() || null,
    phone: formData.phone?.trim() || null,
    whatsapp: formData.whatsapp?.trim() || null,
    instagram: formData.instagram?.trim().replace(/^@/, "") || null,
    email: formData.email?.trim() || null,
    website: formData.website?.trim() ? getSafeExternalUrl(formData.website) : null,
    address: formData.address?.trim() || null,
    google_review_url: formData.google_review_url?.trim() ? getSafeExternalUrl(formData.google_review_url) : null,
    photo_url: formData.photo_url?.trim() || null,
    profile_slug: cleanSlug,
    is_active: formData.is_active !== undefined ? Boolean(formData.is_active) : true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Quick toggle customer active / inactive state.
 */
export async function toggleCustomerActive(id, currentStatus) {
  if (!isSupabaseConfigured || !id) {
    throw new Error("Invalid request or Supabase not configured.");
  }

  const { data, error } = await supabase
    .from("customers")
    .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, is_active")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Delete customer record.
 */
export async function deleteCustomer(id) {
  if (!isSupabaseConfigured || !id) {
    throw new Error("Invalid request or Supabase not configured.");
  }

  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Validates a profile photo file on the client.
 * Allowed formats: JPG, JPEG, PNG, WebP
 * Max file size: 5 MB
 */
export function validatePhotoFile(file) {
  if (!file) {
    return { valid: false, message: "No file selected." };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: "Invalid file type. Only JPG, PNG, and WebP images are allowed.",
    };
  }

  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: "File is too large. Maximum allowed size is 5 MB.",
    };
  }

  return { valid: true };
}

/**
 * Uploads customer profile photo to Supabase Storage 'profile-photos' bucket.
 * Uses authenticated admin privileges.
 */
export async function uploadCustomerPhoto(file, slug) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const validation = validatePhotoFile(file);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const cleanSlug = (slug || "customer").trim().toLowerCase().replace(/[^a-z0-9-_]+/g, "-");
  const ext = file.name ? file.name.split(".").pop().toLowerCase() : "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const fileName = `${cleanSlug}-${Date.now()}.${safeExt}`;
  const filePath = `avatars/${fileName}`;

  const { data, error } = await supabase.storage
    .from("profile-photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Deletes customer profile photo from Supabase Storage 'profile-photos' bucket.
 */
export async function deleteCustomerPhoto(photoUrl) {
  if (!isSupabaseConfigured || !photoUrl) {
    return;
  }

  try {
    const marker = "/profile-photos/";
    const index = photoUrl.indexOf(marker);
    if (index === -1) return;

    const filePath = photoUrl.substring(index + marker.length);
    if (filePath) {
      await supabase.storage.from("profile-photos").remove([filePath]);
    }
  } catch (err) {
    console.warn("Failed to delete old photo from storage:", err);
  }
}

/**
 * Validates whether a string is a safe absolute HTTP or HTTPS URL.
 * Rejects dangerous schemes (javascript:, data:, vbscript:, file:, blob:, about:)
 * and protocol-relative URLs (//).
 *
 * @param {string|null|undefined} urlString
 * @returns {boolean}
 */
export function isValidHttpUrl(urlString) {
  if (!urlString || typeof urlString !== "string") {
    return false;
  }
  const trimmed = urlString.trim();
  if (!trimmed || trimmed.startsWith("//")) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      Boolean(parsed.hostname)
    );
  } catch {
    return false;
  }
}

/**
 * Returns a validated safe HTTP or HTTPS URL string, or null if invalid or dangerous.
 * Ensures external link href attributes only ever receive validated http: or https: schemes.
 *
 * @param {string|null|undefined} urlString
 * @returns {string|null}
 */
export function getSafeExternalUrl(urlString) {
  if (!isValidHttpUrl(urlString)) {
    return null;
  }
  return urlString.trim();
}

