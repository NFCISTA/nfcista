import { supabase, isSupabaseConfigured } from "./supabaseClient";

/**
 * Fetch an active customer profile securely by its unique slug.
 *
 * Security:
 * - Uses the PostgreSQL RPC `get_customer_by_slug` which enforces that
 *   only a single active profile matching the exact slug is returned.
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
      slug_input: slug,
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
