"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Icon from "@/components/ui/Icon";

/**
 * ProfileShareModal — compact inline share strip + precision QR modal.
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
      <div className="flex items-center gap-3.5 bg-surface-subtle/70 rounded-xl p-3.5 border border-border-hairline">
        {/* Mini QR Preview */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open full QR code"
          className="flex-shrink-0 p-1.5 bg-surface-base rounded-lg border border-border-hairline shadow-2xs hover:border-border-strong transition-colors active:scale-95 cursor-pointer"
        >
          <QRCodeSVG
            value={url}
            size={52}
            bgColor="#ffffff"
            fgColor="#0F172A"
            level="M"
            includeMargin={false}
          />
        </button>

        {/* Title + subtitle + Show QR button */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-text-primary leading-tight">Digital QR Code</p>
          <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">
            Scan to view or share profile
          </p>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-base border border-border-hairline hover:border-border-strong text-text-primary text-[11px] font-semibold rounded-md shadow-2xs transition-colors active:scale-95 cursor-pointer"
          >
            <Icon name="qr_code" size={13} strokeWidth={2} className="text-text-secondary" />
            <span>Show QR</span>
          </button>
        </div>

        {/* Share icon button */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share profile link"
          className="flex-shrink-0 w-9 h-9 rounded-lg bg-surface-base border border-border-hairline shadow-2xs flex items-center justify-center hover:border-border-strong active:scale-95 transition-all cursor-pointer"
        >
          <Icon
            name={copied ? "check" : "share"}
            size={16}
            strokeWidth={2}
            className={copied ? "text-success" : "text-text-primary"}
          />
        </button>
      </div>

      {/* ── Fullscreen QR Modal ────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-[360px] bg-surface-base rounded-xl p-6 text-center shadow-lg border border-border-hairline"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close QR code modal"
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-surface-subtle text-text-secondary flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Icon name="close" size={16} strokeWidth={2} />
            </button>

            {/* Modal header */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-100 rounded-full mb-2">
                <Icon name="nfc" size={12} strokeWidth={2} className="text-accent-primary" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-accent-primary">
                  Physical Tap · QR Scan
                </span>
              </div>
              <h2
                id="qr-modal-title"
                className="text-lg font-bold text-text-primary"
              >
                Scan to Connect
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {name ? `Connect with ${name}` : "Point your camera to view card"}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center my-4">
              <div className="p-3 bg-white border border-border-hairline rounded-xl shadow-2xs inline-flex">
                <QRCodeSVG
                  value={url}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#0F172A"
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Copy URL bar */}
            <div className="mt-3 pt-3 border-t border-border-hairline">
              <button
                type="button"
                onClick={handleCopyInModal}
                className="w-full flex items-center justify-between px-3 py-2 bg-surface-subtle hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-text-secondary truncate max-w-[220px] font-mono">
                  {url}
                </span>
                <span className="text-[11px] font-bold text-accent-primary flex items-center gap-1 flex-shrink-0 ml-2">
                  <Icon
                    name={copied ? "check" : "copy"}
                    size={13}
                    strokeWidth={2}
                  />
                  <span>{copied ? "Copied" : "Copy"}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
