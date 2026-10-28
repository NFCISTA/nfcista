"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

/**
 * DemoQuickActions — demo-safe version of ProfileQuickActions.
 *
 * Renders WhatsApp / Call / Email / Share action buttons exactly as a real
 * profile would, but intercepts every action to show a demo-mode notice
 * instead of contacting a real person or number.
 *
 * The Share button is the only one that works — it shares the /demo URL,
 * which is safe and useful for prospects evaluating NFCISTA.
 */
export default function DemoQuickActions({ profileUrl, profileName }) {
  const [activeNotice, setActiveNotice] = useState(null);
  const [copied, setCopied] = useState(false);

  const showNotice = (id) => {
    setActiveNotice(id);
    setTimeout(() => setActiveNotice(null), 3000);
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${profileName} — NFCISTA Demo Profile`,
          text: "See how an NFCISTA digital business card looks",
          url: profileUrl,
        });
        return;
      } catch {
        // Fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  };

  const NOTICE_TEXT = {
    whatsapp: "Demo only — no real WhatsApp number linked.",
    call: "Demo only — no real phone number linked.",
    email: "Demo only — no real email address linked.",
  };

  const buttonClass =
    "flex flex-col items-center justify-center p-2 rounded-xl border border-border-hairline bg-surface-base hover:bg-surface-subtle/80 hover:border-border-strong active:scale-[0.97] transition-all min-h-[64px] min-w-[48px] group shadow-2xs";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2 w-full">
        {/* WhatsApp — demo intercept */}
        <button
          type="button"
          onClick={() => showNotice("whatsapp")}
          className={buttonClass}
          aria-label="WhatsApp (demo)"
        >
          <div className="w-9 h-9 rounded-lg border bg-emerald-50 border-emerald-100 text-emerald-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Icon name="chat" size={18} strokeWidth={2} />
          </div>
          <span className="text-[11px] font-semibold text-text-primary leading-tight truncate max-w-full">
            WhatsApp
          </span>
        </button>

        {/* Call — demo intercept */}
        <button
          type="button"
          onClick={() => showNotice("call")}
          className={buttonClass}
          aria-label="Call (demo)"
        >
          <div className="w-9 h-9 rounded-lg border bg-blue-50 border-blue-100 text-accent-primary flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Icon name="call" size={18} strokeWidth={2} />
          </div>
          <span className="text-[11px] font-semibold text-text-primary leading-tight truncate max-w-full">
            Call
          </span>
        </button>

        {/* Email — demo intercept */}
        <button
          type="button"
          onClick={() => showNotice("email")}
          className={buttonClass}
          aria-label="Email (demo)"
        >
          <div className="w-9 h-9 rounded-lg border bg-indigo-50 border-indigo-100 text-indigo-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Icon name="mail" size={18} strokeWidth={2} />
          </div>
          <span className="text-[11px] font-semibold text-text-primary leading-tight truncate max-w-full">
            Email
          </span>
        </button>

        {/* Share — works for real, shares /demo URL */}
        <button
          type="button"
          onClick={handleShare}
          className={buttonClass}
          aria-label="Share demo profile"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center mb-1 text-accent-primary group-hover:scale-105 transition-transform">
            <Icon
              name={copied ? "check_circle" : "share"}
              size={18}
              strokeWidth={2}
            />
          </div>
          <span className="text-[11px] font-semibold text-text-primary leading-tight truncate max-w-full">
            {copied ? "Copied!" : "Share"}
          </span>
        </button>
      </div>

      {/* Inline demo notice — appears below the button row */}
      {activeNotice && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <Icon name="Info" size={13} className="w-3 h-3 shrink-0 text-amber-500" />
          <span>{NOTICE_TEXT[activeNotice]}</span>
        </div>
      )}
    </div>
  );
}
