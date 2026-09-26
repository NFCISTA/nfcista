import { notFound, redirect } from "next/navigation";
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
 * 5. Issues 307 temporary redirect to destination, or returns 404 if missing/inactive.
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

  redirect(destination);
}
