import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { isValidHttpUrl } from "./customers.js";
import { NFCISTA_BASE_URL } from "./siteConfig.js";

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
 * Extracts and validates a card code from a scanned QR URL or string.
 *
 * Rules:
 * - Must be a valid URL with NFCISTA domain (nfcista.vercel.app, nfcista.com, or current origin)
 * - Pathname must match /r/[cardCode]
 * - Extracted card code must satisfy isValidCardCode format
 * - Normalizes to uppercase
 *
 * Rejects:
 * - Non-URL text (e.g. "HELLO123")
 * - Third-party domains (e.g. "https://example.com/r/NF8K29")
 * - Missing or invalid card codes
 *
 * @param {string} text
 * @returns {{ valid: boolean, cardCode?: string, error?: string }}
 */
export function extractCardCodeFromQr(text) {
  if (!text || typeof text !== "string") {
    return { valid: false, error: "Empty or invalid QR code content." };
  }

  const trimmed = text.trim();

  // 1. Try parsing as a URL
  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: "Scanned content is not a valid NFCISTA QR URL.",
    };
  }

  // 2. Validate domain against allowed NFCISTA hostnames
  const allowedHosts = [
    "nfcista.vercel.app",
    "nfcista.com",
    "www.nfcista.com",
    "localhost",
    "127.0.0.1",
  ];

  const host = parsedUrl.hostname.toLowerCase();
  const isAllowedHost =
    allowedHosts.includes(host) ||
    (typeof window !== "undefined" && window.location.hostname.toLowerCase() === host);

  if (!isAllowedHost) {
    return {
      valid: false,
      error: `Invalid domain: "${host}". Only official NFCISTA QR codes are accepted.`,
    };
  }

  // 3. Validate pathname format: /r/[cardCode]
  const match = parsedUrl.pathname.match(/^\/r\/([A-Za-z0-9_-]{3,32})\/?$/);
  if (!match) {
    return {
      valid: false,
      error: "Invalid NFCISTA QR route. Expected URL path /r/[cardCode].",
    };
  }

  const rawCode = match[1];
  if (!isValidCardCode(rawCode)) {
    return {
      valid: false,
      error: `Invalid card code format: "${rawCode}".`,
    };
  }

  return {
    valid: true,
    cardCode: rawCode.toUpperCase(),
  };
}

/**
 * Generates a single card code formatted as NF + 4 uppercase alphanumeric characters.
 * Uses an unambiguous character pool (excluding 0, O, 1, I, L) to avoid visual confusion.
 *
 * @returns {string}
 */
export function generateCardCode() {
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);
  let code = "NF";
  for (let i = 0; i < 4; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * Builds the stable NFCISTA redirect URL for a given card code.
 *
 * This is the URL embedded in the physical QR code. Because it points
 * to the NFCISTA redirect layer, the final destination can be updated
 * in Supabase at any time without reprinting the physical card.
 *
 * @param {string} cardCode
 * @returns {string|null} The stable URL (e.g. https://nfcista.vercel.app/r/NF8K29), or null if invalid.
 */
export function getQrUrl(cardCode) {
  if (!isValidCardCode(cardCode)) {
    return null;
  }
  const normalized = cardCode.trim().toUpperCase();
  return `${NFCISTA_BASE_URL}/r/${normalized}`;
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
