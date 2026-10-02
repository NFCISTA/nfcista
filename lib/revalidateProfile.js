import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Revalidate a customer's public profile cache on-demand.
 *
 * Scoped precisely to the individual customer:
 * 1. Purges the rendered page route cache at `/p/${cleanSlug}` via revalidatePath
 * 2. Purges the data cache tagged with `customer-profile:${cleanSlug}` via revalidateTag
 *
 * @param {string} slug - The customer profile slug (e.g. "demo-customer")
 */
export function revalidateCustomerProfile(slug) {
  if (!slug || typeof slug !== "string") return;
  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanSlug) return;

  try {
    revalidatePath(`/p/${cleanSlug}`);
    revalidateTag(`customer-profile:${cleanSlug}`, "max");
  } catch (err) {
    console.error(`[Revalidate] Failed to revalidate slug "${cleanSlug}":`, err);
  }
}

/**
 * Helper to revalidate a customer's profile by their customer ID.
 * Queries profile_slug from the database and purges the customer's cache.
 *
 * @param {string} customerId - Customer UUID
 * @param {object} authClient - Authenticated Supabase client
 */
export async function revalidateCustomerById(customerId, authClient) {
  if (!customerId || !authClient) return;
  try {
    const { data: cust, error } = await authClient
      .from("customers")
      .select("profile_slug")
      .eq("id", customerId)
      .maybeSingle();

    if (error) {
      console.error(`[Revalidate] Error fetching slug for customer "${customerId}":`, error.message);
      return;
    }

    if (cust?.profile_slug) {
      revalidateCustomerProfile(cust.profile_slug);
    }
  } catch (err) {
    console.error(`[Revalidate] Unexpected error revalidating customer "${customerId}":`, err);
  }
}
