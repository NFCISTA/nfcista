import { cache } from "react";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getSafeExternalUrl, isValidHttpUrl } from "./customers";

/**
 * ==============================================================================
 * PUBLIC GALLERY ACCESS (Used by public profile card at /p/[slug])
 * ==============================================================================
 */

/**
 * Fetch active gallery items for a customer profile by their unique slug.
 *
 * Security & Data Privacy:
 * - Uses React cache() for request-level deduplication.
 * - Uses PostgreSQL RPC `get_customer_gallery` (SECURITY DEFINER).
 * - Only active items belonging to active customer profiles are returned.
 * - Private database fields (customer_id, created_at, updated_at) are excluded.
 * - Inactive items are strictly filtered at the database level.
 *
 * @param {string} slug - The unique customer profile slug
 * @returns {Promise<Array<object>>} List of active gallery items with images, or empty array
 */
export const getCustomerGallery = cache(async function getCustomerGallery(slug) {
  if (!isSupabaseConfigured || !slug) {
    return [];
  }

  const normalizedSlug = slug.toLowerCase().trim();

  try {
    const { data, error } = await supabase.rpc("get_customer_gallery", {
      slug_input: normalizedSlug,
    });

    if (error) {
      console.error("Error fetching customer gallery by slug:", error.message);
      return [];
    }

    if (!Array.isArray(data)) {
      return [];
    }

    // Sanitize URLs to ensure no javascript: or dangerous schemes reach the browser
    return data.map((item) => {
      const safeImages = Array.isArray(item.images)
        ? item.images
            .map((img) => ({
              id: img.id,
              image_url:
                isValidHttpUrl(img.image_url) || img.image_url?.startsWith("/")
                  ? img.image_url.trim()
                  : null,
              display_order: Number.isInteger(img.display_order)
                ? img.display_order
                : 0,
            }))
            .filter((img) => Boolean(img.image_url))
        : [];

      return {
        id: item.id,
        type: item.type === "product" ? "product" : "portfolio",
        title: item.title || "",
        description: item.description || null,
        price: item.price || null,
        category: item.category || null,
        external_url: getSafeExternalUrl(item.external_url),
        cta_text: item.cta_text || null,
        whatsapp_enabled: Boolean(item.whatsapp_enabled),
        display_order: Number.isInteger(item.display_order) ? item.display_order : 0,
        images: safeImages,
      };
    });
  } catch (err) {
    console.error("Unexpected error in getCustomerGallery:", err);
    return [];
  }
});
