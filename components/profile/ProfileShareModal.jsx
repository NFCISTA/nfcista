"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * ProfileShareModal — compact inline share strip + fullscreen QR modal.
 *
 * Inline strip design (V2):
 *   [mini QR] | Share My Card               [share icon]
 *               Scan the QR code or share the link
 *               [Show QR  button]
 *
 * @param {{ name: string, slug: string }} props
 */
export default function ProfileShareModal({ name, slug }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!slug) return null;

  const url = `https://nfcista.vercel.app/p/${slug}`;

  // ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Body scroll lock when modal open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: name
            ? `${name} — Digital Business Card`
            : "NFCISTA Digital Business Card",
          text: name
            ? `Connect with ${name} on NFCISTA`
            : "Connect via NFCISTA digital business card",
          url,
        });
        return;
      } catch {
        // Fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  };

  const handleCopyInModal = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  };

  return (
    <>
      {/* ── Compact Inline Share Strip ─────────────────────────────────── */}
      <div className="flex items-center gap-3 sm:gap-4 bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
        {/* Mini QR Preview */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open full QR code"
          className="flex-shrink-0 p-1.5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow active:scale-95"
        >
          <QRCodeSVG
            value={url}
            size={56}
            bgColor="#ffffff"
            fgColor="#0b1c30"
            level="M"
            includeMargin={false}
          />
        </button>

        {/* Title + subtitle + Show QR button */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-gray-900 leading-tight">Share My Card</p>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
            Scan the QR code or share the link
          </p>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg shadow-sm hover:bg-[#003ea8] transition-colors active:scale-95"
          >
            <span
              className="material-symbols-outlined text-[13px]"
              aria-hidden="true"
            >
              qr_code_2
            </span>
            Show QR
          </button>
        </div>

        {/* Share icon button */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share profile link"
          className="flex-shrink-0 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px] text-primary">
            {copied ? "check" : "share"}
          </span>
        </button>
      </div>

      {/* ── Fullscreen QR Modal ────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-[360px] bg-white rounded-3xl p-6 text-center shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close QR code"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {/* Modal header */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-primary">
                  NFC Tap · QR Scan
                </span>
              </div>
              <h2
                id="qr-modal-title"
                className="text-[20px] font-bold text-gray-900"
              >
                Scan to Connect
              </h2>
              <p className="text-[13px] text-gray-500 mt-0.5">
                {name ? `Connect with ${name}` : "Point your phone camera to open"}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center my-5">
              <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm inline-flex">
                <QRCodeSVG
                  value={url}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#0b1c30"
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Copy URL bar */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCopyInModal}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <span className="text-[11px] text-gray-400 truncate max-w-[240px] font-mono">
                  {url}
                </span>
                <span className="text-[11px] font-bold text-primary flex items-center gap-1 flex-shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
