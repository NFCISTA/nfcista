"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is an NFC card?",
      a: "An NFC card is a physical card embedded with a microchip that wirelessly opens your digital profile, Google review page, or chat when tapped against a compatible smartphone.",
    },
    {
      q: "Does the customer need an app?",
      a: "No. Customers and clients do not need to install any app. Tapping the card opens your link directly in their phone's built-in web browser.",
    },
    {
      q: "Can I use QR if NFC doesn't work?",
      a: "Yes. Every NFCISTA card includes a printed QR code backup on the back, so older phones or devices with NFC disabled can simply scan to connect.",
    },
    {
      q: "Can my digital profile be updated later?",
      a: "Yes. Because your card connects to your digital profile, your phone number, social links, or business details can be updated without reprinting your physical card.",
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3">
            Clear, straightforward answers about our smart cards and how they work.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-card transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-surface-container-low/50 transition-colors"
                >
                  <span className="text-base sm:text-lg font-bold text-on-surface">
                    {faq.q}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      expand_more
                    </span>
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-body-md text-on-surface-variant leading-relaxed border-t border-outline-variant/10">
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
