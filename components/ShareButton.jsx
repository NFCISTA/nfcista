"use client";

import { useRef } from "react";
import profile from "@/data/profile";

export default function ShareButton() {
  const toastRef = useRef(null);

  function showToast(message) {
    const el = toastRef.current;
    if (!el) return;
    el.textContent = message;
    el.classList.remove("opacity-0", "pointer-events-none");
    el.classList.add("opacity-100");
    setTimeout(() => {
      el.classList.remove("opacity-100");
      el.classList.add("opacity-0", "pointer-events-none");
    }, 2500);
  }

  async function handleShare() {
    const shareData = {
      title: `${profile.ownerName} | ${profile.businessName}`,
      text: `Connect with ${profile.ownerName} — ${profile.jobTitle} at ${profile.businessName}`,
      url: profile.profileUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled — ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(profile.profileUrl);
        showToast("Profile link copied to clipboard!");
      } catch {
        showToast("Ready to share via browser");
      }
    }
  }

  return (
    <>
      {/* Share button */}
      <div className="w-full pt-1">
        <button
          onClick={handleShare}
          aria-label="Share this business profile"
          className="w-full h-12 bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-label-lg font-semibold rounded-2xl shadow-card hover:bg-surface-container-low flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">
            share
          </span>
          <span>Share Profile</span>
        </button>
      </div>

      {/* Toast notification (replaces alert()) */}
      <div
        ref={toastRef}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-float transition-all duration-300 opacity-0 pointer-events-none flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-secondary-fixed text-[18px]">
          check_circle
        </span>
        <span className="text-label-md font-semibold" />
      </div>
    </>
  );
}