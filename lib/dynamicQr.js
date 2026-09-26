import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { isValidHttpUrl } from "./customers";

/**
 * Validates the syntax of a Dynamic QR card code.
 * Expected: alphanumeric with optional underscore or hyphen, 3 to 32 characters.
 * Examples: NF8K29, NF3P71, NF9X42.
 *
 * @param {string|null|undefined} code
 * @returns {boolean}
 */
export function isValidCardCode(code) {
  if (!code || typeof code !== "string") {
    return false;
  }
  const trimmed = code.trim();
  return /^[A-Za-z0-9_-]{3,32}$/.test(trimmed);
}

/**
 * Resolves the destination URL for a dynamic QR card by its code.
 *
 * Security:
 * - Direct table queries are never made; accesses via secure RPC only.
 * - Code is normalized to uppercase.
 * - Only active cards return a destination.
 * - Validates destination URL scheme to only permit safe http: and https: targets.
 *
 * @param {string} cardCode
 * @returns {Promise<string|null>} Safe destination URL, or null if inactive, missing, or invalid.
 */
export async function getDynamicQrDestination(cardCode) {
  if (!isSupabaseConfigured || !isValidCardCode(cardCode)) {
    return null;
  }

  const normalizedCode = cardCode.trim().toUpperCase();

  try {
    const { data, error } = await supabase.rpc("get_dynamic_qr_destination", {
      card_code_input: normalizedCode,
    });

    if (error) {
      console.error("Error looking up dynamic QR destination:", error.message);
      return null;
    }

    let rawDestination = null;
    if (typeof data === "string" && data.trim()) {
      rawDestination = data.trim();
    } else if (Array.isArray(data) && data.length > 0 && data[0]?.destination_url) {
      rawDestination = data[0].destination_url.trim();
    }

    if (!rawDestination || !isValidHttpUrl(rawDestination)) {
      return null;
    }

    return rawDestination;
  } catch (err) {
    console.error("Unexpected error in getDynamicQrDestination:", err);
    return null;
  }
}
