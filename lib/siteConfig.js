/**
 * NFCISTA Site Configuration
 *
 * Centralized constants for the public-facing NFCISTA application.
 * These values are used by server and client utilities/components.
 */

/**
 * The stable public base URL for NFCISTA's production deployment.
 * Used to build stable QR redirect URLs in the form:
 *   https://nfcista.vercel.app/r/[cardCode]
 *
 * When the production domain changes, update ONLY this constant.
 */
export const NFCISTA_BASE_URL = "https://nfcista.vercel.app";
export const NFCISTA_DEV_URL = "http://localhost:3000";

/**
 * Resolves the trusted redirect URL for authentication flows (e.g. password recovery).
 * Security hardening: Strictly uses configured environment origins (production domain or
 * localhost for local dev). Request Host or X-Forwarded-Host headers are intentionally
 * NEVER used to prevent Host Header Poisoning attacks on password recovery links.
 *
 * @param {Request|string} [requestOrPath="/reset-password"] - Incoming request or path
 * @param {string} [maybePath="/reset-password"] - Destination path if request was passed first
 * @returns {string} Fully qualified trusted redirect URL
 */
export function getAuthRedirectUrl(requestOrPath, maybePath) {
  let path = "/reset-password";
  if (typeof requestOrPath === "string") {
    path = requestOrPath;
  } else if (typeof maybePath === "string") {
    path = maybePath;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // 1. Explicit site URL from environment configuration takes highest precedence
  const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (explicitSiteUrl) {
    return `${explicitSiteUrl.replace(/\/+$/, "")}${cleanPath}`;
  }

  // 2. Local development environment explicitly resolves to localhost:3000
  if (process.env.NODE_ENV === "development") {
    return `${NFCISTA_DEV_URL}${cleanPath}`;
  }

  // 3. Production environment always strictly resolves to NFCISTA_BASE_URL
  // Note: Request Host / X-Forwarded-Host headers are NEVER read.
  return `${NFCISTA_BASE_URL}${cleanPath}`;
}
