import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { getDynamicQrDestination, isValidCardCode } from "@/lib/dynamicQr";

export const dynamic = "force-dynamic";

/**
 * Server-side Dynamic QR redirect handler: /r/[cardCode]
 *
 * Flow:
 * 1. Extracts cardCode param.
 * 2. Validates format (3-32 uppercase alphanumeric chars).
 * 3. Calls Supabase RPC get_dynamic_qr_destination (SECURITY DEFINER).
 * 4. Verifies destination is active, valid, and uses safe http/https scheme.
 * 5. Issues 307 temporary redirect to destination with short-lived edge caching
 *    (s-maxage=60, stale-while-revalidate=300) so repeated physical taps/scans
 *    resolve instantly from Vercel's edge network, while allowing destination
 *    updates to propagate within 60s.
 * 6. Returns 404 (uncached) if card is missing, invalid, or inactive.
 */
export async function GET(request, { params }) {
  const { cardCode } = await params;

  if (!isValidCardCode(cardCode)) {
    notFound();
  }

  const destination = await getDynamicQrDestination(cardCode);

  if (!destination) {
    notFound();
  }

  return NextResponse.redirect(destination, {
    status: 307,
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
