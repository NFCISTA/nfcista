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
import Icon from "@/components/ui/Icon";

const SaveContactButton = dynamic(
  () => import("./SaveContactButton"),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        aria-label="Save contact"
        className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-accent-primary text-white font-semibold text-sm shadow-btn-primary opacity-90 cursor-wait select-none"
      >
        <Icon name="person_add" size={18} strokeWidth={2} className="text-white" />
        <span>Save Contact</span>
      </button>
    ),
  }
);

export default function SaveContactButtonLazy({ contact }) {
  return <SaveContactButton contact={contact} />;
}
