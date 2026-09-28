import DynamicQrCode from "@/components/qr/DynamicQrCode";
import { getQrUrl } from "@/lib/dynamicQr";

/**
 * DEV-ONLY: Dynamic QR Generation Test Page
 *
 * Route: /dev/qr-test
 *
 * Purpose: Visually verifies that the QR code generation utility
 * is producing the correct stable NFCISTA redirect URL.
 *
 * NOT linked from the public storefront, homepage, or navigation.
 * Uses dummy test card NF8K29 only.
 */

const TEST_CARD_CODE = "NF8K29";

export const metadata = {
  title: "QR Test — NFCISTA Dev",
  robots: "noindex, nofollow",
};

export default function QrTestPage() {
  const generatedUrl = getQrUrl(TEST_CARD_CODE);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-float border border-outline-variant/30 p-8 sm:p-10 flex flex-col items-center gap-6">
        {/* Dev-only badge */}
        <div className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Development Test Only
        </div>

        <div className="w-full space-y-4 text-left">
          {/* Card Code */}
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Card Code
            </p>
            <p className="font-mono text-lg font-bold text-on-surface">
              {TEST_CARD_CODE}
            </p>
          </div>

          {/* Generated QR URL */}
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              QR Code Contents (Stable NFCISTA URL)
            </p>
            <p className="font-mono text-sm text-primary break-all">
              {generatedUrl}
            </p>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              This URL is encoded in the QR below. It points to the NFCISTA redirect layer, not the final destination.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-outline-variant/20" />

        {/* QR Code */}
        <DynamicQrCode cardCode={TEST_CARD_CODE} size={240} />

        <p className="text-xs text-on-surface-variant text-center leading-relaxed max-w-[280px]">
          Scan with a phone to verify redirect.{" "}
          <span className="font-medium text-on-surface">Expected result:</span>{" "}
          opens <code className="font-mono">/r/{TEST_CARD_CODE}</code> → redirects to the current destination.
        </p>
      </div>
    </div>
  );
}
