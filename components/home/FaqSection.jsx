export default function FaqSection() {
  const faqs = [
    {
      q: "Do customers need an app?",
      a: "No. Modern iPhones and Android smartphones detect the NFC chip natively. Tapping the stand or card immediately launches your destination link in the customer's default browser. A high-contrast QR backup is also included for older devices.",
    },
    {
      q: "Can I use my own logo and colors?",
      a: "Yes. Every piece is custom-crafted around your business identity. During the brief stage, you provide your logo and preferred branding, which we integrate into a visual proof before production.",
    },
    {
      q: "Can I change the link later?",
      a: "Yes. Your hardware points to your managed digital profile. You can update your Google review URL, phone numbers, menu, or social links from your account dashboard without needing to reorder physical hardware.",
    },
    {
      q: "How long is delivery?",
      a: "Turnaround times vary based on order size, custom design approval, and shipping destination. Once your design proof is finalized, our team provides an estimated delivery schedule with tracking.",
    },
    {
      q: "Bulk pricing for multiple branches?",
      a: "Yes. We support multi-counter retail rollouts, restaurant chains, and corporate teams with tailored volume pricing. Please submit an inquiry with your estimated count for custom tier options.",
    },
  ];

  return (
    <section id="faq" className="py-24 md:py-32 bg-ink border-b border-line">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="font-mono text-xs uppercase tracking-wider text-brand-text mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            <span>Common Questions</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-fg tracking-[-0.035em]">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-sm sm:text-base text-muted mt-3">
            Clear specifications on how our smart NFC hardware operates.
          </p>
        </div>

        {/* Native Details Accordion List */}
        <div className="max-w-3xl space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl bg-ink-alt border border-line p-5 sm:p-6 transition-colors open:border-line/90"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none select-none">
                <span className="font-display font-semibold text-base sm:text-lg text-fg group-open:text-brand-text transition-colors">
                  {faq.q}
                </span>
                <span
                  className="w-8 h-8 rounded-full bg-ink border border-line flex items-center justify-center text-dim group-hover:text-fg shrink-0 transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 pt-4 border-t border-line/60 font-sans text-sm text-muted leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
