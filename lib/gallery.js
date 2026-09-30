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

/**
 * ==============================================================================
 * ADMIN GALLERY HELPERS (Used by Customer Modal and Admin Dashboard)
 * ==============================================================================
 */

/**
 * Helper to obtain bearer auth headers from current Supabase session.
 */
export async function getAuthHeader() {
  if (!supabase) return {};
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // Fall back to HttpOnly cookie
  }
  return {};
}

/**
 * Fetch all gallery items and images for a specific customer ID (Admin use).
 *
 * @param {string} customerId
 * @returns {Promise<Array<object>>}
 */
export async function getAdminGalleryItems(customerId) {
  if (!customerId) return [];
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`/api/admin/gallery?customerId=${encodeURIComponent(customerId)}`, {
      headers,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to load gallery items.");
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("Error in getAdminGalleryItems:", err);
    return [];
  }
}

/**
 * Save pending gallery items and their uploaded files when a new customer is created.
 * Ensures items and images are only saved after customer creation succeeds.
 *
 * @param {string} customerId - The newly created customer ID
 * @param {Array<object>} pendingItems - Array of in-memory gallery items with optional pendingFiles
 */
export async function savePendingGalleryItems(customerId, pendingItems) {
  if (!customerId || !pendingItems || pendingItems.length === 0) return;
  const headers = await getAuthHeader();
  headers["Content-Type"] = "application/json";

  for (let i = 0; i < pendingItems.length; i++) {
    const item = pendingItems[i];
    try {
      // 1. Create gallery item
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers,
        body: JSON.stringify({
          customerId,
          type: item.type || "portfolio",
          title: item.title,
          description: item.description || null,
          price: item.type === "product" ? item.price || null : null,
          category: item.category || null,
          external_url: item.external_url || null,
          cta_text: item.cta_text || null,
          whatsapp_enabled: Boolean(item.whatsapp_enabled),
          is_active: Boolean(item.is_active),
          display_order: Number.isInteger(item.display_order) ? item.display_order : i,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`Failed to create gallery item "${item.title}":`, err.error || res.statusText);
        continue;
      }

      const created = await res.json();
      const galleryItemId = created?.item?.id;

      // 2. Upload any pending image files for this newly created item
      if (galleryItemId && Array.isArray(item.pendingFiles) && item.pendingFiles.length > 0) {
        for (const file of item.pendingFiles) {
          try {
            const authH = await getAuthHeader();
            const formData = new FormData();
            formData.append("file", file);
            formData.append("customerId", customerId);
            formData.append("galleryItemId", galleryItemId);

            const uploadRes = await fetch("/api/admin/gallery/upload", {
              method: "POST",
              headers: authH, // Content-Type omitted so browser sets boundary
              body: formData,
            });

            if (!uploadRes.ok) {
              const uErr = await uploadRes.json().catch(() => ({}));
              console.error(`Failed to upload image for item "${item.title}":`, uErr.error);
            }
          } catch (fileErr) {
            console.error("Image file upload error:", fileErr);
          }
        }
      }
    } catch (itemErr) {
      console.error(`Error saving pending item "${item.title}":`, itemErr);
    }
  }
}

