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
 * Checks whether a given hostname is a legitimate Google domain.
 * Strictly checks exact domains or subdomains with dot-prefix.
 * Prevents deceptive domains like "fakegoogle.com", "attacker-google.com", or "google.com.phishing.io".
 *
 * @param {string} hostname
 * @returns {boolean}
 */
function isGenuineGoogleDomain(hostname) {
  if (!hostname || typeof hostname !== "string") return false;

  const h = hostname.toLowerCase();

  // 1. Direct allowed hostnames or legitimate subdomains
  if (
    h === "g.page" ||
    h.endsWith(".g.page") ||
    h === "goo.gl" ||
    h.endsWith(".goo.gl") ||
    h === "google.com" ||
    h.endsWith(".google.com")
  ) {
    return true;
  }

  // 2. Legitimate international Google ccTLDs: e.g. google.co.in, maps.google.co.uk, google.de
  // Must match either google.<tld> or <subdomain>.google.<tld>
  const googleTldMatch = /^(?:[a-z0-9-]+\.)*google\.[a-z]{2,3}(?:\.[a-z]{2})?$/i.test(h);
  return googleTldMatch;
}

/**
 * Safeguard 1: Strict Google Review URL validation.
 *
 * Ensures:
 * - Valid URL structure with valid protocol (https: or http:).
 * - No userinfo credentials (user:pass@host).
 * - Genuine Google domains only (rejects deceptive subdomains or contains attacks).
 * - Destination points to a review path, business profile, place ID, or CID (not plain google.com homepage).
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

  // Reject embedded credentials
  if (parsed.username || parsed.password) {
    return { valid: false, error: "Userinfo credentials are not permitted in review URLs." };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (!isGenuineGoogleDomain(hostname)) {
    return {
      valid: false,
      error: `Invalid review domain "${hostname}". Please provide an official Google Review link (e.g. https://g.page/r/.../review or https://search.google.com/local/writereview?placeid=...).`,
    };
  }

  // Prevent generic homepage (e.g. https://google.com or https://www.google.com/) without any review target
  const isGenericHomepage =
    (hostname === "google.com" || hostname === "www.google.com" || hostname === "google.co.in" || hostname === "www.google.co.in") &&
    (parsed.pathname === "/" || parsed.pathname === "") &&
    !parsed.search;

  if (isGenericHomepage) {
    return {
      valid: false,
      error: "Please provide a direct Google Review or Maps link, not just the general Google search homepage.",
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
    if (!row || !row.is_active || !row.review_assistant_enabled || !row.business_name || !row.google_review_url) {
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
