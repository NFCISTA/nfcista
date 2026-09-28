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
