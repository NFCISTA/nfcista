"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

/**
 * ProfileQuickActions — precision action row.
 * Renders WhatsApp / Call / Email / Share with 48px touch targets,
 * high-contrast icons, and tactile states.
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
      isShare: true,
      color: "text-accent-primary",
      bg: "bg-blue-50 border-blue-100",
    },
  ];

  const cols =
    allActions.length <= 2
      ? "grid-cols-2"
      : allActions.length === 3
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className={`grid ${cols} gap-2 w-full`}>
      {allActions.map((action) => {
        const iconName = action.icon;
        const buttonClass =
          "flex flex-col items-center justify-center p-2 rounded-xl border border-border-hairline bg-surface-base hover:bg-surface-subtle/80 hover:border-border-strong active:scale-[0.97] transition-all min-h-[64px] min-w-[48px] group shadow-2xs";

        if (action.isShare) {
          return (
            <button
              key="share"
              type="button"
              onClick={handleShare}
              className={buttonClass}
              aria-label="Share profile"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center mb-1 text-accent-primary group-hover:scale-105 transition-transform">
                <Icon name={iconName} size={18} strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-text-primary leading-tight truncate max-w-full">
                {action.label}
              </span>
            </button>
          );
        }

        // WhatsApp, Call, Email
        let iconBg = "bg-slate-50 border-slate-200 text-slate-800";
        if (action.id === "whatsapp") {
          iconBg = "bg-emerald-50 border-emerald-100 text-emerald-600";
        } else if (action.id === "call") {
          iconBg = "bg-blue-50 border-blue-100 text-accent-primary";
        } else if (action.id === "email") {
          iconBg = "bg-indigo-50 border-indigo-100 text-indigo-600";
        }

        return (
          <a
            key={action.id}
            href={action.href}
            target={action.isExternal ? "_blank" : undefined}
            rel={action.isExternal ? "noopener noreferrer" : undefined}
            className={buttonClass}
            aria-label={action.label}
          >
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-1 ${iconBg} group-hover:scale-105 transition-transform`}>
              <Icon name={iconName} size={18} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-text-primary leading-tight truncate max-w-full">
              {action.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}
