"use client";

import { QRCodeSVG } from "qrcode.react";
import { getQrUrl, isValidCardCode } from "@/lib/dynamicQr";

/**
 * DynamicQrCode
 *
 * Renders an SVG QR code containing the stable NFCISTA redirect URL
 * for the given card code.
 *
 * The QR code encodes:
 *   https://nfcista.vercel.app/r/[CARDCODE]
 *
 * NOT the final destination URL. This means the physical QR stays valid
 * even if the destination is updated in Supabase later.
 *
 * Does NOT query Supabase.
 * Does NOT perform redirects.
 * Does NOT expose customer data or destination URLs.
 *
 * Props:
 *   cardCode   {string}  The Dynamic QR card code (e.g. "NF8K29"). Normalized to uppercase.
 *   size       {number}  QR code pixel size. Defaults to 256.
 *   className  {string}  Optional CSS class for the wrapper div.
 */
export default function DynamicQrCode({ cardCode, size = 256, className = "" }) {
  if (!isValidCardCode(cardCode)) {
    return (
      <div className={`flex items-center justify-center p-4 border border-red-200 bg-red-50 rounded-xl text-red-700 text-sm ${className}`}>
        Invalid card code: <code className="ml-1 font-mono">{String(cardCode)}</code>
      </div>
    );
  }

  const qrUrl = getQrUrl(cardCode);

  return (
    <div className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <QRCodeSVG
        value={qrUrl}
        size={size}
        level="M"
        includeMargin={true}
        aria-label={`QR code for card ${cardCode.trim().toUpperCase()} — points to ${qrUrl}`}
      />
    </div>
  );
}
