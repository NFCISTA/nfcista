"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is an NFC card?",
      a: "An NFC card is a physical card embedded with a contactless microchip. When held near any compatible smartphone, it wirelessly transmits your destination URL to open your digital business profile, Google review page, or WhatsApp chat directly in the phone's browser.",
    },
    {
      q: "Does the person tapping the card need to install an app?",
      a: "No. The recipient or customer does not need to install any app or register for any service. Modern iPhones and Android devices detect the card natively and open the destination link directly in their default web browser.",
    },
    {
      q: "What happens if someone has an older phone or NFC is switched off?",
      a: "Every NFCISTA card features a high-contrast backup QR code printed cleanly on the reverse side. Anyone can simply point their smartphone camera at the QR code to reach the exact same digital experience.",
    },
    {
      q: "Can my digital business profile or links be updated later?",
      a: "Yes. Because your physical card links to your digital profile, you can update your contact numbers, social links, and business details from your account dashboard without needing to replace or reprint your physical card.",
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-surface-subtle border-b border-border-hairline">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="neutral" dot={false} className="uppercase tracking-wider text-[11px] font-semibold mb-2">
            Technical Details
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-2.5">
            Clear, straightforward answers about our smart cards and how they operate.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const buttonId = `faq-btn-${idx}`;
            const panelId = `faq-answer-${idx}`;

            return (
              <div
                key={faq.q}
                className="bg-surface-elevated border border-border-hairline rounded-xl overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  id={buttonId}
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-surface-subtle transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-text-primary">
                    {faq.q}
                  </span>
                  <span
                    className={`w-7 h-7 rounded-md bg-surface-subtle border border-border-hairline flex items-center justify-center text-text-secondary shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <Icon name="ChevronDown" className="w-3.5 h-3.5" />
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border-hairline"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
