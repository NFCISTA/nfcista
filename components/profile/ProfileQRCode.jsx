"use client";

import { QRCodeSVG } from "qrcode.react";

/**
 * ProfileQRCode — renders a QR code SVG for a dynamic profile URL.
 * @param {{ url: string, size?: number }} props
 */
export default function ProfileQRCode({ url, size = 160 }) {
  if (!url) return null;

  return (
    <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-card">
      <QRCodeSVG
        value={url}
        size={size}
        bgColor="#ffffff"
        fgColor="#004ac6"
        level="M"
        includeMargin={false}
      />
    </div>
  );
}
