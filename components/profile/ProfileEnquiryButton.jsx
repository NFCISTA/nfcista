"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import ProfileEnquiryModal from "./ProfileEnquiryModal";

/**
 * ProfileEnquiryButton — Interactive CTA rendered on public profile
 * when enquiry_enabled = true. Opens the ProfileEnquiryModal.
 *
 * @param {{ name: string, slug: string }} props
 */
export default function ProfileEnquiryButton({ name, slug }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!slug) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full min-h-[44px] py-2.5 px-4 bg-surface-base hover:bg-surface-subtle border border-border-hairline hover:border-border-strong text-text-primary font-semibold rounded-lg shadow-2xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm mt-2 select-none"
        aria-label={`Send an enquiry to ${name}`}
      >
        <Icon name="mail" size={16} strokeWidth={2} className="text-text-secondary" />
        <span>Send Direct Enquiry</span>
      </button>

      <ProfileEnquiryModal
        name={name}
        slug={slug}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
