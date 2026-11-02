import { cache } from "react";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

/**
 * Validates the syntax of a Review Card code.
 * Expected: uppercase alphanumeric with optional hyphen or underscore, 3 to 32 chars.
 *
 * @param {string|null|undefined} code
 * @returns {boolean}
 */
export function isValidReviewCardCode(code) {
  if (!code || typeof code !== "string") {
    return false;
  }
  const trimmed = code.trim();
  return /^[A-Za-z0-9_-]{3,32}$/.test(trimmed);
}

/**
 * Normalizes a card code to trimmed uppercase.
 *
 * @param {string} code
 * @returns {string}
 */
export function normalizeCardCode(code) {
  return String(code || "").trim().toUpperCase();
}

/**
 * Safeguard 1: Strict Google Review URL validation.
 *
 * Ensures:
 * - Valid URL structure.
 * - HTTP or HTTPS protocol only.
 * - Recognizes standard Google review and maps hostnames (g.page, search.google.com, goo.gl, maps.google.com, etc.).
 *
 * @param {string|null|undefined} urlStr
 * @returns {{ valid: boolean, normalizedUrl?: string, error?: string }}
 */
export function validateGoogleReviewUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") {
    return { valid: false, error: "Google Review URL is required." };
  }

  const trimmed = urlStr.trim();
  if (!trimmed) {
    return { valid: false, error: "Google Review URL cannot be empty." };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: "Invalid URL format. Please provide a full URL starting with https://" };
  }

  // Must be http: or https:
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false, error: "URL protocol must be https:// or http://" };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Allowed Google Review domains
  const isGoogleDomain =
    hostname === "g.page" ||
    hostname.endsWith(".g.page") ||
    hostname === "goo.gl" ||
    hostname.endsWith(".goo.gl") ||
    hostname.includes("google.") ||
    hostname.includes("google.com");

  if (!isGoogleDomain) {
    return {
      valid: false,
      error: `Invalid review domain "${hostname}". Please provide an official Google Review link (e.g. https://g.page/r/.../review or https://search.google.com/local/writereview?placeid=...).`,
    };
  }

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
  };
}

/**
 * Raw database query to fetch review card configuration via secure RPC.
 *
 * @param {string} rawCode
 * @returns {Promise<object|null>}
 */
async function fetchReviewCardConfigFromDb(rawCode) {
  if (!isSupabaseConfigured || !supabase || !isValidReviewCardCode(rawCode)) {
    return null;
  }

  const code = normalizeCardCode(rawCode);

  try {
    const { data, error } = await supabase.rpc("get_review_card_config", {
      card_code_input: code,
    });

    if (error) {
      console.error("[review-cards] Error fetching card config:", error.message);
      return null;
    }

    const row = Array.isArray(data) && data.length > 0 ? data[0] : data;
    if (!row || !row.is_active || !row.business_name || !row.google_review_url) {
      return null;
    }

    // Validate review URL before trusting
    const urlValidation = validateGoogleReviewUrl(row.google_review_url);
    if (!urlValidation.valid) {
      console.warn("[review-cards] Stored review URL failed validation:", row.google_review_url);
      return null;
    }

    return {
      card_code: code,
      business_name: String(row.business_name).trim(),
      category: String(row.category || "retail").trim().toLowerCase(),
      google_review_url: urlValidation.normalizedUrl,
      review_assistant_enabled: Boolean(row.review_assistant_enabled), // Defaults to false
      is_active: Boolean(row.is_active),
    };
  } catch (err) {
    console.error("[review-cards] Unexpected fetch error:", err);
    return null;
  }
}

/**
 * Public accessor with React cache() deduplication during server rendering.
 * Matches NFCISTA's pattern in lib/customers.js.
 *
 * @param {string} cardCode
 * @returns {Promise<object|null>}
 */
export const getReviewCardConfig = cache(async function getReviewCardConfig(cardCode) {
  if (!isValidReviewCardCode(cardCode)) {
    return null;
  }
  const cleanCode = normalizeCardCode(cardCode);
  return fetchReviewCardConfigFromDb(cleanCode);
});
