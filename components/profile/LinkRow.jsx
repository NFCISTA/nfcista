"use client";

import React, { useState } from "react";
import IconTile from "./IconTile";
import { ChevronRight, Copy, Check } from "lucide-react";

/**
 * LinkRow — Precision interactive link row
 *
 * Requirements:
 * - At least 64 px tall (min-h-[64px])
 * - 48 px minimum touch targets
 * - IconTile (48×48 px) on the left
 * - Label (title) + Handle/Value (subtitle)
 * - Trailing chevron right
 * - One semantic anchor (<a>) or semantic button (<button>)
 * - Separate copy control for Phone/Email with accessible labels
 * - Keyboard navigation focus rings
 * - Secure clipboard fallback
 * - Touch & press feedback
 */
export default function LinkRow({
  href,
  label,
  value,
  iconName,
  brandColor = "#6F93FF",
  isExternal = true,
  copyValue = null,
  copyLabel = null,
  onCopySuccess = null,
  onClick = null,
  className = "",
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const textToCopy = copyValue || value;
    if (!textToCopy) return;

    let success = false;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        success = true;
      } catch {
        // Fallback below
      }
    }

    if (!success && typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        success = true;
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopied(true);
      if (onCopySuccess) {
        onCopySuccess(copyLabel ? `${copyLabel} copied` : "Copied to clipboard");
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const interactiveClasses = `
    group relative flex items-center gap-3.5 p-2 sm:p-2.5 rounded-2xl min-h-[64px] w-full text-left
    bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70
    shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]
    transition-all duration-150 ease-out active:scale-[0.99]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
    motion-reduce:transition-none motion-reduce:transform-none
    ${className}
  `.trim();

  const content = (
    <>
      {/* IconTile (48x48) */}
      <IconTile
        iconName={iconName}
        brandColor={brandColor}
        isHovered={isHovered}
      />

      {/* Label and Handle / Value */}
      <div className="flex-1 min-w-0 pr-1">
        <p className="text-[13px] sm:text-sm font-semibold text-slate-900 leading-tight truncate">
          {label}
        </p>
        {value && (
          <p className="text-xs text-slate-500 font-normal truncate mt-0.5 leading-snug">
            {value}
          </p>
        )}
      </div>

      {/* Copy Button (Optional for phone/email) */}
      {copyValue && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copyLabel || `Copy ${label}`}
          title={copyLabel || `Copy ${label}`}
          className="w-10 h-10 min-w-[40px] min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px]
                     rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 hover:border-slate-300
                     flex items-center justify-center text-slate-500 hover:text-slate-800
                     transition-colors shrink-0 active:scale-95 z-10
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {copied ? (
            <Check size={16} strokeWidth={2.2} className="text-emerald-600" />
          ) : (
            <Copy size={16} strokeWidth={1.8} />
          )}
        </button>
      )}

      {/* Right chevron indicator */}
      <div className="pr-1 flex items-center justify-center shrink-0">
        <ChevronRight
          size={18}
          strokeWidth={1.75}
          className="text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all motion-reduce:transform-none"
          aria-hidden="true"
        />
      </div>
    </>
  );

  // If onClick is provided without href (e.g. for modal trigger)
  if (!href && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={interactiveClasses}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={interactiveClasses}
    >
      {content}
    </a>
  );
}
