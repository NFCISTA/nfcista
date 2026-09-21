"use client";

import { useState } from "react";

/**
 * ProfileAvatar — renders a resilient customer avatar with verified status.
 *
 * Features:
 * - Graceful fallback to monogram initials on network/load error (onError).
 * - Premium gradient ring and elevation shadow.
 * - Online activity indicator.
 * - Official "VERIFIED" badge pill.
 *
 * @param {{ photoUrl?: string|null, fullName?: string|null, initials: string }} props
 */
export default function ProfileAvatar({ photoUrl, fullName, initials = "NC" }) {
  const [imageError, setImageError] = useState(false);
  const cleanPhotoUrl = photoUrl?.trim();
  const showPhoto = Boolean(cleanPhotoUrl && !imageError);

  return (
    <div className="relative inline-block">
      {/* Outer gradient accent ring */}
      <div className="w-[116px] h-[116px] rounded-full p-[3px] bg-gradient-to-b from-primary/40 via-primary/20 to-white/80 shadow-float">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center overflow-hidden ring-4 ring-white">
          {showPhoto ? (
            <img
              src={cleanPhotoUrl}
              alt={fullName || "Profile"}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover select-none"
              loading="eager"
            />
          ) : (
            <span className="text-white text-3xl font-bold tracking-tight select-none">
              {initials}
            </span>
          )}
        </div>
      </div>

      {/* Online indicator dot (top-right so it never collides with VERIFIED badge) */}
      <div
        className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white shadow-sm"
        title="Active card"
        aria-label="Active card"
      />

      {/* Official Verified badge */}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-primary text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-btn-primary whitespace-nowrap tracking-wider">
        <span
          className="material-symbols-outlined text-[12px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          verified
        </span>
        <span>VERIFIED</span>
      </div>
    </div>
  );
}
