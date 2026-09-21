"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * ProfileShareModal — provides native Web Share and an accessible QR Code modal.
 *
 * @param {{ name: string, slug: string }} props
 */
export default function ProfileShareModal({ name, slug }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!slug) return null;

  const url = `https://nfcista.vercel.app/p/${slug}`;

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: name ? `${name} — Digital Business Card` : "NFCISTA Digital Business Card",
          text: name ? `Connect with ${name} on NFCISTA` : "Connect via NFCISTA digital business card",
          url,
        });
        return;
      } catch {
        // Fall through to clipboard if user dismissed or share failed
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
      {/* ── Compact Share & QR Bar ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share digital business card"
          className="flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-2.5 sm:px-4 rounded-2xl bg-white border border-outline-variant/30 text-on-surface font-semibold text-label-md shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98]"
        >
          <span
            className="material-symbols-outlined text-[19px] text-primary"
            aria-hidden="true"
          >
            {copied ? "check_circle" : "share"}
          </span>
          <span className="truncate">{copied ? "Link Copied!" : "Share Card"}</span>
        </button>

        {/* View QR Code Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Show profile QR code"
          className="flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-2.5 sm:px-4 rounded-2xl bg-white border border-outline-variant/30 text-on-surface font-semibold text-label-md shadow-card hover:bg-surface-container-low transition-all active:scale-[0.98]"
        >
          <span
            className="material-symbols-outlined text-[19px] text-primary"
            aria-hidden="true"
          >
            qr_code_2
          </span>
          <span>Show QR</span>
        </button>
      </div>

      {/* ── Accessible QR Modal ─────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-[360px] bg-white rounded-3xl p-6 text-center shadow-float border border-outline-variant/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close QR code"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {/* Modal Header */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-primary">
                  NFC Tap · QR Scan
                </span>
              </div>
              <h2 id="qr-modal-title" className="text-headline-md font-bold text-on-surface">
                Scan to Connect
              </h2>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                {name ? `Connect with ${name}` : "Point your phone camera to open"}
              </p>
            </div>

            {/* QR Code Canvas */}
            <div className="flex justify-center my-5">
              <div className="p-3 bg-white border border-outline-variant/25 rounded-2xl shadow-card inline-flex">
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

            {/* Profile URL Copy Bar */}
            <div className="mt-3 pt-3 border-t border-outline-variant/20 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleCopyInModal}
                className="w-full flex items-center justify-between px-3 py-2 bg-surface-container-low hover:bg-surface-container rounded-xl text-left transition-colors"
              >
                <span className="text-[11px] text-tertiary truncate max-w-[240px] font-mono">
                  {url}
                </span>
                <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
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
