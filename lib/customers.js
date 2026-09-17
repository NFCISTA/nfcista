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
    .select("id, full_name, company_name, job_title, profile_slug, is_active, created_at")
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
    website: formData.website?.trim() || null,
    address: formData.address?.trim() || null,
    google_review_url: formData.google_review_url?.trim() || null,
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
    website: formData.website?.trim() || null,
    address: formData.address?.trim() || null,
    google_review_url: formData.google_review_url?.trim() || null,
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
