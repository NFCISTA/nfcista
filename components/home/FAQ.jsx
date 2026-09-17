"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is an NFC business card?",
      a: "An NFC business card is a physical card embedded with a microchip that transmits your digital business profile wirelessly when tapped against an NFC-enabled smartphone.",
    },
    {
      q: "How does the NFC card work?",
      a: "Simply bring your card close to the back of a compatible smartphone. The phone's built-in NFC reader detects the card and automatically prompts to open your NFCISTA digital profile in the browser.",
    },
    {
      q: "Does the customer need an app?",
      a: "No. Customers can open your digital profile directly from the NFC link without installing a dedicated NFCISTA app.",
    },
    {
      q: "Can I save my contact?",
      a: "Yes. Every profile includes a 'Save Contact' button that downloads a standard vCard (.vcf) file directly into the client's phone address book with all your details.",
    },
    {
      q: "Can my digital profile be updated?",
      a: "Yes. Because the card links to your unique digital profile, your contact details, website, social handles, or address can be updated anytime without replacing the physical card.",
    },
    {
      q: "Can I add WhatsApp and Instagram?",
      a: "Yes. Your profile supports dedicated direct-action buttons for WhatsApp chat, Instagram profile, phone calls, email, and Google Reviews.",
    },
    {
      q: "How do I order an NFCISTA card?",
      a: "You can reach out to us via WhatsApp or contact inquiry. Choose your preferred card design, share your business details, and we'll prepare your card and digital profile.",
    },
    {
      q: "Does NFC work on every phone?",
      a: "NFC works on modern smartphones that include NFC hardware (including iPhones from iPhone XS onwards and the majority of modern Android phones). NFC must be turned on in the phone settings for Android devices. Note that NFC chip placement and behavior can vary by device manufacturer.",
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
