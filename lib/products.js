import { supabase } from "@/lib/supabaseClient";

/**
 * Clean slug generator for product names.
 * Converts "Google Review NFC Card" -> "google-review-nfc-card"
 */
export function generateSlug(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/**
 * Format currency price (INR standard ₹)
 */
export function formatPrice(price) {
  if (price === null || price === undefined || price === "") return null;
  const num = Number(price);
  if (isNaN(num)) return String(price);
  return `₹${num.toLocaleString("en-IN")}`;
}

export const STOCK_STATUS_CONFIG = {
  in_stock: {
    label: "In Stock",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  coming_soon: {
    label: "Coming Soon",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    dotClass: "bg-amber-500",
  },
  out_of_stock: {
    label: "Out of Stock",
    badgeClass: "bg-red-50 text-red-800 border-red-200",
    dotClass: "bg-red-500",
  },
};

/**
 * Fetch all publicly active products ordered by display_order ASC, created_at ASC
 */
export async function getPublicProducts() {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      if (!error.message?.includes("Could not find the table")) {
        console.warn("Notice fetching public products from Supabase:", error.message);
      }
      return [];
    }

    return data || [];
  } catch (err) {
    return [];
  }
}

/**
 * Fetch single active product by slug
 */
export async function getPublicProductBySlug(slug) {
  if (!supabase || !slug) return null;

  try {
    const cleanSlug = String(slug).toLowerCase().trim();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", cleanSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      if (!error.message?.includes("Could not find the table")) {
        console.warn(`Notice fetching public product slug "${slug}":`, error.message);
      }
      return null;
    }

    return data;
  } catch (err) {
    return null;
  }
}
