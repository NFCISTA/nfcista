"use client";

import { useState } from "react";

/**
 * ProfileQuickActions — flat icon-circle action row.
 * Renders WhatsApp / Call / Email from server-provided `actions`,
 * plus a client-side Share button that uses the Web Share API.
 *
 * @param {{ actions: Array, profileUrl: string, profileName: string }} props
 */
export default function ProfileQuickActions({ actions = [], profileUrl, profileName }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: profileName
            ? `${profileName} — Digital Business Card`
            : "NFCISTA Digital Business Card",
          text: profileName
            ? `Connect with ${profileName} on NFCISTA`
            : "Connect via NFCISTA digital business card",
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

  const allActions = [
    ...actions,
    {
      id: "share",
      label: copied ? "Copied!" : "Share",
      icon: copied ? "check_circle" : "share",
      bg: "bg-primary",
      isShare: true,
    },
  ];

  const cols =
    allActions.length <= 2
      ? "grid-cols-2"
      : allActions.length === 3
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className={`grid ${cols} gap-1 sm:gap-2 w-full`}>
      {allActions.map((action) =>
        action.isShare ? (
          <button
            key="share"
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-1 group min-w-0"
            aria-label="Share profile"
          >
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${action.bg} flex items-center justify-center shadow-md group-active:scale-95 transition-transform flex-shrink-0`}
            >
              <span
                className="material-symbols-outlined text-white text-[20px] sm:text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                {action.icon}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-600 leading-tight truncate max-w-full">
              {action.label}
            </span>
          </button>
        ) : (
          <a
            key={action.id}
            href={action.href}
            target={action.isExternal ? "_blank" : undefined}
            rel={action.isExternal ? "noopener noreferrer" : undefined}
            className="flex flex-col items-center gap-1 group min-w-0"
            aria-label={action.label}
          >
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${action.bg} flex items-center justify-center shadow-md group-active:scale-95 transition-transform flex-shrink-0`}
            >
              <span
                className="material-symbols-outlined text-white text-[20px] sm:text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                {action.icon}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-600 leading-tight truncate max-w-full">
              {action.label}
            </span>
          </a>
        )
      )}
    </div>
  );
}
