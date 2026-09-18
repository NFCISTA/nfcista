"use client";

import { useState } from "react";

/**
 * ProfileShareButton — shares a profile URL via Web Share API or copies to clipboard.
 * @param {{ name: string, slug: string }} props
 */
export default function ProfileShareButton({ name, slug }) {
  const [copied, setCopied] = useState(false);

  if (!slug) return null;

  const url = `https://nfcista.vercel.app/p/${slug}`;

  const handleShare = async () => {
    // Try native Web Share API first (mobile/supported browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: name ? `${name} — Digital Business Card` : "Digital Business Card",
          text: name
            ? `Connect with ${name} on NFCISTA`
            : "Connect via NFCISTA digital business card",
          url,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest text-on-surface font-semibold text-label-md shadow-card hover:bg-surface-container-low transition-all active:scale-[0.97]"
      aria-label="Share profile"
    >
      <span className="material-symbols-outlined text-[20px] text-primary">
        {copied ? "check_circle" : "share"}
      </span>
      <span>{copied ? "Copied!" : "Share"}</span>
    </button>
  );
}
