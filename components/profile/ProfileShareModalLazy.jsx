"use client";

/**
 * ProfileShareModalLazy
 *
 * Thin client-side wrapper that lazy-loads ProfileShareModal (and qrcode.react)
 * only after hydration. This removes qrcode.react from the initial JS bundle,
 * improving First Load JS for /p/[slug].
 *
 * While loading, renders a lightweight placeholder share strip so the layout
 * does not shift.
 */

import dynamic from "next/dynamic";

const ProfileShareModal = dynamic(
  () => import("./ProfileShareModal"),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center gap-3 sm:gap-4 bg-gray-50 rounded-2xl p-3.5 border border-gray-100"
        aria-hidden="true"
      >
        {/* QR placeholder skeleton */}
        <div className="flex-shrink-0 w-[71px] h-[71px] rounded-xl bg-gray-200 animate-pulse" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-2.5 w-40 bg-gray-100 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
      </div>
    ),
  }
);

export default function ProfileShareModalLazy({ name, slug }) {
  return <ProfileShareModal name={name} slug={slug} />;
}
