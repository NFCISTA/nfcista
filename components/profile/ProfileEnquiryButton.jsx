"use client";

import { useState } from "react";
import ProfileIcon from "./ProfileIcon";
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
        className="w-full py-3.5 px-4 bg-[#071426] hover:bg-[#0c2240] text-white font-semibold rounded-2xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm mt-2.5"
        aria-label={`Send an enquiry to ${name}`}
      >
        <ProfileIcon name="mail" className="text-[18px]" aria-hidden={true} />
        <span>Send Enquiry</span>
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
