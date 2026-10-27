"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

/**
 * ProfileAvatar — renders a resilient, executive customer avatar.
 *
 * Restrained physical-tech styling:
 * - Clean circular profile frame with hairline border and subtle neutral shadow.
 * - Monogram initials fallback on network error or absent photo.
 * - Understated verification badge.
 * - No fake "online" dot or decorative blobs.
 *
 * @param {{ photoUrl?: string|null, fullName?: string|null, initials: string }} props
 */
export default function ProfileAvatar({ photoUrl, fullName, initials = "NC" }) {
  const [imageError, setImageError] = useState(false);
  const cleanPhotoUrl = photoUrl?.trim();
  const showPhoto = Boolean(cleanPhotoUrl && !imageError);

  return (
    <div className="relative inline-block">
      {/* Precision avatar frame */}
      <div className="w-28 h-28 rounded-full bg-surface-base p-1 shadow-card border border-border-hairline">
        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden ring-2 ring-surface-base">
          {showPhoto ? (
            <img
              src={cleanPhotoUrl}
              alt={fullName || "Profile"}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover select-none"
              loading="eager"
            />
          ) : (
            <span className="text-white text-2xl font-bold tracking-tight select-none">
              {initials}
            </span>
          )}
        </div>
      </div>

      {/* Subtle Verified indicator */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-surface-base border border-border-hairline text-accent-primary text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-2xs whitespace-nowrap"
        title="Verified NFCISTA Profile"
      >
        <Icon name="check_circle" size={11} strokeWidth={2.2} className="text-accent-primary" />
        <span className="tracking-wide">VERIFIED</span>
      </div>
    </div>
  );
}
