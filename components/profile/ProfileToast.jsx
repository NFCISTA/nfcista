"use client";

import React from "react";
import { Check } from "lucide-react";

/**
 * ProfileToast — Accessible floating notification
 *
 * @param {{ message: string, visible: boolean }} props
 */
export default function ProfileToast({ message = "Copied to clipboard", visible = false }) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none
                 flex items-center gap-2 px-4 py-2.5 rounded-full
                 bg-[#0B0D11]/95 text-[#F2F4F8] border border-[#1D222B]
                 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] backdrop-blur-md
                 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
        <Check size={12} strokeWidth={2.5} />
      </div>
      <span>{message}</span>
    </div>
  );
}
