"use client";

/**
 * SaveContactButtonLazy
 *
 * Thin client-side wrapper that lazy-loads SaveContactButton after hydration.
 * This removes the 27 KB SaveContactButton module (including vCard logic and
 * SaveContactModal) from the initial JS bundle for /p/[slug].
 *
 * While loading, renders a visually identical placeholder button so the layout
 * does not shift and the CTA is visible immediately.
 */

import dynamic from "next/dynamic";

const SaveContactButton = dynamic(
  () => import("./SaveContactButton"),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        aria-label="Save contact"
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-primary text-white font-bold text-[15px] shadow-md opacity-90 cursor-wait"
      >
        <span
          className="material-symbols-outlined text-[20px] text-white"
          aria-hidden="true"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          person_add
        </span>
        Save Contact
      </button>
    ),
  }
);

export default function SaveContactButtonLazy({ contact }) {
  return <SaveContactButton contact={contact} />;
}
